import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { useAuthStore, validatePassword, ADMIN_TEST_CREDENTIALS } from '@/store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    } else if (formData.email.toLowerCase().trim() === ADMIN_TEST_CREDENTIALS.email) {
      newErrors.email = 'Cannot register with admin email address';
    }
    
    // Use centralized password validation for basic checks
    const basicPasswordError = validatePassword(formData.password, false);
    if (basicPasswordError) {
      newErrors.password = basicPasswordError;
    } else {
      // Additional validation for user registration (stricter than login)
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters for new accounts';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      await register(
        formData.email.toLowerCase().trim(),
        formData.password,
        formData.companyName.trim()
      );
      router.push('/auth/verify-email');
    } catch (error) {
      Alert.alert('Registration Failed', (error as Error).message || 'An error occurred during registration. Please try again.');
    }
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isAdminEmail = formData.email.toLowerCase().trim() === ADMIN_TEST_CREDENTIALS.email;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Start managing your business today</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Company Name</Text>
                <TextInput
                  style={[styles.input, errors.companyName && styles.inputError]}
                  placeholder="Enter your company name"
                  placeholderTextColor={colors.gray[400]}
                  value={formData.companyName}
                  onChangeText={(text) => updateField('companyName', text)}
                  autoCapitalize="words"
                />
                {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input, 
                    errors.email && styles.inputError,
                    isAdminEmail && styles.adminWarningInput
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.gray[400]}
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {isAdminEmail && (
                  <View style={styles.adminWarning}>
                    <AlertCircle size={16} color={colors.error} />
                    <Text style={styles.adminWarningText}>
                      Admin email cannot be used for registration
                    </Text>
                  </View>
                )}
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, errors.password && styles.inputError]}
                    placeholder="Create a password"
                    placeholderTextColor={colors.gray[400]}
                    value={formData.password}
                    onChangeText={(text) => updateField('password', text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.gray[500]} />
                    ) : (
                      <Eye size={20} color={colors.gray[500]} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.passwordRequirements}>
                  Password must be at least 8 characters with uppercase, lowercase, and number
                </Text>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.gray[400]}
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateField('confirmPassword', text)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.gray[500]} />
                    ) : (
                      <Eye size={20} color={colors.gray[500]} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.linkText}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </View>

              <Button
                title="Create Account"
                onPress={handleRegister}
                variant="primary"
                size="lg"
                loading={isLoading}
                style={styles.registerButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleSignIn}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.adminNote}>
              <Text style={styles.adminNoteText}>
                Note: Admin accounts cannot be created through registration.{'\n'}
                Use the admin login credentials on the sign-in page.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    minHeight: '100%',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: theme.spacing.xs,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  adminWarningInput: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  eyeButton: {
    position: 'absolute',
    right: theme.spacing.md,
    top: 15,
  },
  passwordRequirements: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  adminWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  adminWarningText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: theme.spacing.xs,
  },
  termsContainer: {
    marginBottom: theme.spacing.lg,
  },
  termsText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '500',
  },
  registerButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  footerText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  signInText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  adminNote: {
    backgroundColor: colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  adminNoteText: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 18,
  },
});