import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { AlertTriangle, Crown } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

interface UsageLimitIndicatorProps {
  type: 'customers' | 'quotes' | 'jobs';
  currentCount: number;
  showUpgradePrompt?: boolean;
}

export default function UsageLimitIndicator({ 
  type, 
  currentCount, 
  showUpgradePrompt = true 
}: UsageLimitIndicatorProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  if (!user) return null;

  const getLimitForType = () => {
    switch (type) {
      case 'customers':
        return user.subscriptionTier === 'free' ? 1 : 
               user.subscriptionTier === 'basic' ? 25 : Infinity;
      case 'quotes':
        return user.subscriptionTier === 'free' ? 1 : 
               user.subscriptionTier === 'basic' ? 50 : Infinity;
      case 'jobs':
        return user.subscriptionTier === 'free' ? 1 : 
               user.subscriptionTier === 'basic' ? 50 : Infinity;
      default:
        return 0;
    }
  };

  const limit = getLimitForType();
  const isUnlimited = limit === Infinity;
  const isAtLimit = currentCount >= limit;
  const isNearLimit = currentCount >= limit * 0.8; // 80% of limit

  const handleUpgrade = () => {
    router.push('/profile/billing/upgrade');
  };

  // Don't show indicator for unlimited plans
  if (isUnlimited) return null;

  const getStatusColor = () => {
    if (isAtLimit) return colors.error;
    if (isNearLimit) return colors.warning;
    return colors.success;
  };

  const getStatusText = () => {
    if (isAtLimit) return 'Limit reached';
    if (isNearLimit) return 'Near limit';
    return 'Available';
  };

  return (
    <View style={[styles.container, { borderColor: getStatusColor() }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            {isAtLimit && <AlertTriangle size={16} color={getStatusColor()} />}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          <Text style={styles.countText}>
            {currentCount} / {limit} {type}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((currentCount / limit) * 100, 100)}%`,
                  backgroundColor: getStatusColor()
                }
              ]} 
            />
          </View>
        </View>

        {(isAtLimit || isNearLimit) && showUpgradePrompt && (
          <TouchableOpacity style={styles.upgradePrompt} onPress={handleUpgrade}>
            <Crown size={16} color={colors.primary} />
            <Text style={styles.upgradeText}>
              {isAtLimit ? 'Upgrade to add more' : 'Upgrade for unlimited'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  content: {
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
  },
  progressContainer: {
    marginVertical: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  upgradeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
});