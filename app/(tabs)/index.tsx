import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Users, FileText, Briefcase, TrendingUp, DollarSign, AlertCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useCustomerStore } from '@/store/customerStore';
import { useQuoteStore } from '@/store/quoteStore';
import { useJobStore } from '@/store/jobStore';
import { useBusinessStore } from '@/store/businessStore';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import QuoteCard from '@/components/QuoteCard';
import JobCard from '@/components/JobCard';
import Button from '@/components/Button';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { customers, fetchCustomerMetrics, metrics } = useCustomerStore();
  const { quotes, fetchQuotes } = useQuoteStore();
  const { jobs, fetchJobs } = useJobStore();
  const businessStore = useBusinessStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      if (user.id === 'test_user_001') {
        businessStore.initializeForUser(user.id);
      } else if (user.id !== 'admin_user') {
        businessStore.initializeForUser(user.id);
      }
      
      fetchCustomerMetrics();
      fetchQuotes();
      fetchJobs();
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const totalCustomers = customers.length;
  const totalQuotes = quotes.length;
  const totalJobs = jobs.length;
  
  const pendingQuotes = quotes.filter(q => q.status === 'draft' || q.status === 'sent').length;
  const scheduledJobs = jobs.filter(j => j.status === 'scheduled').length;
  
  const approvedQuoteValue = quotes
    .filter(q => q.status === 'approved' || q.status === 'scheduled' || q.status === 'converted')
    .reduce((sum, quote) => sum + quote.total, 0);

  const recentQuotes = quotes
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
    
  const upcomingJobs = jobs
    .filter(j => j.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 3);

  const isTestUser = user.id === 'test_user_001';
  const hasData = totalCustomers > 0 || totalQuotes > 0 || totalJobs > 0;

  return (
    <View style={styles.container}>
      <Header 
        title={isTestUser ? 'Demo Dashboard' : 'Dashboard'}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {isTestUser && (
            <View style={styles.testUserBanner}>
              <View style={styles.bannerIcon}>
                <AlertCircle size={20} color={colors.warning} />
              </View>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Demo Account</Text>
                <Text style={styles.bannerText}>
                  This account contains sample data to demonstrate all features of SimplePro.
                </Text>
              </View>
            </View>
          )}

          {!hasData && !isTestUser && (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <TrendingUp size={48} color={colors.gray[400]} />
              </View>
              <Text style={styles.emptyStateTitle}>Welcome to SimplePro!</Text>
              <Text style={styles.emptyStateText}>
                Get started by adding your first customer, creating a quote, or scheduling a job.
              </Text>
              <View style={styles.emptyStateActions}>
                <Button
                  title="Add Customer"
                  onPress={() => router.push('/customers/new')}
                  variant="primary"
                  size="sm"
                  style={styles.emptyStateButton}
                />
                <Button
                  title="Create Quote"
                  onPress={() => router.push('/quotes/new')}
                  variant="outline"
                  size="sm"
                  style={styles.emptyStateButton}
                />
              </View>
            </View>
          )}

          {hasData && (
            <View style={styles.statsGrid}>
              <StatCard
                title="Customers"
                value={totalCustomers.toString()}
                icon={<Users size={20} color={colors.white} />}
                color={colors.primary}
                onPress={() => router.push('/(tabs)/customers')}
              />
              <StatCard
                title="Quotes"
                value={totalQuotes.toString()}
                subtitle={`${pendingQuotes} pending`}
                icon={<FileText size={20} color={colors.white} />}
                color={colors.secondary}
                onPress={() => router.push('/(tabs)/quotes')}
              />
              <StatCard
                title="Jobs"
                value={totalJobs.toString()}
                subtitle={`${scheduledJobs} scheduled`}
                icon={<Briefcase size={20} color={colors.white} />}
                color={colors.success}
                onPress={() => router.push('/(tabs)/jobs')}
              />
              <StatCard
                title="Revenue"
                value={`$${approvedQuoteValue.toLocaleString()}`}
                subtitle="Approved quotes"
                icon={<DollarSign size={20} color={colors.white} />}
                color={colors.warning}
                onPress={() => router.push('/(tabs)/pipeline')}
              />
            </View>
          )}

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/customers/new')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Users size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Add Customer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/quotes/new')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
                  <FileText size={24} color={colors.secondary} />
                </View>
                <Text style={styles.actionText}>Create Quote</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/jobs/new')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
                  <Briefcase size={24} color={colors.success} />
                </View>
                <Text style={styles.actionText}>Schedule Job</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/(tabs)/pipeline')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                  <TrendingUp size={24} color={colors.warning} />
                </View>
                <Text style={styles.actionText}>View Pipeline</Text>
              </TouchableOpacity>
            </View>
          </View>

          {recentQuotes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Quotes</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/quotes')}>
                  <Text style={styles.sectionLink}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardList}>
                {recentQuotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    onPress={() => router.push(`/quotes/${quote.id}`)}
                  />
                ))}
              </View>
            </View>
          )}

          {upcomingJobs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
                  <Text style={styles.sectionLink}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardList}>
                {upcomingJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onPress={() => router.push(`/jobs/${job.id}`)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  testUserBanner: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  bannerIcon: {
    marginRight: theme.spacing.sm,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: theme.spacing.xs,
  },
  bannerText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  emptyStateIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyStateActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  emptyStateButton: {
    flex: 1,
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
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  cardList: {
    gap: theme.spacing.sm,
  },
});