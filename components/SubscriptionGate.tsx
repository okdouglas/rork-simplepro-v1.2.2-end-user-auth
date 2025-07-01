import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { Lock, Crown, Zap } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

interface SubscriptionGateProps {
  feature: string;
  title: string;
  description: string;
  requiredTier: 'basic' | 'pro' | 'enterprise';
  children?: React.ReactNode;
  showModal?: boolean;
  onClose?: () => void;
}

const TIER_INFO = {
  basic: {
    name: 'Basic',
    price: '$9.99/month',
    icon: <Zap size={24} color={colors.blue[600]} />,
    color: colors.blue[600],
    bgColor: colors.blue[50],
  },
  pro: {
    name: 'Pro',
    price: '$19.99/month',
    icon: <Crown size={24} color={colors.purple[600]} />,
    color: colors.purple[600],
    bgColor: colors.purple[50],
  },
  enterprise: {
    name: 'Enterprise',
    price: '$39.99/month',
    icon: <Crown size={24} color={colors.orange[600]} />,
    color: colors.orange[600],
    bgColor: colors.orange[50],
  },
};

export default function SubscriptionGate({
  feature,
  title,
  description,
  requiredTier,
  children,
  showModal = false,
  onClose,
}: SubscriptionGateProps) {
  const router = useRouter();
  const { user, isFeatureAvailable } = useAuthStore();

  const tierInfo = TIER_INFO[requiredTier];
  const hasAccess = isFeatureAvailable(feature);

  const handleUpgrade = () => {
    if (onClose) onClose();
    router.push('/profile/billing/upgrade');
  };

  // If user has access, render children
  if (hasAccess && children) {
    return <>{children}</>;
  }

  // If no modal requested and no access, render inline gate
  if (!showModal && !hasAccess) {
    return (
      <View style={styles.inlineGate}>
        <View style={[styles.inlineHeader, { backgroundColor: tierInfo.bgColor }]}>
          <Lock size={20} color={tierInfo.color} />
          <Text style={[styles.inlineTitle, { color: tierInfo.color }]}>
            {tierInfo.name} Feature
          </Text>
        </View>
        <Text style={styles.inlineDescription}>{description}</Text>
        <Button
          title={`Upgrade to ${tierInfo.name}`}
          onPress={handleUpgrade}
          variant="outline"
          size="sm"
          style={[styles.inlineButton, { borderColor: tierInfo.color }]}
          textStyle={{ color: tierInfo.color }}
        />
      </View>
    );
  }

  // Modal version
  return (
    <Modal
      visible={showModal && !hasAccess}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { backgroundColor: tierInfo.bgColor }]}>
            <View style={styles.modalIconContainer}>
              {tierInfo.icon}
            </View>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalSubtitle}>
              Requires {tierInfo.name} Plan ({tierInfo.price})
            </Text>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>{description}</Text>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>
                Upgrade to {tierInfo.name} and unlock:
              </Text>
              
              {requiredTier === 'basic' && (
                <>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>Up to 25 customers</Text>
                  </View>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>Up to 50 quotes</Text>
                  </View>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>Email notifications</Text>
                  </View>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>Basic reports</Text>
                  </View>
                </>
              )}

              {requiredTier === 'pro' && (
                <>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>Unlimited customers & quotes</Text>
                  </View>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>SMS notifications</Text>
                  </View>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>Advanced reports</Text>
                  </View>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>Custom branding</Text>
                  </View>
                </>
              )}

              {requiredTier === 'enterprise' && (
                <>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>Everything in Pro</Text>
                  </View>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>Priority support</Text>
                  </View>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>Custom integrations</Text>
                  </View>
                  <View style={styles.benefit}>
                    <View style={styles.benefitBullet} />
                    <Text style={styles.benefitText}>White label options</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              title={`Upgrade to ${tierInfo.name}`}
              onPress={handleUpgrade}
              variant="primary"
              size="lg"
              style={[styles.upgradeButton, { backgroundColor: tierInfo.color }]}
            />
            
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Inline gate styles
  inlineGate: {
    backgroundColor: colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  inlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  inlineDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  inlineButton: {
    alignSelf: 'flex-start',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  modalContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.gray[700],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  benefitsContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.md,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  benefitBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green[500],
    marginRight: theme.spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  modalActions: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  upgradeButton: {
    marginBottom: theme.spacing.md,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.gray[500],
    fontWeight: '500',
  },
});