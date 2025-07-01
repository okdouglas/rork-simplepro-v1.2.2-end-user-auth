import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, RefreshCw } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user, verifyEmail, isLoading } = useAuthStore();
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerifyEmail = async () => {
    try {
      // In a real app, you'd get the token from a deep link or user input
      const mockToken = 'verification_token_123';
      await verifyEmail(mockToken);
      router.replace('/onboarding/welcome');
    } catch (error) {
      Alert.alert('Verification Failed', 'Invalid verification token. Please try again.');
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      // In a real app, this would resend the verification email
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      Alert.alert('Email Sent', 'A new verification email has been sent to your inbox.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangeEmail = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Mail size={40} color={colors.primary} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to{'\n'}
            <Text style={styles.email}>{user?.email}</Text>
          </Text>
          <Text style={styles.description}>
            Click the link in the email to verify your account and get started with SimplePro.
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <Button
            title="I've Verified My Email"
            onPress={handleVerifyEmail}
            variant="primary"
            size="lg"
            loading={isLoading}
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the email?</Text>
            <TouchableOpacity 
              onPress={handleResendEmail}
              disabled={resendLoading}
              style={styles.resendButton}
            >
              <RefreshCw 
                size={16} 
                color={resendLoading ? colors.gray[400] : colors.primary} 
                style={resendLoading ? styles.spinning : undefined}
              />
              <Text style={[styles.resendButtonText, resendLoading && styles.resendButtonTextDisabled]}>
                Resend Email
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleChangeEmail} style={styles.changeEmailButton}>
            <Text style={styles.changeEmailText}>Change Email Address</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Having trouble? Check your spam folder or contact support for help.
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.xxl,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
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
  description: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  verifyButton: {
    marginBottom: theme.spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  resendText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  resendButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  resendButtonTextDisabled: {
    color: colors.gray[400],
  },
  spinning: {
    // In a real app, you'd add rotation animation here
  },
  changeEmailButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  changeEmailText: {
    fontSize: 14,
    color: colors.gray[500],
    textDecorationLine: 'underline',
  },
  helpContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  helpText: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
    lineHeight: 18,
  },
});