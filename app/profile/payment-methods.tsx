import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { CreditCard, Plus, Trash2, AlertCircle } from 'lucide-react-native';
import { getCardBrandImage, getCardBrandName } from '@/constants/stripe';
import { deletePaymentMethod, getPaymentMethods, setDefaultPaymentMethod } from '@/services/stripe';

// Mock data for payment methods
const initialPaymentMethods = [
  {
    id: 'pm_123456',
    type: 'card',
    brand: 'visa',
    lastFour: '4242',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
  },
  {
    id: 'pm_123457',
    type: 'card',
    brand: 'mastercard',
    lastFour: '5555',
    expiryMonth: 8,
    expiryYear: 2025,
    isDefault: false,
  },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [methods, setMethods] = useState(initialPaymentMethods);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    loadPaymentMethods();
  }, []);
  
  const loadPaymentMethods = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, this would fetch payment methods from Stripe
      // For now, we'll just use the mock data
      const response = await getPaymentMethods('cus_123456');
      
      // Transform the response to match our data structure
      const formattedMethods = response.data.map(method => ({
        id: method.id,
        type: method.type,
        brand: method.card.brand,
        lastFour: method.card.last4,
        expiryMonth: method.card.exp_month,
        expiryYear: method.card.exp_year,
        isDefault: method.id === 'pm_123456', // Mock default
      }));
      
      setMethods(formattedMethods);
    } catch (err) {
      setError('Failed to load payment methods');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddPaymentMethod = () => {
    router.push('/profile/payment-methods/add');
  };
  
  const handleSetDefault = async (id) => {
    try {
      setIsUpdating(prev => ({ ...prev, [id]: true }));
      
      // In a real app, this would call Stripe API
      await setDefaultPaymentMethod('cus_123456', id);
      
      // Update local state
      setMethods(methods.map(method => ({
        ...method,
        isDefault: method.id === id,
      })));
    } catch (err) {
      Alert.alert('Error', 'Failed to set default payment method');
    } finally {
      setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
  };
  
  const handleDeletePaymentMethod = async (id) => {
    // Check if it's the default payment method
    const isDefault = methods.find(method => method.id === id)?.isDefault;
    
    if (isDefault) {
      Alert.alert(
        'Cannot Delete Default',
        'You cannot delete your default payment method. Please set another payment method as default first.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsUpdating(prev => ({ ...prev, [id]: true }));
              
              // In a real app, this would call Stripe API
              await deletePaymentMethod(id);
              
              // Update local state
              setMethods(methods.filter(method => method.id !== id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete payment method');
            } finally {
              setIsUpdating(prev => ({ ...prev, [id]: false }));
            }
          }
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertCircle size={48} color={colors.danger} />
        <Text style={styles.errorText}>Failed to load payment methods</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Button 
          title="Try Again" 
          onPress={loadPaymentMethods}
          variant="primary"
          size="md"
          style={styles.retryButton}
        />
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Payment Methods' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Payment Methods</Text>
            
            {methods.length === 0 ? (
              <View style={styles.emptyState}>
                <CreditCard size={48} color={colors.gray[400]} />
                <Text style={styles.emptyStateText}>No payment methods found</Text>
                <Text style={styles.emptyStateSubtext}>Add a payment method to manage your subscription</Text>
              </View>
            ) : (
              methods.map((method) => (
                <View key={method.id} style={styles.paymentMethodCard}>
                  <View style={styles.cardBrandContainer}>
                    <Image 
                      source={{ uri: getCardBrandImage(method.brand) }}
                      style={styles.cardBrandImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardNumber}>
                      {getCardBrandName(method.brand)} •••• {method.lastFour}
                    </Text>
                    <Text style={styles.cardExpiry}>
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    {method.isDefault ? (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={styles.setDefaultButton}
                        onPress={() => handleSetDefault(method.id)}
                        disabled={isUpdating[method.id]}
                      >
                        {isUpdating[method.id] ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <Text style={styles.setDefaultText}>Set Default</Text>
                        )}
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeletePaymentMethod(method.id)}
                      disabled={isUpdating[method.id]}
                    >
                      {isUpdating[method.id] ? (
                        <ActivityIndicator size="small" color={colors.danger} />
                      ) : (
                        <Trash2 size={18} color={colors.danger} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
            
            <Button
              title="Add Payment Method"
              onPress={handleAddPaymentMethod}
              variant="outline"
              size="md"
              icon={<Plus size={18} color={colors.primary} />}
              style={styles.addButton}
            />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Security</Text>
            <Text style={styles.securityText}>
              SimplePro uses Stripe for secure payment processing. Your payment information is encrypted and stored securely. We never store your full card details on our servers.
            </Text>
            <View style={styles.securityBadges}>
              <Image 
                source={{ uri: 'https://i.imgur.com/8XOxvVH.png' }} // PCI Compliance badge
                style={styles.securityBadge}
                resizeMode="contain"
              />
              <Image 
                source={{ uri: 'https://i.imgur.com/JYidDXd.png' }} // Stripe badge
                style={styles.securityBadge}
                resizeMode="contain"
              />
            </View>
          </View>
          
          <Text style={styles.footerText}>
            Your default payment method will be used for subscription renewals and any additional charges.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: theme.spacing.lg,
  },
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
  },
  errorSubtext: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.tertiary,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[700],
    marginTop: theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: theme.spacing.md,
  },
  cardBrandContainer: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  cardBrandImage: {
    width: 40,
    height: 25,
  },
  cardDetails: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
  },
  cardExpiry: {
    fontSize: 14,
    color: colors.gray[600],
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    marginBottom: 8,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[700],
  },
  setDefaultButton: {
    marginBottom: 8,
  },
  setDefaultText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    marginTop: theme.spacing.sm,
  },
  securityText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  securityBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.sm,
  },
  securityBadge: {
    width: 120,
    height: 40,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.gray[500],
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
});