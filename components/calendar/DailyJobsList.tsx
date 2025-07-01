import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Job } from '@/types';
import JobCard from '@/components/JobCard';

interface DailyJobsListProps {
  date: string;
  jobs: Job[];
}

export default function DailyJobsList({ date, jobs }: DailyJobsListProps) {
  // Format date for display (e.g., "Monday, June 26")
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Check if date is today
  const isToday = (dateString: string) => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    return dateString === formattedToday;
  };
  
  // Check if date is tomorrow
  const isTomorrow = (dateString: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = tomorrow.toISOString().split('T')[0];
    return dateString === formattedTomorrow;
  };
  
  // Get display date with relative terms (Today/Tomorrow) if applicable
  const getDisplayDate = (dateString: string) => {
    if (isToday(dateString)) {
      return 'Today';
    } else if (isTomorrow(dateString)) {
      return 'Tomorrow';
    } else {
      return formatDisplayDate(dateString);
    }
  };
  
  // Sort jobs by scheduled time
  const sortedJobs = [...jobs].sort((a, b) => {
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No jobs scheduled for this date</Text>
    </View>
  );
  
  // Render job item
  const renderJobItem = ({ item }: { item: Job }) => (
    <JobCard job={item} />
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{getDisplayDate(date)}</Text>
        <Text style={styles.jobCountText}>
          {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
        </Text>
      </View>
      
      {jobs.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={sortedJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJobItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  jobCountText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  listContent: {
    paddingBottom: theme.spacing.xl * 2, // Add extra padding at the bottom to prevent content being cut off
  },
  emptyState: {
    padding: theme.spacing.xl,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
  },
});