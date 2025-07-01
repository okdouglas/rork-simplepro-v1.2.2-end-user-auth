import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { CreditCard, Lock } from 'lucide-react-native';
import { createPaymentMethod } from '@/services/stripe';
import { STRIPE_ACCOUNT_ID } from '@/constants/stripe';

export default function AddPaymentMethodScreen() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Initialize Stripe
    initializeStripe();
  }, []);
  
  const initializeStripe = async () => {
    try {
      // In a real app, this would initialize Stripe SDK
      // For now, we'll just simulate initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsInitializing(false);
    } catch (err) {
      setError('Failed to initialize payment processor');
      setIsInitializing(false);
    }
  };
  
  const handleAddCard = async () => {
    // Basic validation
    if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }
    
    // Format validation
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Invalid Card Number', 'Please enter a valid 16-digit card number.');
      return;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      Alert.alert('Invalid Expiry Date', 'Please enter a valid expiry date (MM/YY).');
      return;
    }
    
    if (!/^\d{3,4}$/.test(cvv)) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV code (3 or 4 digits).');
      return;
    }
    
    // Create payment method
    setIsLoading(true);
    
    try {
      // In a real app, this would call Stripe API to create a payment method
      const [month, year] = expiryDate.split('/');
      
      const paymentMethod = await createPaymentMethod({
        number: cardNumber.replace(/\s/g, ''),
        exp_month: month,
        exp_year: year,
        cvc: cvv,
        name: cardholderName,
      });
      
      Alert.alert(
        'Card Added',
        'Your payment method has been added successfully.',
        [
          { 
            text: 'OK', 
            onPress: () => router.back()
          }
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to add payment method. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCardNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Add space after every 4 digits
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    
    // Limit to 16 digits (19 chars with spaces)
    return formatted.slice(0, 19);
  };
  
  const formatExpiryDate = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format as MM/YY
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    } else {
      return cleaned;
    }
  };

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initializing payment processor...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <CreditCard size={48} color={colors.danger} />
        <Text style={styles.errorText}>Payment Processor Error</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Button 
          title="Try Again" 
          onPress={initializeStripe}
          variant="primary"
          size="md"
          style={styles.retryButton}
        />
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add Payment Method' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardIllustration}>
            <CreditCard size={48} color={colors.primary} />
          </View>
          
          <Text style={styles.headerText}>Add Credit or Debit Card</Text>
          <Text style={styles.subHeaderText}>
            Your payment information is securely processed by Stripe.
          </Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardholderName}
                onChangeText={setCardholderName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: theme.spacing.md }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
          
          <Button
            title="Add Card"
            onPress={handleAddCard}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            style={styles.addButton}
          />
          
          <View style={styles.securityNote}>
            <Lock size={16} color={colors.gray[600]} />
            <Text style={styles.securityText}>
              Your payment information is encrypted and secure. We never store your full card details on our servers.
            </Text>
          </View>
          
          <View style={styles.supportedCards}>
            <Image 
              source={{ uri: 'https://i.imgur.com/QGTIO76.png' }}
              style={styles.cardLogo}
              resizeMode="contain"
            />
            <Image 
              source={{ uri: 'https://i.imgur.com/bkiVZfS.png' }}
              style={styles.cardLogo}
              resizeMode="contain"
            />
            <Image 
              source={{ uri: 'https://i.imgur.com/lqiBoVS.png' }}
              style={styles.cardLogo}
              resizeMode="contain"
            />
            <Image 
              source={{ uri: 'https://i.imgur.com/EPoJyQx.png' }}
              style={styles.cardLogo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.stripeText}>
            Powered by <Text style={styles.stripeBold}>Stripe</Text>
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
  cardIllustration: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.tertiary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subHeaderText: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: colors.gray[900],
    backgroundColor: colors.gray[50],
  },
  rowInputs: {
    flexDirection: 'row',
  },
  addButton: {
    marginTop: theme.spacing.md,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  securityText: {
    fontSize: 13,
    color: colors.gray[600],
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  supportedCards: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  cardLogo: {
    width: 50,
    height: 30,
    marginHorizontal: theme.spacing.sm,
  },
  stripeText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.gray[500],
    marginBottom: theme.spacing.xl,
  },
  stripeBold: {
    fontWeight: '600',
  },
});