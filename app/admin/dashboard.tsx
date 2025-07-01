import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, FileText, Briefcase, TrendingUp, Settings, LogOut, Shield, Database } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  const handleCreateTestUser = () => {
    Alert.alert(
      'Test User',
      'Test user already exists with sample data.\n\nCredentials:\nEmail: testuser@simplepro.com\nPassword: TestUser123!',
      [{ text: 'OK' }]
    );
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Admin Dashboard"
        subtitle="System Administration"
        rightComponent={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={20} color={colors.error} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.adminBanner}>
            <View style={styles.bannerIcon}>
              <Shield size={24} color={colors.primary} />
            </View>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Administrator Access</Text>
              <Text style={styles.bannerText}>
                You have full system access and can manage all users and data.
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value="1,234"
              subtitle="567 active"
              icon={<Users size={20} color={colors.white} />}
              color={colors.primary}
            />
            <StatCard
              title="Active Quotes"
              value="567"
              subtitle="89 pending"
              icon={<FileText size={20} color={colors.white} />}
              color={colors.secondary}
            />
            <StatCard
              title="Active Jobs"
              value="89"
              subtitle="45 scheduled"
              icon={<Briefcase size={20} color={colors.white} />}
              color={colors.success}
            />
            <StatCard
              title="System Health"
              value="99.9%"
              subtitle="All systems operational"
              icon={<TrendingUp size={20} color={colors.white} />}
              color={colors.warning}
            />
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Admin Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('Feature', 'User management coming soon')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Users size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Manage Users</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('Feature', 'System settings coming soon')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
                  <Settings size={24} color={colors.secondary} />
                </View>
                <Text style={styles.actionText}>System Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleCreateTestUser}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
                  <Database size={24} color={colors.success} />
                </View>
                <Text style={styles.actionText}>Test User Info</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Alert.alert('Feature', 'Analytics dashboard coming soon')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                  <TrendingUp size={24} color={colors.warning} />
                </View>
                <Text style={styles.actionText}>Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.testUserSection}>
            <Text style={styles.sectionTitle}>Test User Account</Text>
            <View style={styles.testUserCard}>
              <Text style={styles.testUserTitle}>Demo Account Available</Text>
              <Text style={styles.testUserText}>
                A test user account with comprehensive sample data is available for demonstrations.
              </Text>
              <View style={styles.testUserCredentials}>
                <Text style={styles.credentialLabel}>Email:</Text>
                <Text style={styles.credentialValue}>testuser@simplepro.com</Text>
                <Text style={styles.credentialLabel}>Password:</Text>
                <Text style={styles.credentialValue}>TestUser123!</Text>
              </View>
              <Button
                title="View Test User Details"
                onPress={handleCreateTestUser}
                variant="outline"
                size="sm"
                style={styles.testUserButton}
              />
            </View>
          </View>

          <View style={styles.systemInfo}>
            <Text style={styles.sectionTitle}>System Information</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Server Uptime</Text>
                <Text style={styles.infoValue}>15 days, 4 hours</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Database Size</Text>
                <Text style={styles.infoValue}>2.3 GB</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Last Backup</Text>
                <Text style={styles.infoValue}>2 hours ago</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Active Sessions</Text>
                <Text style={styles.infoValue}>234</Text>
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
  logoutButton: {
    padding: theme.spacing.xs,
  },
  adminBanner: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  bannerIcon: {
    marginRight: theme.spacing.sm,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: theme.spacing.xs,
  },
  bannerText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  quickActions: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    textAlign: 'center',
  },
  testUserSection: {
    marginBottom: theme.spacing.xl,
  },
  testUserCard: {
    backgroundColor: colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  testUserTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: theme.spacing.xs,
  },
  testUserText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: theme.spacing.md,
  },
  testUserCredentials: {
    backgroundColor: colors.gray[50],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  credentialLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  credentialValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    fontFamily: 'monospace',
  },
  testUserButton: {
    alignSelf: 'flex-start',
  },
  systemInfo: {
    marginBottom: theme.spacing.xl,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
});