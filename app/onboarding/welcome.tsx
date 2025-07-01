import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { LOGO_URL } from '@/constants/logo';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleGetStarted = () => {
    router.push('/onboarding/business-setup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} />
          <Text style={styles.title}>Welcome to SimplePro!</Text>
          <Text style={styles.subtitle}>
            Hi {user?.businessProfile.companyName}! Let's get your business set up in just a few steps.
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>What we'll set up together:</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Business Profile</Text>
              <Text style={styles.stepDescription}>Add your company details and contact information</Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>First Customer</Text>
              <Text style={styles.stepDescription}>Add your first customer to get started</Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Create a Quote</Text>
              <Text style={styles.stepDescription}>Learn how to create professional quotes</Text>
            </View>
          </View>
        </View>

        <View style={styles.freeTrialContainer}>
          <View style={styles.freeTrialBadge}>
            <Text style={styles.freeTrialText}>FREE TRIAL</Text>
          </View>
          <Text style={styles.freeTrialDescription}>
            You're starting with our free plan:{'\n'}
            1 customer • 1 quote • 1 job
          </Text>
          <Text style={styles.upgradeText}>
            Upgrade anytime to unlock unlimited customers, quotes, and advanced features.
          </Text>
        </View>

        <Button
          title="Let's Get Started"
          onPress={handleGetStarted}
          variant="primary"
          size="lg"
          style={styles.getStartedButton}
        />
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
    paddingVertical: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: theme.spacing.md,
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
    lineHeight: 24,
  },
  stepsContainer: {
    marginVertical: theme.spacing.xl,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  freeTrialContainer: {
    backgroundColor: colors.green[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  freeTrialBadge: {
    backgroundColor: colors.green[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
  },
  freeTrialText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  freeTrialDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.green[800],
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  upgradeText: {
    fontSize: 14,
    color: colors.green[700],
    textAlign: 'center',
    lineHeight: 20,
  },
  getStartedButton: {
    marginBottom: theme.spacing.lg,
  },
});