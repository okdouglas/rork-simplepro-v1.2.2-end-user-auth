import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Calendar, 
  FileText, 
  User, 
  Edit, 
  Trash, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useJobStore } from '@/store/jobStore';
import { useQuoteStore } from '@/store/quoteStore';
import StatusBadge from '@/components/StatusBadge';
import Button from '@/components/Button';
import { customers } from '@/mocks/customers';
import { Job, JobStatus } from '@/types';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getJobById, updateJobStatus, deleteJob } = useJobStore();
  const { getQuoteById } = useQuoteStore();
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (id) {
      const jobData = getJobById(id);
      setJob(jobData);
    }
  }, [id, getJobById]);
  
  const customer = job ? customers.find(c => c.id === job.customerId) : undefined;
  const quote = job?.quoteId ? getQuoteById(job.quoteId) : undefined;
  
  const handleBack = () => {
    router.back();
  };
  
  const handleEdit = () => {
    // Navigate to edit job screen
    // router.push(`/jobs/edit/${id}`);
    Alert.alert('Edit Job', 'Edit job functionality coming soon');
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteJob(id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete job');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!job) return;
    
    try {
      setLoading(true);
      const updatedJob = await updateJobStatus(job.id, newStatus);
      setJob(updatedJob);
    } catch (error) {
      Alert.alert('Error', 'Failed to update job status');
    } finally {
      setLoading(false);
    }
  };
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            headerShown: true,
            title: 'Job Details',
            headerLeft: () => (
              <TouchableOpacity onPress={handleBack}>
                <ArrowLeft size={24} color={colors.gray[700]} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Job not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Job Details',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack}>
              <ArrowLeft size={24} color={colors.gray[700]} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleEdit} style={styles.headerAction}>
                <Edit size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerAction}>
                <Trash size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{job.title}</Text>
          <StatusBadge status={job.status} type="job" />
        </View>
        
        {quote && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={18} color={colors.gray[700]} />
              <Text style={styles.sectionTitle}>Quote Information</Text>
            </View>
            
            <View style={styles.quoteCard}>
              <View style={styles.quoteHeader}>
                <Text style={styles.quoteTitle}>Quote #{quote.id}</Text>
                <StatusBadge status={quote.status} type="quote" />
              </View>
              
              <View style={styles.quoteDetails}>
                <View style={styles.quoteDetail}>
                  <Text style={styles.quoteLabel}>Total:</Text>
                  <Text style={styles.quoteValue}>{formatCurrency(quote.total)}</Text>
                </View>
                
                <View style={styles.quoteDetail}>
                  <Text style={styles.quoteLabel}>Created:</Text>
                  <Text style={styles.quoteValue}>{formatDate(quote.createdAt)}</Text>
                </View>
                
                {quote.approvedAt && (
                  <View style={styles.quoteDetail}>
                    <Text style={styles.quoteLabel}>Approved:</Text>
                    <Text style={styles.quoteValue}>{formatDate(quote.approvedAt)}</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.viewQuoteButton}
                onPress={() => router.push(`/quotes/${quote.id}`)}
              >
                <Text style={styles.viewQuoteText}>View Quote</Text>
                <ExternalLink size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={18} color={colors.gray[700]} />
            <Text style={styles.sectionTitle}>Customer</Text>
          </View>
          
          <View style={styles.customerCard}>
            <Text style={styles.customerName}>{customer?.name || 'Unknown Customer'}</Text>
            
            <View style={styles.customerDetails}>
              <View style={styles.detailItem}>
                <Phone size={16} color={colors.gray[500]} />
                <Text style={styles.detailText}>{customer?.phone || 'No phone'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <MapPin size={16} color={colors.gray[500]} />
                <Text style={styles.detailText}>{customer?.address || 'No address'}</Text>
              </View>
            </View>
            
            <View style={styles.customerActions}>
              <TouchableOpacity style={styles.customerAction}>
                <Phone size={16} color={colors.primary} />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.customerAction}>
                <MapPin size={16} color={colors.primary} />
                <Text style={styles.actionText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color={colors.gray[700]} />
            <Text style={styles.sectionTitle}>Schedule</Text>
          </View>
          
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleLabel}>Date:</Text>
              <Text style={styles.scheduleValue}>{formatDate(job.scheduledDate)}</Text>
            </View>
            
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleLabel}>Time:</Text>
              <Text style={styles.scheduleValue}>{formatTime(job.scheduledTime)}</Text>
            </View>
            
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleLabel}>Priority:</Text>
              <StatusBadge status={job.priority} type="priority" />
            </View>
            
            {job.calendarEventId && (
              <View style={styles.calendarEventContainer}>
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.calendarEventText}>Added to calendar</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color={colors.gray[700]} />
            <Text style={styles.sectionTitle}>Details</Text>
          </View>
          
          <View style={styles.detailsCard}>
            {job.description && (
              <View style={styles.detailsItem}>
                <Text style={styles.detailsLabel}>Description:</Text>
                <Text style={styles.detailsValue}>{job.description}</Text>
              </View>
            )}
            
            {job.notes && (
              <View style={styles.detailsItem}>
                <Text style={styles.detailsLabel}>Notes:</Text>
                <Text style={styles.detailsValue}>{job.notes}</Text>
              </View>
            )}
            
            {/* Photos would go here */}
            
            {/* Voice notes would go here */}
          </View>
        </View>
        
        <View style={styles.actionsSection}>
          <Text style={styles.actionsSectionTitle}>Actions</Text>
          
          <View style={styles.actionButtons}>
            {job.status === 'scheduled' && (
              <Button
                title="Start Job"
                onPress={() => handleStatusChange('in_progress')}
                variant="primary"
                size="md"
                style={styles.actionButton}
                loading={loading}
              />
            )}
            
            {job.status === 'in_progress' && (
              <Button
                title="Complete Job"
                onPress={() => handleStatusChange('completed')}
                variant="success"
                size="md"
                style={styles.actionButton}
                loading={loading}
              />
            )}
            
            {(job.status === 'scheduled' || job.status === 'in_progress') && (
              <Button
                title="Cancel Job"
                onPress={() => handleStatusChange('cancelled')}
                variant="danger"
                size="md"
                style={styles.actionButton}
                loading={loading}
              />
            )}
            
            {(job.status === 'completed' || job.status === 'cancelled') && (
              <Button
                title="Reschedule Job"
                onPress={() => handleStatusChange('scheduled')}
                variant="secondary"
                size="md"
                style={styles.actionButton}
                loading={loading}
              />
            )}
          </View>
          
          {job.status === 'completed' && !job.invoiceId && (
            <Button
              title="Create Invoice"
              onPress={() => router.push({
                pathname: '/invoices/new',
                params: { jobId: job.id, quoteId: job.quoteId }
              })}
              variant="primary"
              size="md"
              style={[styles.actionButton, { marginTop: theme.spacing.md }]}
              icon={<FileText size={18} color={colors.white} />}
            />
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginLeft: theme.spacing.xs,
  },
  quoteCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  quoteDetails: {
    marginBottom: theme.spacing.md,
  },
  quoteDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  quoteLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  quoteValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  viewQuoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  viewQuoteText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginRight: theme.spacing.xs,
  },
  customerCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: theme.spacing.sm,
  },
  customerDetails: {
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  customerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  customerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  scheduleCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  scheduleValue: {
    fontSize: 14,
    color: colors.gray[900],
  },
  calendarEventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue[50],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
  },
  calendarEventText: {
    fontSize: 14,
    color: colors.blue[700],
    marginLeft: theme.spacing.xs,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  detailsItem: {
    gap: theme.spacing.xs,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  detailsValue: {
    fontSize: 14,
    color: colors.gray[900],
    lineHeight: 20,
  },
  actionsSection: {
    marginTop: theme.spacing.md,
  },
  actionsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  actionButtons: {
    gap: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});