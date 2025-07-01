import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { LOGO_URL } from '@/constants/logo';
import Button from '@/components/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} />
          <Text style={styles.title}>SimplePro</Text>
          <Text style={styles.subtitle}>Professional Contractor Management</Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Everything you need to run your business</Text>
          
          <View style={styles.feature}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Manage customers and projects</Text>
          </View>
          
          <View style={styles.feature}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Create professional quotes</Text>
          </View>
          
          <View style={styles.feature}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Schedule and track jobs</Text>
          </View>
          
          <View style={styles.feature}>
            <View style={styles.featureBullet} />
            <Text style={styles.featureText}>Get paid faster</Text>
          </View>
        </View>

        <View style={styles.ctaContainer}>
          <Button
            title="Get Started Free"
            onPress={handleRegister}
            variant="primary"
            size="lg"
            style={styles.primaryButton}
          />
          
          <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.freeTrialText}>
          Start with 1 customer, 1 quote, and 1 job for free.{'\n'}
          No credit card required.
        </Text>
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
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
  },
  featuresContainer: {
    marginVertical: theme.spacing.xl,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[800],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: theme.spacing.md,
  },
  featureText: {
    fontSize: 16,
    color: colors.gray[700],
  },
  ctaContainer: {
    marginBottom: theme.spacing.lg,
  },
  primaryButton: {
    marginBottom: theme.spacing.md,
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  loginButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  freeTrialText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
});