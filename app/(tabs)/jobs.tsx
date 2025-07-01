import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, List } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Header from '@/components/Header';
import JobCard from '@/components/JobCard';
import Button from '@/components/Button';
import { useJobStore } from '@/store/jobStore';
import { JobStatus } from '@/types';
import CalendarView from '@/components/calendar/CalendarView';
import DailyJobsList from '@/components/calendar/DailyJobsList';

export default function JobsScreen() {
  const router = useRouter();
  const { jobs, fetchJobs, getJobsByDate } = useJobStore();
  const [activeFilter, setActiveFilter] = useState<JobStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  const handleAddJob = () => {
    router.push('/jobs/new');
  };
  
  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'calendar' : 'list');
  };
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };
  
  // Filter jobs based on active filter
  const filteredJobs = activeFilter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === activeFilter);
  
  // Get jobs for selected date
  const jobsForSelectedDate = getJobsByDate(selectedDate);
  
  // Filter jobs for selected date based on active filter
  const filteredJobsForSelectedDate = activeFilter === 'all'
    ? jobsForSelectedDate
    : jobsForSelectedDate.filter(job => job.status === activeFilter);
  
  // Sort jobs by scheduled date and time for list view
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
    const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  const viewToggleButton = (
    <TouchableOpacity style={styles.viewToggle} onPress={toggleViewMode}>
      {viewMode === 'list' ? (
        <Calendar size={22} color={colors.primary} />
      ) : (
        <List size={22} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  // Render empty state for list view
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No jobs found</Text>
      <Button 
        title="Add New Job" 
        onPress={handleAddJob} 
        variant="primary"
        size="md"
        style={styles.emptyStateButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Jobs" 
        showAdd 
        onAddPress={handleAddJob} 
        rightComponent={viewToggleButton}
      />
      
      <View style={styles.filtersContainer}>
        <View style={styles.filtersScrollContent}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'all' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'all' && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'scheduled' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('scheduled')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'scheduled' && styles.activeFilterText,
              ]}
            >
              Scheduled
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'in_progress' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('in_progress')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'in_progress' && styles.activeFilterText,
              ]}
            >
              In Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'completed' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'completed' && styles.activeFilterText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'cancelled' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('cancelled')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'cancelled' && styles.activeFilterText,
              ]}
            >
              Cancelled
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {viewMode === 'calendar' ? (
        <View style={styles.calendarContainer}>
          <CalendarView 
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
          
          <View style={styles.dailyJobsContainer}>
            <DailyJobsList 
              date={selectedDate}
              jobs={filteredJobsForSelectedDate}
            />
          </View>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {sortedJobs.length > 0 ? (
            sortedJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            renderEmptyState()
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filtersScrollContent: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.gray[100],
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  activeFilterText: {
    color: colors.white,
  },
  viewToggle: {
    padding: theme.spacing.xs,
  },
  listContainer: {
    flex: 1,
    padding: theme.spacing.md,
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
    marginTop: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyStateButton: {
    marginTop: theme.spacing.md,
  },
  calendarContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  dailyJobsContainer: {
    flex: 1,
    marginTop: theme.spacing.md,
  },
});