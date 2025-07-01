import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useCustomerStore } from '@/store/customerStore';
import { CustomerSegment, CommunicationPreference } from '@/types';
import Button from '@/components/Button';

export default function AddCustomerScreen() {
  const router = useRouter();
  const { addCustomer } = useCustomerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('OK'); // Default to Oklahoma
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');
  const [segment, setSegment] = useState<CustomerSegment>('new');
  const [source, setSource] = useState('website');
  const [communicationPreference, setCommunicationPreference] = useState<CommunicationPreference>('email');
  const [isCommercial, setIsCommercial] = useState(false);
  const [propertySize, setPropertySize] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(phone)) {
      newErrors.phone = 'Phone format should be (XXX) XXX-XXXX';
    }
    
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email format is invalid';
    }
    
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!zip.trim()) {
      newErrors.zip = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      newErrors.zip = 'ZIP code format is invalid';
    }
    
    if (propertySize && isNaN(Number(propertySize))) {
      newErrors.propertySize = 'Property size must be a number';
    }
    
    if (yearBuilt && (isNaN(Number(yearBuilt)) || Number(yearBuilt) < 1900 || Number(yearBuilt) > new Date().getFullYear())) {
      newErrors.yearBuilt = 'Year built is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newCustomer = {
        name,
        phone,
        email: email || undefined,
        address,
        city,
        state,
        zip,
        notes: notes || undefined,
        segment,
        source: source as any,
        communicationPreference,
        property: {
          type: isCommercial ? 'commercial' as const : 'residential' as const,
          size: propertySize ? Number(propertySize) : undefined,
          yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
          equipment: [],
        },
        lifetimeValue: 0,
        totalJobs: 0,
      };
      
      const customer = await addCustomer(newCustomer);
      router.replace(`/customers/${customer.id}`);
    } catch (error) {
      console.error('Failed to add customer:', error);
      setErrors({ submit: 'Failed to add customer. Please try again.' });
    } finally {
      setIsSubmitting(false);
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
  
  const segmentOptions: Array<{ value: CustomerSegment; label: string }> = [
    { value: 'new', label: 'New Customer' },
    { value: 'recurring', label: 'Recurring Customer' },
    { value: 'vip', label: 'VIP Customer' },
    { value: 'at_risk', label: 'At Risk Customer' },
  ];
  
  const sourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'google', label: 'Google' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'direct', label: 'Direct Contact' },
    { value: 'other', label: 'Other' },
  ];
  
  const communicationOptions: Array<{ value: CommunicationPreference; label: string }> = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'call', label: 'Phone Call' },
    { value: 'any', label: 'Any Method' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{ 
          title: 'Add New Customer',
          headerBackTitle: 'Cancel',
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="John Smith"
              placeholderTextColor={colors.gray[400]}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="(405) 555-1234"
              placeholderTextColor={colors.gray[400]}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={setEmail}
              placeholder="john.smith@example.com"
              placeholderTextColor={colors.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
        </View>
        
        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              value={address}
              onChangeText={setAddress}
              placeholder="123 Main St"
              placeholderTextColor={colors.gray[400]}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              value={city}
              onChangeText={setCity}
              placeholder="Norman"
              placeholderTextColor={colors.gray[400]}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>
          
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: theme.spacing.sm }]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={[styles.input, errors.state && styles.inputError]}
                value={state}
                onChangeText={setState}
                placeholder="OK"
                placeholderTextColor={colors.gray[400]}
                maxLength={2}
                autoCapitalize="characters"
              />
              {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>
            
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>ZIP Code *</Text>
              <TextInput
                style={[styles.input, errors.zip && styles.inputError]}
                value={zip}
                onChangeText={setZip}
                placeholder="73072"
                placeholderTextColor={colors.gray[400]}
                keyboardType="number-pad"
                maxLength={10}
              />
              {errors.zip && <Text style={styles.errorText}>{errors.zip}</Text>}
            </View>
          </View>
        </View>
        
        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Customer Segment</Text>
            <View style={styles.segmentContainer}>
              {segmentOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.segmentOption,
                    segment === option.value && styles.segmentOptionSelected,
                  ]}
                  onPress={() => setSegment(option.value)}
                >
                  <Text
                    style={[
                      styles.segmentOptionText,
                      segment === option.value && styles.segmentOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Customer Source</Text>
            <View style={styles.sourceContainer}>
              {sourceOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sourceOption,
                    source === option.value && styles.sourceOptionSelected,
                  ]}
                  onPress={() => setSource(option.value)}
                >
                  <Text
                    style={[
                      styles.sourceOptionText,
                      source === option.value && styles.sourceOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Preferred Communication</Text>
            <View style={styles.communicationContainer}>
              {communicationOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.communicationOption,
                    communicationPreference === option.value && styles.communicationOptionSelected,
                  ]}
                  onPress={() => setCommunicationPreference(option.value)}
                >
                  <Text
                    style={[
                      styles.communicationOptionText,
                      communicationPreference === option.value && styles.communicationOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        {/* Property Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Information</Text>
          
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Commercial Property</Text>
              <Switch
                value={isCommercial}
                onValueChange={setIsCommercial}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: theme.spacing.sm }]}>
              <Text style={styles.label}>Property Size (sq ft)</Text>
              <TextInput
                style={[styles.input, errors.propertySize && styles.inputError]}
                value={propertySize}
                onChangeText={setPropertySize}
                placeholder="2000"
                placeholderTextColor={colors.gray[400]}
                keyboardType="number-pad"
              />
              {errors.propertySize && <Text style={styles.errorText}>{errors.propertySize}</Text>}
            </View>
            
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Year Built</Text>
              <TextInput
                style={[styles.input, errors.yearBuilt && styles.inputError]}
                value={yearBuilt}
                onChangeText={setYearBuilt}
                placeholder="2010"
                placeholderTextColor={colors.gray[400]}
                keyboardType="number-pad"
                maxLength={4}
              />
              {errors.yearBuilt && <Text style={styles.errorText}>{errors.yearBuilt}</Text>}
            </View>
          </View>
        </View>
        
        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          
          <View style={styles.formGroup}>
            <TextInput
              style={[styles.textArea, errors.notes && styles.inputError]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes about this customer..."
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          {errors.submit && <Text style={styles.submitError}>{errors.submit}</Text>}
          
          <Button
            title={isSubmitting ? 'Adding Customer...' : 'Add Customer'}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.md,
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
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
  textArea: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: colors.gray[800],
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  segmentOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  segmentOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentOptionText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  segmentOptionTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  sourceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sourceOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  sourceOptionSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  sourceOptionText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  sourceOptionTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  communicationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  communicationOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  communicationOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  communicationOptionText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  communicationOptionTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
  submitError: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
});