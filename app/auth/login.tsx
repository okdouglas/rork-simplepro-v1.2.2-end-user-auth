import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, Shield, User } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      const result = await login(email.trim(), password);
      
      if (result.user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    }
  };

  const handleFillAdminCredentials = () => {
    setEmail('admin@simplepro.com');
    setPassword('Admin007!');
  };

  const handleFillTestUserCredentials = () => {
    setEmail('testuser@simplepro.com');
    setPassword('TestUser123!');
  };

  const handleForgotPassword = () => {
    router.push('/auth/reset-password');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your SimplePro account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={colors.gray[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={colors.gray[500]}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={colors.gray[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={colors.gray[500]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.gray[500]} />
                  ) : (
                    <Eye size={20} color={colors.gray[500]} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Demo Accounts</Text>
              
              <TouchableOpacity 
                onPress={handleFillAdminCredentials}
                style={styles.demoButton}
              >
                <Shield size={16} color={colors.primary} />
                <Text style={styles.demoButtonText}>Admin Account</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleFillTestUserCredentials}
                style={styles.demoButton}
              >
                <User size={16} color={colors.secondary} />
                <Text style={styles.demoButtonText}>Test User (Sample Data)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
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
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
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
    width: '100%',
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: theme.spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[900],
  },
  eyeIcon: {
    padding: theme.spacing.xs,
  },
  errorContainer: {
    backgroundColor: colors.error + '10',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: theme.spacing.xl,
  },
  demoSection: {
    backgroundColor: colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  demoButtonText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  signUpLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});