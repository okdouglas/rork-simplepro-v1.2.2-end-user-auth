import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Save, MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useBusinessStore } from '@/store/businessStore';
import Button from '@/components/Button';

export default function BusinessInformationScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useBusinessStore();
  
  const [businessName, setBusinessName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [logo, setLogo] = useState(profile.logo || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    if (!businessName.trim()) {
      Alert.alert('Error', 'Business name is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateProfile({
        name: businessName,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        logo: logo || undefined,
      });
      
      Alert.alert('Success', 'Business information updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update business information');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 0) {
      return '';
    } else if (cleaned.length <= 3) {
      return `(${cleaned}`;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };
  
  const handlePhoneChange = (value: string) => {
    setPhone(formatPhoneNumber(value));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{ 
          title: 'Business Information',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>
                  {businessName.substring(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changeLogoText}>Upload Business Logo</Text>
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Your business name"
              placeholderTextColor={colors.gray[400]}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="business@example.com"
              placeholderTextColor={colors.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="(405) 555-1234"
              placeholderTextColor={colors.gray[400]}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Address</Text>
            <View style={styles.addressInputContainer}>
              <TextInput
                style={styles.addressInput}
                value={address}
                onChangeText={setAddress}
                placeholder="123 Main St, Norman, OK 73072"
                placeholderTextColor={colors.gray[400]}
                multiline
              />
              <MapPin size={20} color={colors.gray[400]} />
            </View>
          </View>
        </View>
        
        <Button
          title="Save Changes"
          onPress={handleSave}
          variant="primary"
          size="lg"
          icon={<Save size={18} color={colors.white} />}
          loading={isLoading}
          style={styles.saveButton}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: colors.gray[300],
    position: 'relative',
    backgroundColor: colors.white,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  changeLogoText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginTop: theme.spacing.sm,
  },
  formSection: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: colors.gray[800],
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[800],
    paddingRight: theme.spacing.sm,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
});