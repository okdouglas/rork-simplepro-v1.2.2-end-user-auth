import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, Users, FileText, Briefcase, Settings, LogOut, Database, Activity, TrendingUp, Clock } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout, isAdmin, hasAdminPermission, isSessionValid, getSessionTimeRemaining } = useAuthStore();

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin()) {
      router.replace('/auth/login');
    }
  }, [isAdmin, router]);

  const handleLogout = async () => {
    Alert.alert(
      'Admin Logout',
      'Are you sure you want to logout from the admin account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  const handleResetSampleData = () => {
    Alert.alert(
      'Reset Sample Data',
      'This will reset all sample data to default values. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call an API to reset sample data
            Alert.alert('Success', 'Sample data has been reset successfully.');
          }
        }
      ]
    );
  };

  if (!isAdmin()) {
    return null; // Will redirect
  }

  const sessionTimeRemaining = getSessionTimeRemaining();
  const sessionHours = Math.floor(sessionTimeRemaining / (1000 * 60 * 60));
  const sessionMinutes = Math.floor((sessionTimeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  const adminStats = [
    { title: 'Total Users', value: '1,234', icon: Users, color: colors.primary, trend: '+12%' },
    { title: 'Active Quotes', value: '567', icon: FileText, color: colors.secondary, trend: '+8%' },
    { title: 'Active Jobs', value: '89', icon: Briefcase, color: colors.success, trend: '+15%' },
    { title: 'System Health', value: '99.9%', icon: Shield, color: colors.warning, trend: 'Stable' },
  ];

  const adminActions = [
    { 
      title: 'User Management', 
      description: 'Manage user accounts and permissions', 
      icon: Users,
      permission: 'USER_MANAGEMENT',
      action: () => Alert.alert('Feature', 'User management interface coming soon')
    },
    { 
      title: 'System Settings', 
      description: 'Configure system-wide settings', 
      icon: Settings,
      permission: 'SYSTEM_MANAGEMENT',
      action: () => Alert.alert('Feature', 'System settings interface coming soon')
    },
    { 
      title: 'Database Management', 
      description: 'Backup, restore, and manage database', 
      icon: Database,
      permission: 'SYSTEM_MANAGEMENT',
      action: handleResetSampleData
    },
    { 
      title: 'Analytics Dashboard', 
      description: 'View detailed system analytics', 
      icon: TrendingUp,
      permission: 'ANALYTICS_ACCESS',
      action: () => Alert.alert('Feature', 'Analytics dashboard coming soon')
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.adminBadge}>
                <Shield size={20} color={colors.white} />
              </View>
              <View>
                <Text style={styles.welcomeText}>Admin Dashboard</Text>
                <Text style={styles.emailText}>{user?.email}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={20} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          {/* Session Info */}
          <View style={styles.sessionInfo}>
            <View style={styles.sessionIndicator}>
              <Clock size={16} color={colors.primary} />
              <Text style={styles.sessionText}>
                Session: {sessionHours}h {sessionMinutes}m remaining
              </Text>
            </View>
            <View style={[styles.sessionStatus, isSessionValid() ? styles.sessionActive : styles.sessionExpiring]}>
              <Text style={styles.sessionStatusText}>
                {isSessionValid() ? 'Active' : 'Expiring Soon'}
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>System Overview</Text>
            <View style={styles.statsGrid}>
              {adminStats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                      <stat.icon size={24} color={stat.color} />
                    </View>
                    <View style={styles.statTrend}>
                      <Text style={[styles.trendText, { color: stat.trend.includes('+') ? colors.success : colors.gray[500] }]}>
                        {stat.trend}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Admin Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Admin Actions</Text>
            <View style={styles.actionsList}>
              {adminActions.map((action, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.actionCard,
                    !hasAdminPermission(action.permission) && styles.actionCardDisabled
                  ]}
                  onPress={hasAdminPermission(action.permission) ? action.action : undefined}
                  disabled={!hasAdminPermission(action.permission)}
                >
                  <View style={styles.actionIcon}>
                    <action.icon 
                      size={24} 
                      color={hasAdminPermission(action.permission) ? colors.primary : colors.gray[400]} 
                    />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={[
                      styles.actionTitle,
                      !hasAdminPermission(action.permission) && styles.actionTitleDisabled
                    ]}>
                      {action.title}
                    </Text>
                    <Text style={[
                      styles.actionDescription,
                      !hasAdminPermission(action.permission) && styles.actionDescriptionDisabled
                    ]}>
                      {action.description}
                    </Text>
                  </View>
                  {hasAdminPermission(action.permission) && (
                    <View style={styles.actionIndicator}>
                      <Activity size={16} color={colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <Button
                title="View All Users"
                onPress={() => Alert.alert('Feature', 'User list coming soon')}
                variant="outline"
                size="sm"
                style={styles.quickActionButton}
              />
              <Button
                title="System Logs"
                onPress={() => Alert.alert('Feature', 'System logs coming soon')}
                variant="outline"
                size="sm"
                style={styles.quickActionButton}
              />
              <Button
                title="Reset Sample Data"
                onPress={handleResetSampleData}
                variant="primary"
                size="sm"
                style={styles.quickActionButton}
              />
            </View>
          </View>

          {/* Admin Info */}
          <View style={styles.adminInfo}>
            <Text style={styles.adminInfoTitle}>Admin Account Information</Text>
            <View style={styles.adminInfoContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User Type:</Text>
                <Text style={styles.infoValue}>{user?.userType}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Subscription:</Text>
                <Text style={styles.infoValue}>{user?.subscriptionTier}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Login:</Text>
                <Text style={styles.infoValue}>
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Created:</Text>
                <Text style={styles.infoValue}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Permissions:</Text>
                <Text style={styles.infoValue}>Full System Access</Text>
              </View>
            </View>
          </View>
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
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  emailText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  logoutButton: {
    padding: theme.spacing.sm,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: theme.spacing.xs,
  },
  sessionStatus: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  sessionActive: {
    backgroundColor: colors.success + '20',
  },
  sessionExpiring: {
    backgroundColor: colors.warning + '20',
  },
  sessionStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[700],
  },
  statsContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTrend: {
    alignItems: 'flex-end',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: 12,
    color: colors.gray[600],
  },
  actionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  actionsList: {
    gap: theme.spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardDisabled: {
    opacity: 0.6,
    backgroundColor: colors.gray[50],
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: theme.spacing.xs,
  },
  actionTitleDisabled: {
    color: colors.gray[500],
  },
  actionDescription: {
    fontSize: 14,
    color: colors.gray[600],
  },
  actionDescriptionDisabled: {
    color: colors.gray[400],
  },
  actionIndicator: {
    marginLeft: theme.spacing.sm,
  },
  quickActionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '30%',
  },
  adminInfo: {
    backgroundColor: colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  adminInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: theme.spacing.sm,
  },
  adminInfoContent: {
    gap: theme.spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.gray[800],
    fontWeight: '400',
  },
});