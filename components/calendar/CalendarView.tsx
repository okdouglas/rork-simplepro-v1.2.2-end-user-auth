import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Job } from '@/types';
import { useJobStore } from '@/store/jobStore';
import { useQuoteStore } from '@/store/quoteStore';
import { useRouter } from 'expo-router';

interface CalendarViewProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

export default function CalendarView({ onDateSelect, selectedDate }: CalendarViewProps) {
  const router = useRouter();
  const { getJobsByDate } = useJobStore();
  const { getQuotesByStatus } = useQuoteStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date; isCurrentMonth: boolean }>>([]);
  
  // Generate calendar days for the current month view
  useEffect(() => {
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];
    
    // Get first day of the month
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    // Get last day of the month
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevMonthDay = new Date(firstDay);
      prevMonthDay.setDate(prevMonthDay.getDate() - i);
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }
    
    // Add all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Add days from next month to complete the last week (only add enough to complete the row)
    const lastDayOfWeek = lastDay.getDay();
    if (lastDayOfWeek < 6) { // Only add if not Saturday (6)
      for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
        const nextMonthDay = new Date(lastDay);
        nextMonthDay.setDate(nextMonthDay.getDate() + i);
        days.push({ date: nextMonthDay, isCurrentMonth: false });
      }
    }
    
    setCalendarDays(days);
  }, [currentMonth]);
  
  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Get month name and year
  const getMonthYearHeader = () => {
    return currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
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
  
  // Get scheduled quotes for a specific date
  const getScheduledQuotesForDate = (date: Date) => {
    const formattedDate = formatDate(date);
    const scheduledQuotes = getQuotesByStatus('scheduled');
    return scheduledQuotes.filter(quote => quote.scheduledDate === formattedDate);
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    onDateSelect(formatDate(date));
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color={colors.gray[700]} />
        </TouchableOpacity>
        
        <Text style={styles.monthYearText}>{getMonthYearHeader()}</Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <ChevronRight size={24} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekdaysHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Text key={index} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.daysGrid}>
        {calendarDays.map((dayInfo, index) => {
          const jobsForDay = getJobsForDate(dayInfo.date);
          const quotesForDay = getScheduledQuotesForDate(dayInfo.date);
          const hasJobs = jobsForDay.length > 0;
          const hasQuotes = quotesForDay.length > 0;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !dayInfo.isCurrentMonth && styles.otherMonthDay,
                isToday(dayInfo.date) && styles.todayCell,
                isSelected(dayInfo.date) && styles.selectedCell,
              ]}
              onPress={() => handleDateSelect(dayInfo.date)}
            >
              <Text
                style={[
                  styles.dayText,
                  !dayInfo.isCurrentMonth && styles.otherMonthDayText,
                  isToday(dayInfo.date) && styles.todayText,
                  isSelected(dayInfo.date) && styles.selectedDayText,
                ]}
              >
                {dayInfo.date.getDate()}
              </Text>
              
              <View style={styles.jobIndicatorContainer}>
                {/* Show job indicators */}
                {hasJobs && (
                  jobsForDay.length > 2 ? (
                    <View style={styles.multipleJobsIndicator}>
                      <Text style={styles.jobCountText}>{jobsForDay.length}</Text>
                    </View>
                  ) : (
                    jobsForDay.slice(0, 2).map((job, jobIndex) => (
                      <View 
                        key={`job-${jobIndex}`} 
                        style={[
                          styles.jobIndicator,
                          job.priority === 'urgent' && styles.urgentJob,
                          job.priority === 'high' && styles.highPriorityJob,
                          job.priority === 'medium' && styles.mediumPriorityJob,
                          job.priority === 'low' && styles.lowPriorityJob,
                          job.status === 'completed' && styles.completedJob,
                          job.status === 'cancelled' && styles.cancelledJob,
                        ]}
                      />
                    ))
                  )
                )}
                
                {/* Show quote indicators */}
                {hasQuotes && (
                  quotesForDay.length > 2 ? (
                    <View style={styles.multipleQuotesIndicator}>
                      <FileText size={10} color={colors.white} />
                    </View>
                  ) : (
                    quotesForDay.slice(0, 2).map((quote, quoteIndex) => (
                      <View 
                        key={`quote-${quoteIndex}`} 
                        style={styles.quoteIndicator}
                      />
                    ))
                  )
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.jobLegendIndicator]} />
          <Text style={styles.legendText}>Jobs</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.quoteLegendIndicator]} />
          <Text style={styles.legendText}>Scheduled Quotes</Text>
        </View>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  navButton: {
    padding: theme.spacing.xs,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  weekdaysHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: theme.spacing.xs,
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[600],
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: theme.spacing.xs,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[200],
  },
  dayText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[900],
  },
  otherMonthDay: {
    backgroundColor: colors.gray[50],
  },
  otherMonthDayText: {
    color: colors.gray[400],
  },
  todayCell: {
    backgroundColor: colors.blue[50],
  },
  todayText: {
    fontWeight: '700',
    color: colors.blue[700],
  },
  selectedCell: {
    backgroundColor: colors.primary + '20', // 20% opacity
  },
  selectedDayText: {
    fontWeight: '700',
    color: colors.primary,
  },
  jobIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
    gap: 2,
  },
  jobIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[400],
  },
  quoteIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  urgentJob: {
    backgroundColor: colors.red[500],
  },
  highPriorityJob: {
    backgroundColor: colors.orange[500],
  },
  mediumPriorityJob: {
    backgroundColor: colors.yellow[500],
  },
  lowPriorityJob: {
    backgroundColor: colors.green[500],
  },
  completedJob: {
    backgroundColor: colors.green[500],
  },
  cancelledJob: {
    backgroundColor: colors.gray[400],
  },
  multipleJobsIndicator: {
    backgroundColor: colors.blue[500],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  multipleQuotesIndicator: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.full,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobCountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  legendContainer: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  jobLegendIndicator: {
    backgroundColor: colors.blue[500],
  },
  quoteLegendIndicator: {
    backgroundColor: colors.primary,
  },
  legendText: {
    fontSize: 12,
    color: colors.gray[700],
  },
});