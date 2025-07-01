import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { useAuthStore, ADMIN_TEST_CREDENTIALS } from '@/store/authStore';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [emailSent, setEmailSent] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    } else if (email.toLowerCase().trim() === ADMIN_TEST_CREDENTIALS.email) {
      newErrors.email = 'Admin password cannot be reset through this method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    try {
      await resetPassword(email.toLowerCase().trim());
      setEmailSent(true);
    } catch (error) {
      Alert.alert('Reset Failed', (error as Error).message || 'Failed to send reset email. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const isAdminEmail = email.toLowerCase().trim() === ADMIN_TEST_CREDENTIALS.email;

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.successContainer}>
            <View style={styles.iconContainer}>
              <Mail size={40} color={colors.primary} />
            </View>
            
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successSubtitle}>
              We've sent password reset instructions to{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>
            
            <Text style={styles.successDescription}>
              Follow the link in the email to reset your password. The link will expire in 24 hours.
            </Text>

            <Button
              title="Back to Sign In"
              onPress={handleBackToLogin}
              variant="primary"
              size="lg"
              style={styles.backToLoginButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
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
              <View style={styles.adminWarning}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.adminWarningText}>
                  Admin password cannot be reset through this method. Contact system administrator.
                </Text>
              </View>
            )}
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <Button
            title="Send Reset Instructions"
            onPress={handleResetPassword}
            variant="primary"
            size="lg"
            loading={isLoading}
            style={styles.resetButton}
            disabled={isAdminEmail}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.adminNote}>
          <Text style={styles.adminNoteText}>
            For admin password reset, please contact the system administrator or use the predefined admin credentials.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
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
  adminWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  adminWarningText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
    flex: 1,
    lineHeight: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: theme.spacing.xs,
  },
  resetButton: {
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
  // Success state styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
    color: colors.gray[800],
  },
  successDescription: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xxl,
  },
  backToLoginButton: {
    width: '100%',
  },
});