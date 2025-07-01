import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Job } from '@/types';
import { useJobStore } from '@/store/jobStore';
import { useRouter } from 'expo-router';

interface WeeklyCalendarViewProps {
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
  compact?: boolean;
}

export default function WeeklyCalendarView({ 
  onDateSelect, 
  selectedDate: propSelectedDate,
  compact = false
}: WeeklyCalendarViewProps) {
  const router = useRouter();
  const { getJobsByDate } = useJobStore();
  
  // Get current date if no selectedDate is provided
  const today = new Date();
  const formattedToday = formatDate(today);
  const [selectedDate, setSelectedDate] = useState(propSelectedDate || formattedToday);
  
  // State for current week
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(today));
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  
  // Generate week days
  useEffect(() => {
    const days: Date[] = [];
    const startDate = new Date(currentWeekStart);
    
    // Generate 7 days starting from the week start
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    setWeekDays(days);
  }, [currentWeekStart]);
  
  // Format date to YYYY-MM-DD
  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  // Get the start of the week (Monday) for a given date
  function getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(date);
    monday.setDate(diff);
    return monday;
  }
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };
  
  // Get week range text (e.g., "May 1 - May 7, 2023")
  const getWeekRangeText = () => {
    const startDate = currentWeekStart;
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    
    const startMonth = startDate.toLocaleString('default', { month: 'short' });
    const endMonth = endDate.toLocaleString('default', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
    } else {
      return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
  };
  
  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Check if a date is selected
  const isSelected = (date: Date) => {
    return formatDate(date) === selectedDate;
  };
  
  // Get jobs for a specific date
  const getJobsForDate = (date: Date): Job[] => {
    const formattedDate = formatDate(date);
    return getJobsByDate(formattedDate);
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const formattedDate = formatDate(date);
    setSelectedDate(formattedDate);
    if (onDateSelect) {
      onDateSelect(formattedDate);
    }
  };
  
  // Get day name (e.g., "Mon")
  const getDayName = (date: Date) => {
    return date.toLocaleString('default', { weekday: compact ? 'narrow' : 'short' });
  };
  
  // Render day cell
  const renderDayCell = (day: Date, index: number) => {
    const jobsForDay = getJobsForDate(day);
    const hasJobs = jobsForDay.length > 0;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          isToday(day) && styles.todayCell,
          isSelected(day) && styles.selectedCell,
        ]}
        onPress={() => handleDateSelect(day)}
      >
        <Text style={[
          styles.dayName,
          isToday(day) && styles.todayText,
          isSelected(day) && styles.selectedText,
        ]}>
          {getDayName(day)}
        </Text>
        
        <View style={[
          styles.dateCircle,
          isToday(day) && styles.todayCircle,
          isSelected(day) && styles.selectedCircle,
        ]}>
          <Text style={[
            styles.dateText,
            isToday(day) && styles.todayDateText,
            isSelected(day) && styles.selectedDateText,
          ]}>
            {day.getDate()}
          </Text>
        </View>
        
        {hasJobs && (
          <View style={styles.jobIndicatorContainer}>
            {jobsForDay.length > 2 ? (
              <View style={styles.multipleJobsIndicator}>
                <Text style={styles.jobCountText}>{jobsForDay.length}</Text>
              </View>
            ) : (
              jobsForDay.slice(0, 2).map((job, jobIndex) => (
                <View 
                  key={jobIndex} 
                  style={[
                    styles.jobIndicator,
                    job.priority === 'urgent' && { backgroundColor: colors.red[500] },
                    job.priority === 'high' && { backgroundColor: colors.orange[500] },
                    job.priority === 'medium' && { backgroundColor: colors.yellow[500] },
                    job.priority === 'low' && { backgroundColor: colors.green[500] },
                    job.status === 'completed' && { backgroundColor: colors.green[500] },
                    job.status === 'cancelled' && { backgroundColor: colors.gray[400] },
                  ]}
                />
              ))
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // Render job item
  const renderJobItem = ({ item, index }: { item: Job; index: number }) => (
    <TouchableOpacity 
      key={index}
      style={styles.jobItem}
      onPress={() => router.push(`/jobs/${item.id}`)}
    >
      <View style={[
        styles.jobPriorityIndicator,
        item.priority === 'urgent' && { backgroundColor: colors.red[500] },
        item.priority === 'high' && { backgroundColor: colors.orange[500] },
        item.priority === 'medium' && { backgroundColor: colors.yellow[500] },
        item.priority === 'low' && { backgroundColor: colors.green[500] },
      ]} />
      <View style={styles.jobDetails}>
        <Text style={styles.jobTime}>{item.scheduledTime}</Text>
        <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );
  
  // Get selected day jobs
  const selectedDayJobs = selectedDate ? getJobsByDate(selectedDate).slice(0, 3) : [];
  
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
          <ChevronLeft size={20} color={colors.gray[700]} />
        </TouchableOpacity>
        
        <Text style={styles.weekRangeText}>{getWeekRangeText()}</Text>
        
        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <ChevronRight size={20} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.daysContainer}>
        {weekDays.map((day, index) => renderDayCell(day, index))}
      </View>
      
      {!compact && selectedDate && (
        <View style={styles.selectedDayJobs}>
          <Text style={styles.selectedDayTitle}>
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          {selectedDayJobs.length > 0 ? (
            <View style={styles.jobsList}>
              {selectedDayJobs.map((job, index) => renderJobItem({ item: job, index }))}
              
              {getJobsByDate(selectedDate).length > 3 && (
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => router.push('/(tabs)/jobs')}
                >
                  <Text style={styles.viewMoreText}>
                    View {getJobsByDate(selectedDate).length - 3} more jobs
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.noJobsText}>No jobs scheduled for this day</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: theme.spacing.md,
  },
  compactContainer: {
    borderRadius: theme.borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  navButton: {
    padding: theme.spacing.xs,
  },
  weekRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
    flex: 1,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[600],
    marginBottom: 4,
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  todayCell: {},
  todayCircle: {
    backgroundColor: colors.blue[100],
  },
  todayText: {
    color: colors.blue[700],
  },
  todayDateText: {
    color: colors.blue[700],
    fontWeight: '700',
  },
  selectedCell: {},
  selectedCircle: {
    backgroundColor: colors.primary,
  },
  selectedText: {
    color: colors.primary,
  },
  selectedDateText: {
    color: colors.white,
    fontWeight: '700',
  },
  jobIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
  jobIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[400],
  },
  multipleJobsIndicator: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  jobCountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  selectedDayJobs: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: theme.spacing.sm,
  },
  jobsList: {
    gap: theme.spacing.xs,
  },
  jobItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: theme.borderRadius.md,
  },
  jobPriorityIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: theme.spacing.sm,
  },
  jobDetails: {
    flex: 1,
  },
  jobTime: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[600],
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  noJobsText: {
    fontSize: 14,
    color: colors.gray[500],
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
});