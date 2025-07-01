import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, Users, FileText, Briefcase, Settings, LogOut } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/Button';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuthStore();

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin()) {
      router.replace('/auth/login');
    }
  }, [isAdmin, router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  if (!isAdmin()) {
    return null; // Will redirect
  }

  const adminStats = [
    { title: 'Total Users', value: '1,234', icon: Users, color: colors.primary },
    { title: 'Active Quotes', value: '567', icon: FileText, color: colors.secondary },
    { title: 'Active Jobs', value: '89', icon: Briefcase, color: colors.success },
    { title: 'System Health', value: '99.9%', icon: Shield, color: colors.warning },
  ];

  const adminActions = [
    { title: 'User Management', description: 'Manage user accounts and permissions', icon: Users },
    { title: 'System Settings', description: 'Configure system-wide settings', icon: Settings },
    { title: 'Billing Management', description: 'Manage subscriptions and billing', icon: FileText },
    { title: 'Support Dashboard', description: 'View and manage support tickets', icon: Shield },
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
                <Text style={styles.welcomeText}>Welcome back, Admin</Text>
                <Text style={styles.emailText}>{user?.email}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={20} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>System Overview</Text>
            <View style={styles.statsGrid}>
              {adminStats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                    <stat.icon size={24} color={stat.color} />
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
                <TouchableOpacity key={index} style={styles.actionCard}>
                  <View style={styles.actionIcon}>
                    <action.icon size={24} color={colors.primary} />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </View>
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
                onPress={() => {/* Navigate to users */}}
                variant="outline"
                size="sm"
                style={styles.quickActionButton}
              />
              <Button
                title="System Logs"
                onPress={() => {/* Navigate to logs */}}
                variant="outline"
                size="sm"
                style={styles.quickActionButton}
              />
              <Button
                title="Backup Data"
                onPress={() => {/* Trigger backup */}}
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
              <Text style={styles.adminInfoText}>User Type: {user?.userType}</Text>
              <Text style={styles.adminInfoText}>Subscription: {user?.subscriptionTier}</Text>
              <Text style={styles.adminInfoText}>Last Login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</Text>
              <Text style={styles.adminInfoText}>Account Created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Text>
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
    marginBottom: theme.spacing.xl,
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
    alignItems: 'center',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
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
    textAlign: 'center',
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
  actionDescription: {
    fontSize: 14,
    color: colors.gray[600],
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
  adminInfoText: {
    fontSize: 14,
    color: colors.gray[600],
  },
});