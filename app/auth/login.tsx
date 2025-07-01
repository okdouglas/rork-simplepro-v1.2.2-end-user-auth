import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Shield } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { useAuthStore, validatePassword, ADMIN_TEST_CREDENTIALS } from '@/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showAdminHint, setShowAdminHint] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Use the centralized password validation
    const isAdminEmail = email.toLowerCase().trim() === ADMIN_TEST_CREDENTIALS.email;
    const passwordError = validatePassword(password, isAdminEmail);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      await login(email.toLowerCase().trim(), password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message || 'Invalid email or password. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/reset-password');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  const handleAdminLogin = () => {
    setEmail(ADMIN_TEST_CREDENTIALS.email);
    setPassword(ADMIN_TEST_CREDENTIALS.password);
    setErrors({});
  };

  const toggleAdminHint = () => {
    setShowAdminHint(!showAdminHint);
  };

  const isAdminEmail = email.toLowerCase().trim() === ADMIN_TEST_CREDENTIALS.email;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your SimplePro account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.email && styles.inputError,
                  isAdminEmail && styles.adminInput
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.gray[400]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {isAdminEmail && (
                <View style={styles.adminIndicator}>
                  <Shield size={16} color={colors.primary} />
                  <Text style={styles.adminText}>Admin Account</Text>
                </View>
              )}
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput, 
                    errors.password && styles.inputError,
                    isAdminEmail && styles.adminInput
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.gray[400]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
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
              {isAdminEmail && (
                <Text style={styles.adminPasswordHint}>
                  Admin password requires: uppercase, lowercase, number, and special character
                </Text>
              )}
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              loading={isLoading}
              style={styles.loginButton}
            />

            {/* Admin Login Helper */}
            <View style={styles.adminSection}>
              <TouchableOpacity onPress={toggleAdminHint} style={styles.adminHintButton}>
                <Shield size={16} color={colors.gray[500]} />
                <Text style={styles.adminHintText}>Admin Access</Text>
              </TouchableOpacity>
              
              {showAdminHint && (
                <View style={styles.adminHintContainer}>
                  <Text style={styles.adminHintTitle}>Admin Test Credentials:</Text>
                  <Text style={styles.adminCredentials}>Email: {ADMIN_TEST_CREDENTIALS.email}</Text>
                  <Text style={styles.adminCredentials}>Password: {ADMIN_TEST_CREDENTIALS.password}</Text>
                  <TouchableOpacity onPress={handleAdminLogin} style={styles.useAdminButton}>
                    <Text style={styles.useAdminButtonText}>Use Admin Credentials</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
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
  adminInput: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
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
  adminIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  adminText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  adminPasswordHint: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: theme.spacing.xs,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  adminSection: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  adminHintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  adminHintText: {
    fontSize: 14,
    color: colors.gray[500],
    marginLeft: theme.spacing.xs,
  },
  adminHintContainer: {
    backgroundColor: colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  adminHintTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: theme.spacing.xs,
  },
  adminCredentials: {
    fontSize: 12,
    color: colors.gray[600],
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: theme.spacing.xs,
  },
  useAdminButton: {
    backgroundColor: colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  useAdminButtonText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  signUpText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
});