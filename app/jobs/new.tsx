import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Platform,
  Modal
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, User, AlertCircle, FileText } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { useJobStore } from '@/store/jobStore';
import { useQuoteStore } from '@/store/quoteStore';
import { JobPriority, JobStatus } from '@/types';
import { customers } from '@/mocks/customers';

export default function NewJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ quoteId?: string }>();
  const { addJob } = useJobStore();
  const { getQuoteById } = useQuoteStore();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [priority, setPriority] = useState<JobPriority>('medium');
  const [status, setStatus] = useState<JobStatus>('scheduled');
  const [notes, setNotes] = useState('');
  const [quoteId, setQuoteId] = useState<string | undefined>(undefined);
  
  // Date and time state
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Customer selection modal
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  
  // Quote selection modal
  const [showQuoteSelector, setShowQuoteSelector] = useState(false);
  const [customerQuotes, setCustomerQuotes] = useState<ReturnType<typeof getQuoteById>[]>([]);
  
  // Load quote data if quoteId is provided
  useEffect(() => {
    if (params.quoteId) {
      const quote = getQuoteById(params.quoteId);
      if (quote) {
        setQuoteId(quote.id);
        setCustomerId(quote.customerId);
        setTitle(`Job from Quote #${quote.id}`);
        setNotes(quote.notes || '');
        
        // If quote has scheduled date/time, use it
        if (quote.scheduledDate) {
          setDate(new Date(quote.scheduledDate));
        }
        
        if (quote.scheduledTime) {
          const [hours, minutes] = quote.scheduledTime.split(':');
          const timeDate = new Date();
          timeDate.setHours(parseInt(hours, 10));
          timeDate.setMinutes(parseInt(minutes, 10));
          setTime(timeDate);
        }
      }
    }
  }, [params.quoteId, getQuoteById]);
  
  // Update available quotes when customer changes
  useEffect(() => {
    if (customerId) {
      const quotes = useQuoteStore.getState().getQuotesByCustomerId(customerId);
      // Only show approved or scheduled quotes
      const validQuotes = quotes.filter(q => 
        q.status === 'approved' || 
        q.status === 'scheduled'
      );
      setCustomerQuotes(validQuotes);
    } else {
      setCustomerQuotes([]);
    }
  }, [customerId]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };
  
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  const getFormattedDateForStorage = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const getFormattedTimeForStorage = (time: Date) => {
    return time.toTimeString().split(' ')[0].substring(0, 5);
  };
  
  const handleSubmit = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a job title');
      return;
    }
    
    if (!customerId) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }
    
    try {
      setLoading(true);
      
      const newJob = {
        customerId,
        quoteId,
        title,
        description,
        status,
        priority,
        scheduledDate: getFormattedDateForStorage(date),
        scheduledTime: getFormattedTimeForStorage(time),
        notes,
        photos: [],
        voiceNotes: [],
      };
      
      const job = await addJob(newJob);
      
      // If this job was created from a quote, update the quote status
      if (quoteId) {
        await useQuoteStore.getState().updateQuote(quoteId, {
          status: 'converted',
          jobId: job.id
        });
      }
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };
  
  const selectedCustomer = customers.find(c => c.id === customerId);
  const selectedQuote = quoteId ? getQuoteById(quoteId) : undefined;
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'New Job',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack}>
              <ArrowLeft size={24} color={colors.gray[700]} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter job title"
              placeholderTextColor={colors.gray[400]}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter job description"
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Customer *</Text>
            <TouchableOpacity 
              style={[styles.input, styles.customerSelector]}
              onPress={() => setShowCustomerSelector(true)}
            >
              <User size={18} color={colors.gray[500]} />
              <Text style={selectedCustomer ? styles.selectedCustomerText : styles.placeholderText}>
                {selectedCustomer ? selectedCustomer.name : 'Select a customer'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {customerId && customerQuotes.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Link to Quote</Text>
              <TouchableOpacity 
                style={[styles.input, styles.customerSelector]}
                onPress={() => setShowQuoteSelector(true)}
              >
                <FileText size={18} color={colors.gray[500]} />
                <Text style={selectedQuote ? styles.selectedCustomerText : styles.placeholderText}>
                  {selectedQuote ? `Quote #${selectedQuote.id} - ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(selectedQuote.total)}` : 'Select a quote (optional)'}
                </Text>
              </TouchableOpacity>
              
              {selectedQuote && (
                <View style={styles.linkedQuoteInfo}>
                  <FileText size={16} color={colors.primary} />
                  <Text style={styles.linkedQuoteText}>
                    This job will be linked to Quote #{selectedQuote.id}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.prioritySelector}>
              {(['low', 'medium', 'high', 'urgent'] as JobPriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    priority === p && styles.selectedPriorityOption,
                    p === 'low' && styles.lowPriority,
                    p === 'medium' && styles.mediumPriority,
                    p === 'high' && styles.highPriority,
                    p === 'urgent' && styles.urgentPriority,
                    priority === p && p === 'low' && styles.selectedLowPriority,
                    priority === p && p === 'medium' && styles.selectedMediumPriority,
                    priority === p && p === 'high' && styles.selectedHighPriority,
                    priority === p && p === 'urgent' && styles.selectedUrgentPriority,
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text 
                    style={[
                      styles.priorityText,
                      priority === p && styles.selectedPriorityText,
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity 
              style={styles.dateTimeSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={18} color={colors.gray[500]} />
              <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Time</Text>
            <TouchableOpacity 
              style={styles.dateTimeSelector}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={18} color={colors.gray[500]} />
              <Text style={styles.dateTimeText}>{formatTime(time)}</Text>
            </TouchableOpacity>
            
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter any additional notes"
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        <View style={styles.submitSection}>
          <Button
            title="Create Job"
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            loading={loading}
          />
        </View>
      </ScrollView>
      
      {/* Customer Selector Modal */}
      {showCustomerSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setShowCustomerSelector(false)}>
                <Text style={styles.modalCloseButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.customerList}>
              {customers.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  style={[
                    styles.customerItem,
                    customerId === customer.id && styles.selectedCustomerItem,
                  ]}
                  onPress={() => {
                    setCustomerId(customer.id);
                    setShowCustomerSelector(false);
                    // Clear selected quote if customer changes
                    if (customerId !== customer.id) {
                      setQuoteId(undefined);
                    }
                  }}
                >
                  <Text 
                    style={[
                      styles.customerItemText,
                      customerId === customer.id && styles.selectedCustomerItemText,
                    ]}
                  >
                    {customer.name}
                  </Text>
                  <Text style={styles.customerItemSubtext}>{customer.phone}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      
      {/* Quote Selector Modal */}
      {showQuoteSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Quote</Text>
              <TouchableOpacity onPress={() => setShowQuoteSelector(false)}>
                <Text style={styles.modalCloseButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.customerList}>
              <TouchableOpacity
                style={[
                  styles.customerItem,
                  !quoteId && styles.selectedCustomerItem,
                ]}
                onPress={() => {
                  setQuoteId(undefined);
                  setShowQuoteSelector(false);
                }}
              >
                <Text 
                  style={[
                    styles.customerItemText,
                    !quoteId && styles.selectedCustomerItemText,
                  ]}
                >
                  No Quote (Create Job Only)
                </Text>
              </TouchableOpacity>
              
              {customerQuotes.map((quote) => (
                <TouchableOpacity
                  key={quote.id}
                  style={[
                    styles.customerItem,
                    quoteId === quote.id && styles.selectedCustomerItem,
                  ]}
                  onPress={() => {
                    setQuoteId(quote.id);
                    setShowQuoteSelector(false);
                    
                    // Pre-fill job details from quote
                    if (quote) {
                      setTitle(`Job from Quote #${quote.id}`);
                      setNotes(quote.notes || '');
                      
                      // If quote has scheduled date/time, use it
                      if (quote.scheduledDate) {
                        setDate(new Date(quote.scheduledDate));
                      }
                      
                      if (quote.scheduledTime) {
                        const [hours, minutes] = quote.scheduledTime.split(':');
                        const timeDate = new Date();
                        timeDate.setHours(parseInt(hours, 10));
                        timeDate.setMinutes(parseInt(minutes, 10));
                        setTime(timeDate);
                      }
                    }
                  }}
                >
                  <Text 
                    style={[
                      styles.customerItemText,
                      quoteId === quote.id && styles.selectedCustomerItemText,
                    ]}
                  >
                    {`Quote #${quote.id} - ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(quote.total)}`}
                  </Text>
                  <Text style={styles.customerItemSubtext}>
                    Status: {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {customerQuotes.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No approved quotes found for this customer.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  formSection: {
    marginBottom: theme.spacing.lg,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.sm,
  },
  customerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  placeholderText: {
    color: colors.gray[400],
  },
  selectedCustomerText: {
    color: colors.gray[900],
  },
  linkedQuoteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue[50],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
  },
  linkedQuoteText: {
    fontSize: 14,
    color: colors.blue[700],
    marginLeft: theme.spacing.xs,
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
    marginHorizontal: 2,
  },
  selectedPriorityOption: {
    borderColor: colors.primary,
  },
  lowPriority: {
    backgroundColor: colors.green[50],
    borderColor: colors.green[300],
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  mediumPriority: {
    backgroundColor: colors.yellow[50],
    borderColor: colors.yellow[300],
  },
  highPriority: {
    backgroundColor: colors.orange[50],
    borderColor: colors.orange[300],
  },
  urgentPriority: {
    backgroundColor: colors.red[50],
    borderColor: colors.red[300],
    borderTopRightRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  selectedLowPriority: {
    backgroundColor: colors.green[100],
    borderColor: colors.green[500],
  },
  selectedMediumPriority: {
    backgroundColor: colors.yellow[100],
    borderColor: colors.yellow[500],
  },
  selectedHighPriority: {
    backgroundColor: colors.orange[100],
    borderColor: colors.orange[500],
  },
  selectedUrgentPriority: {
    backgroundColor: colors.red[100],
    borderColor: colors.red[500],
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  selectedPriorityText: {
    fontWeight: '600',
    color: colors.gray[900],
  },
  dateTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: colors.white,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.gray[900],
  },
  submitSection: {
    marginTop: theme.spacing.md,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  modalCloseButton: {
    fontSize: 16,
    color: colors.primary,
  },
  customerList: {
    maxHeight: 400,
  },
  customerItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  selectedCustomerItem: {
    backgroundColor: colors.primary + '10', // 10% opacity
  },
  customerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
  },
  selectedCustomerItemText: {
    color: colors.primary,
  },
  customerItemSubtext: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
  },
  emptyState: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
});