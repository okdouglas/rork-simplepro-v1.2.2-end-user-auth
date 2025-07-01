import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Share, Platform, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  FileText, 
  Send, 
  Download, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Briefcase,
  PenTool,
  CalendarClock,
  Phone,
  Mail,
  ExternalLink,
  FileCheck,
  History
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import { useQuoteStore } from '@/store/quoteStore';
import { useJobStore } from '@/store/jobStore';
import { useCustomerStore } from '@/store/customerStore';
import { QuoteStatus, QuoteCommunication } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Linking } from 'react-native';
import { useBusinessStore } from '@/store/businessStore';
import Clipboard from '@react-native-community/clipboard';

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    getQuoteById, 
    updateQuote, 
    deleteQuote, 
    sendQuote, 
    approveQuote, 
    rejectQuote, 
    scheduleQuote, 
    convertQuoteToJob,
    // Twilio integration methods
    sendQuoteViaSMS,
    sendQuoteViaEmail,
    generatePDF,
    createSignableQuote,
    checkQuoteSignatureStatus,
    getQuoteCommunicationHistory,
    exportQuoteToQuickBooks
  } = useQuoteStore();
  const { createJobFromQuote } = useJobStore();
  const { getCustomerById } = useCustomerStore();
  const { profile } = useBusinessStore();
  
  const quote = getQuoteById(id);
  const customer = quote ? getCustomerById(quote.customerId) : null;
  
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [communicationHistory, setCommunicationHistory] = useState<QuoteCommunication[]>([]);
  const [showCommunicationHistory, setShowCommunicationHistory] = useState(false);
  
  // Scheduling state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Approval state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  
  // Rejection state
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // SMS state
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsPhoneNumber, setSmsPhoneNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  
  // Email state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  
  // Signature state
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureCustomerName, setSignatureCustomerName] = useState('');
  const [signatureCustomerEmail, setSignatureCustomerEmail] = useState('');
  
  // Close quote state
  const [showCloseQuoteModal, setShowCloseQuoteModal] = useState(false);
  
  // Invoice creation state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDueDate, setInvoiceDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  
  // QuickBooks export state
  const [showQuickBooksModal, setShowQuickBooksModal] = useState(false);
  const [quickBooksExportType, setQuickBooksExportType] = useState<'estimate' | 'invoice' | 'sales_receipt'>('estimate');
  
  useEffect(() => {
    if (quote && customer) {
      // Pre-fill phone and email from customer data
      setSmsPhoneNumber(customer.phone || '');
      setEmailAddress(customer.email || '');
      setSignatureCustomerName(customer.name || '');
      setSignatureCustomerEmail(customer.email || '');
      
      // Pre-fill messages
      setSmsMessage(`Your quote #${quote.id} for $${quote.total.toFixed(2)} is ready. Please review and sign to approve.`);
      setEmailSubject(`Your Quote #${quote.id} from ${profile.name}`);
      setEmailMessage(`<p>Thank you for your interest. Your quote #${quote.id} for $${quote.total.toFixed(2)} is attached.</p>
        <p>You can review and sign the quote by clicking the button below:</p>
        <p><a href="[SIGNATURE_URL]" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View and Sign Quote</a></p>
        <p>If you have any questions, please don't hesitate to contact us.</p>`);
      
      // Load communication history
      loadCommunicationHistory();
      
      // Set PDF URL if available
      if (quote.pdfUrl) {
        setPdfUrl(quote.pdfUrl);
      }
      
      // Pre-fill invoice notes
      setInvoiceNotes(`Payment due within 30 days. Thank you for your business!`);
    }
  }, [quote, customer]);
  
  const loadCommunicationHistory = async () => {
    if (quote) {
      try {
        const history = await getQuoteCommunicationHistory(quote.id);
        setCommunicationHistory(history);
      } catch (error) {
        console.error('Error loading communication history:', error);
      }
    }
  };
  
  if (!quote || !customer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Quote not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="primary"
          style={{ marginTop: theme.spacing.md }}
        />
      </View>
    );
  }
  
  const handleSendQuote = async () => {
    setLoading(true);
    try {
      await sendQuote(quote.id);
      Alert.alert('Success', 'Quote sent successfully');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveQuote = async () => {
    if (!customerName) {
      Alert.alert('Error', 'Please enter the customer name');
      return;
    }
    
    setLoading(true);
    try {
      await approveQuote(quote.id, customerName);
      setShowApprovalModal(false);
      Alert.alert('Success', 'Quote approved successfully');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRejectQuote = async () => {
    setLoading(true);
    try {
      await rejectQuote(quote.id, rejectionReason);
      setShowRejectionModal(false);
      Alert.alert('Success', 'Quote rejected');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleScheduleQuote = async () => {
    setLoading(true);
    try {
      const dateStr = scheduledDate.toISOString().split('T')[0];
      const timeStr = `${scheduledTime.getHours().toString().padStart(2, '0')}:${scheduledTime.getMinutes().toString().padStart(2, '0')}`;
      
      await scheduleQuote(quote.id, dateStr, timeStr);
      setShowScheduleModal(false);
      Alert.alert('Success', 'Quote scheduled successfully');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConvertToJob = async () => {
    setLoading(true);
    try {
      if (quote.status === 'approved') {
        // If approved but not scheduled, show scheduling modal first
        setShowScheduleModal(true);
        setLoading(false);
        return;
      }
      
      const job = await createJobFromQuote(quote.id);
      Alert.alert('Success', 'Quote converted to job successfully');
      
      // Navigate to the new job
      router.push(`/jobs/${job.id}`);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
      setLoading(false);
    }
  };
  
  const handleDeleteQuote = () => {
    setShowCloseQuoteModal(true);
  };
  
  const confirmDeleteQuote = async (saveAsDraft: boolean) => {
    setLoading(true);
    try {
      if (saveAsDraft && quote.status !== 'draft') {
        // Save as draft
        await updateQuote(quote.id, { status: 'draft' });
        Alert.alert('Success', 'Quote saved as draft');
      } else {
        // Delete quote
        await deleteQuote(quote.id);
        Alert.alert('Success', 'Quote deleted');
      }
      router.replace('/quotes');
    } catch (error) {
      Alert.alert('Error', 'Failed to process quote');
      setLoading(false);
    }
  };
  
  const handleShareQuote = async () => {
    try {
      // Generate PDF if not already available
      if (!pdfUrl) {
        setPdfLoading(true);
        const url = await generatePDF(quote.id);
        setPdfUrl(url);
        setPdfLoading(false);
      }
      
      const result = await Share.share({
        message: `Quote #${quote.id} for ${customer.name} - $${quote.total.toFixed(2)}`,
        url: pdfUrl || Platform.OS === 'ios' ? pdfUrl : undefined,
        title: `Quote #${quote.id}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share quote');
    }
  };
  
  const handleCreateInvoice = async () => {
    // Show invoice creation modal
    setShowInvoiceModal(true);
  };
  
  const confirmCreateInvoice = async () => {
    setLoading(true);
    try {
      // Generate PDF if not already available
      if (!pdfUrl) {
        const url = await generatePDF(quote.id);
        setPdfUrl(url);
      }
      
      // Format due date
      const dueDateStr = invoiceDueDate.toISOString();
      
      // Navigate to create invoice screen with quote data
      router.push({
        pathname: '/invoices/new',
        params: { 
          quoteId: quote.id,
          dueDate: dueDateStr,
          notes: invoiceNotes,
          pdfUrl: pdfUrl
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create invoice');
      setLoading(false);
    } finally {
      setShowInvoiceModal(false);
      setLoading(false);
    }
  };
  
  // Twilio integration handlers
  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const url = await generatePDF(quote.id);
      setPdfUrl(url);
      
      // Show success with options to view or share
      Alert.alert(
        'PDF Generated Successfully',
        'Your PDF is ready. What would you like to do?',
        [
          { text: 'View PDF', onPress: () => Linking.openURL(url) },
          { text: 'Share PDF', onPress: () => handleShareQuote() },
          { text: 'Close', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };
  
  const handleSendSMS = async () => {
    if (!smsPhoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    
    setLoading(true);
    try {
      await sendQuoteViaSMS(quote.id, smsPhoneNumber, smsMessage);
      setShowSmsModal(false);
      Alert.alert('Success', 'Quote sent via SMS successfully');
      loadCommunicationHistory();
    } catch (error) {
      Alert.alert('Error', 'Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendEmail = async () => {
    if (!emailAddress) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    
    setLoading(true);
    try {
      await sendQuoteViaEmail(quote.id, emailAddress, emailSubject, emailMessage);
      setShowEmailModal(false);
      Alert.alert('Success', 'Quote sent via email successfully');
      loadCommunicationHistory();
    } catch (error) {
      Alert.alert('Error', 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateSignableDocument = async () => {
    if (!signatureCustomerName || !signatureCustomerEmail) {
      Alert.alert('Error', 'Please enter customer name and email');
      return;
    }
    
    setLoading(true);
    try {
      const result = await createSignableQuote(quote.id, signatureCustomerName, signatureCustomerEmail);
      setShowSignatureModal(false);
      Alert.alert(
        'Success', 
        'Signable document created successfully',
        [
          { text: 'OK' },
          { 
            text: 'Open Signature URL', 
            onPress: () => Linking.openURL(result.signatureUrl)
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create signable document');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckSignatureStatus = async () => {
    if (!quote.signatureId) {
      Alert.alert('Error', 'This quote does not have a signature request');
      return;
    }
    
    setLoading(true);
    try {
      const result = await checkQuoteSignatureStatus(quote.id);
      Alert.alert(
        'Signature Status', 
        `Status: ${result.status}
${result.signedBy ? `Signed by: ${result.signedBy}
` : ''}${result.signedAt ? `Signed at: ${formatDate(result.signedAt)}` : ''}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to check signature status');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportToQuickBooks = () => {
    setShowQuickBooksModal(true);
  };
  
  const confirmExportToQuickBooks = async () => {
    setLoading(true);
    try {
      const result = await exportQuoteToQuickBooks(quote.id);
      setShowQuickBooksModal(false);
      Alert.alert('Success', `Quote exported to QuickBooks as ${quickBooksExportType}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export to QuickBooks');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Quote #${quote.id}`,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleDeleteQuote} style={styles.trashButton}>
              <Trash2 size={24} color={colors.danger} />
            </TouchableOpacity>
          ),
        }} 
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.quoteNumber}>Quote #{quote.id}</Text>
              <StatusBadge status={quote.status} type="quote" />
            </View>
            
            <View style={styles.headerInfo}>
              <View style={styles.infoItem}>
                <Calendar size={16} color={colors.gray[500]} />
                <Text style={styles.infoText}>Created: {formatDate(quote.createdAt)}</Text>
              </View>
              
              {quote.expiresAt && (
                <View style={styles.infoItem}>
                  <Clock size={16} color={colors.gray[500]} />
                  <Text style={styles.infoText}>Expires: {formatDate(quote.expiresAt)}</Text>
                </View>
              )}
              
              {quote.sentAt && (
                <View style={styles.infoItem}>
                  <Send size={16} color={colors.gray[500]} />
                  <Text style={styles.infoText}>Sent: {formatDate(quote.sentAt)}</Text>
                </View>
              )}
              
              {quote.approvedAt && (
                <View style={styles.infoItem}>
                  <CheckCircle size={16} color={colors.green[500]} />
                  <Text style={styles.infoText}>Approved: {formatDate(quote.approvedAt)}</Text>
                </View>
              )}
              
              {quote.scheduledDate && (
                <View style={styles.infoItem}>
                  <CalendarClock size={16} color={colors.blue[500]} />
                  <Text style={styles.infoText}>
                    Scheduled: {formatDate(quote.scheduledDate)} at {quote.scheduledTime ? formatTime(quote.scheduledTime) : 'TBD'}
                  </Text>
                </View>
              )}
            </View>
            
            {quote.status === 'converted' && quote.jobId && (
              <TouchableOpacity 
                style={styles.jobLink}
                onPress={() => router.push(`/jobs/${quote.jobId}`)}
              >
                <Briefcase size={16} color={colors.white} />
                <Text style={styles.jobLinkText}>View Job</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            
            <View style={styles.customerInfo}>
              <View style={styles.customerInitials}>
                <Text style={styles.initialsText}>
                  {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerDetail}>{customer.phone}</Text>
                <Text style={styles.customerDetail}>{customer.email}</Text>
                <Text style={styles.customerDetail}>{customer.address}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Line Items</Text>
            
            <View style={styles.lineItemsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.descriptionHeader]}>Description</Text>
                <Text style={[styles.tableHeaderText, styles.qtyHeader]}>Qty</Text>
                <Text style={[styles.tableHeaderText, styles.priceHeader]}>Price</Text>
                <Text style={[styles.tableHeaderText, styles.totalHeader]}>Total</Text>
              </View>
              
              {quote.items.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <View style={styles.descriptionCell}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    )}
                  </View>
                  <Text style={styles.qtyCell}>{item.quantity}</Text>
                  <Text style={styles.priceCell}>{formatCurrency(item.unitPrice)}</Text>
                  <Text style={styles.totalCell}>{formatCurrency(item.total)}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalValue}>{formatCurrency(quote.tax)}</Text>
              </View>
              
              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(quote.total)}</Text>
              </View>
            </View>
          </View>
          
          {quote.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{quote.notes}</Text>
            </View>
          )}
          
          {/* Workflow Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workflow Status</Text>
            
            <View style={styles.workflowContainer}>
              <View style={[
                styles.workflowStep, 
                styles.workflowStepCompleted
              ]}>
                <View style={styles.workflowIconContainer}>
                  <FileText size={18} color={colors.white} />
                </View>
                <Text style={styles.workflowText}>Created</Text>
              </View>
              
              <View style={[
                styles.workflowConnector,
                (quote.status !== 'draft') && styles.workflowConnectorCompleted
              ]} />
              
              <View style={[
                styles.workflowStep, 
                (quote.status !== 'draft') && styles.workflowStepCompleted
              ]}>
                <View style={styles.workflowIconContainer}>
                  <Send size={18} color={(quote.status !== 'draft') ? colors.white : colors.gray[400]} />
                </View>
                <Text style={styles.workflowText}>Sent</Text>
              </View>
              
              <View style={[
                styles.workflowConnector,
                (quote.status === 'approved' || quote.status === 'scheduled' || quote.status === 'converted') && styles.workflowConnectorCompleted
              ]} />
              
              <View style={[
                styles.workflowStep, 
                (quote.status === 'approved' || quote.status === 'scheduled' || quote.status === 'converted') && styles.workflowStepCompleted
              ]}>
                <View style={styles.workflowIconContainer}>
                  <CheckCircle size={18} color={(quote.status === 'approved' || quote.status === 'scheduled' || quote.status === 'converted') ? colors.white : colors.gray[400]} />
                </View>
                <Text style={styles.workflowText}>Approved</Text>
              </View>
              
              <View style={[
                styles.workflowConnector,
                (quote.status === 'scheduled' || quote.status === 'converted') && styles.workflowConnectorCompleted
              ]} />
              
              <View style={[
                styles.workflowStep, 
                (quote.status === 'scheduled' || quote.status === 'converted') && styles.workflowStepCompleted
              ]}>
                <View style={styles.workflowIconContainer}>
                  <CalendarClock size={18} color={(quote.status === 'scheduled' || quote.status === 'converted') ? colors.white : colors.gray[400]} />
                </View>
                <Text style={styles.workflowText}>Scheduled</Text>
              </View>
              
              <View style={[
                styles.workflowConnector,
                quote.status === 'converted' && styles.workflowConnectorCompleted
              ]} />
              
              <View style={[
                styles.workflowStep, 
                quote.status === 'converted' && styles.workflowStepCompleted
              ]}>
                <View style={styles.workflowIconContainer}>
                  <Briefcase size={18} color={quote.status === 'converted' ? colors.white : colors.gray[400]} />
                </View>
                <Text style={styles.workflowText}>Job Created</Text>
              </View>
            </View>
          </View>
          
          {/* Communication History Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Communication History</Text>
              <TouchableOpacity 
                style={styles.historyButton}
                onPress={() => setShowCommunicationHistory(true)}
              >
                <History size={18} color={colors.primary} />
                <Text style={styles.historyButtonText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {communicationHistory.length > 0 ? (
              <View style={styles.communicationList}>
                {communicationHistory.slice(0, 2).map((comm, index) => (
                  <View key={index} style={styles.communicationItem}>
                    <View style={styles.communicationIcon}>
                      {comm.type === 'sms' ? (
                        <Phone size={16} color={colors.primary} />
                      ) : (
                        <Mail size={16} color={colors.primary} />
                      )}
                    </View>
                    <View style={styles.communicationDetails}>
                      <Text style={styles.communicationType}>
                        {comm.type === 'sms' ? 'SMS' : 'Email'} to {comm.to}
                      </Text>
                      <Text style={styles.communicationTime}>
                        {new Date(comm.sentAt).toLocaleString()}
                      </Text>
                    </View>
                    <StatusBadge status={comm.status} type="priority" size="sm" />
                  </View>
                ))}
                
                {communicationHistory.length > 2 && (
                  <TouchableOpacity 
                    style={styles.viewMoreButton}
                    onPress={() => setShowCommunicationHistory(true)}
                  >
                    <Text style={styles.viewMoreText}>
                      View {communicationHistory.length - 2} more
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <Text style={styles.emptyHistoryText}>
                No communication history yet
              </Text>
            )}
          </View>
          
          {/* PDF Document Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quote Document</Text>
            
            {pdfLoading ? (
              <View style={styles.pdfLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.pdfLoadingText}>Generating PDF...</Text>
              </View>
            ) : pdfUrl ? (
              <View style={styles.pdfContainer}>
                <View style={styles.pdfPreview}>
                  <FileCheck size={48} color={colors.primary} />
                  <Text style={styles.pdfName}>Quote_{quote.id}.pdf</Text>
                </View>
                
                <View style={styles.pdfActions}>
                  <TouchableOpacity 
                    style={styles.pdfActionButton}
                    onPress={() => Linking.openURL(pdfUrl)}
                  >
                    <ExternalLink size={16} color={colors.primary} />
                    <Text style={styles.pdfActionText}>Open</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.pdfActionButton}
                    onPress={handleShareQuote}
                  >
                    <Send size={16} color={colors.primary} />
                    <Text style={styles.pdfActionText}>Share</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.pdfActionButton}
                    onPress={() => {
                      // Copy PDF URL to clipboard
                      if (Platform.OS === 'web') {
                        navigator.clipboard.writeText(pdfUrl);
                      } else {
                        Clipboard.setString(pdfUrl);
                      }
                      Alert.alert('Success', 'PDF URL copied to clipboard');
                    }}
                  >
                    <Copy size={16} color={colors.primary} />
                    <Text style={styles.pdfActionText}>Copy Link</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.generatePdfButton}
                onPress={handleGeneratePDF}
              >
                <FileText size={24} color={colors.primary} />
                <Text style={styles.generatePdfText}>Generate PDF</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            <View style={styles.actionButtons}>
              {quote.status === 'draft' && (
                <Button
                  title="Send Quote"
                  onPress={handleSendQuote}
                  variant="primary"
                  icon={<Send size={18} color={colors.white} />}
                  loading={loading}
                  style={styles.actionButton}
                />
              )}
              
              {quote.status === 'sent' && (
                <>
                  <Button
                    title="Mark Approved"
                    onPress={() => setShowApprovalModal(true)}
                    variant="secondary"
                    icon={<CheckCircle size={18} color={colors.white} />}
                    loading={loading}
                    style={styles.actionButton}
                  />
                  
                  <Button
                    title="Mark Rejected"
                    onPress={() => setShowRejectionModal(true)}
                    variant="outline"
                    icon={<XCircle size={18} color={colors.primary} />}
                    loading={loading}
                    style={styles.actionButton}
                  />
                </>
              )}
              
              {quote.status === 'approved' && (
                <>
                  <Button
                    title="Schedule"
                    onPress={() => setShowScheduleModal(true)}
                    variant="primary"
                    icon={<CalendarClock size={18} color={colors.white} />}
                    loading={loading}
                    style={styles.actionButton}
                  />
                  
                  <Button
                    title="Convert to Job"
                    onPress={handleConvertToJob}
                    variant="secondary"
                    icon={<Briefcase size={18} color={colors.white} />}
                    loading={loading}
                    style={styles.actionButton}
                  />
                </>
              )}
              
              {quote.status === 'scheduled' && (
                <Button
                  title="Convert to Job"
                  onPress={handleConvertToJob}
                  variant="primary"
                  icon={<Briefcase size={18} color={colors.white} />}
                  loading={loading}
                  style={styles.actionButton}
                />
              )}
              
              {quote.status === 'converted' && quote.jobId && (
                <Button
                  title="Create Invoice"
                  onPress={handleCreateInvoice}
                  variant="primary"
                  icon={<FileText size={18} color={colors.white} />}
                  style={styles.actionButton}
                />
              )}
            </View>
            
            {/* Twilio Communication Actions */}
            <View style={styles.communicationActions}>
              <Text style={styles.communicationTitle}>Send via:</Text>
              
              <View style={styles.communicationButtons}>
                <Button
                  title="SMS"
                  onPress={() => setShowSmsModal(true)}
                  variant="outline"
                  icon={<Phone size={18} color={colors.primary} />}
                  style={styles.communicationButton}
                />
                
                <Button
                  title="Email"
                  onPress={() => setShowEmailModal(true)}
                  variant="outline"
                  icon={<Mail size={18} color={colors.primary} />}
                  style={styles.communicationButton}
                />
                
                <Button
                  title="Signature"
                  onPress={() => setShowSignatureModal(true)}
                  variant="outline"
                  icon={<PenTool size={18} color={colors.primary} />}
                  style={styles.communicationButton}
                />
              </View>
            </View>
            
            {quote.signatureId && (
              <Button
                title="Check Signature Status"
                onPress={handleCheckSignatureStatus}
                variant="outline"
                icon={<FileCheck size={18} color={colors.primary} />}
                style={styles.secondaryButton}
              />
            )}
            
            <View style={styles.secondaryActions}>
              <Button
                title="Share"
                onPress={handleShareQuote}
                variant="outline"
                icon={<Send size={18} color={colors.primary} />}
                style={styles.secondaryButton}
              />
              
              <Button
                title="Download PDF"
                onPress={handleGeneratePDF}
                variant="outline"
                icon={<Download size={18} color={colors.primary} />}
                style={styles.secondaryButton}
              />
              
              <Button
                title="Export to QuickBooks"
                onPress={handleExportToQuickBooks}
                variant="outline"
                icon={<Download size={18} color={colors.primary} />}
                style={styles.secondaryButton}
              />
            </View>
            
            <View style={styles.dangerActions}>
              <Button
                title="Edit Quote"
                onPress={() => router.push(`/quotes/edit/${quote.id}`)}
                variant="outline"
                icon={<Edit size={18} color={colors.primary} />}
                style={styles.dangerButton}
              />
              
              <Button
                title="Delete Quote"
                onPress={handleDeleteQuote}
                variant="danger"
                icon={<Trash2 size={18} color={colors.white} />}
                loading={loading}
                style={styles.dangerButton}
              />
            </View>
          </View>
          
          {/* QuickBooks Integration Section */}
          <View style={styles.quickbooksSection}>
            <Text style={styles.quickbooksTitle}>QuickBooks Integration</Text>
            <Text style={styles.quickbooksText}>
              This quote can be exported to QuickBooks in various formats. Choose "Export to QuickBooks" 
              to select the format that best suits your needs. The exported file will be formatted for 
              easy import into QuickBooks using the File > Import feature.
            </Text>
          </View>
        </ScrollView>
        
        {/* Schedule Modal */}
        <Modal
          visible={showScheduleModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowScheduleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Schedule Job</Text>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Date</Text>
                <TouchableOpacity 
                  style={styles.dateTimeSelector}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={18} color={colors.gray[500]} />
                  <Text style={styles.dateTimeText}>
                    {scheduledDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={scheduledDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setScheduledDate(selectedDate);
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}
                
                <Text style={styles.modalLabel}>Time</Text>
                <TouchableOpacity 
                  style={styles.dateTimeSelector}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={18} color={colors.gray[500]} />
                  <Text style={styles.dateTimeText}>
                    {scheduledTime.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </TouchableOpacity>
                
                {showTimePicker && (
                  <DateTimePicker
                    value={scheduledTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedTime) => {
                      setShowTimePicker(Platform.OS === 'ios');
                      if (selectedTime) {
                        setScheduledTime(selectedTime);
                      }
                    }}
                  />
                )}
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowScheduleModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Schedule"
                  onPress={handleScheduleQuote}
                  variant="primary"
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Approval Modal */}
        <Modal
          visible={showApprovalModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowApprovalModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Approve Quote</Text>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Customer Name (for signature)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Enter customer name"
                />
                
                <View style={styles.signatureContainer}>
                  <PenTool size={24} color={colors.primary} />
                  <Text style={styles.signatureText}>
                    This will record a digital signature for this quote approval.
                  </Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowApprovalModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Approve"
                  onPress={handleApproveQuote}
                  variant="primary"
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Rejection Modal */}
        <Modal
          visible={showRejectionModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowRejectionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Reject Quote</Text>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Reason for Rejection (optional)</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  placeholder="Enter reason for rejection"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowRejectionModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Reject"
                  onPress={handleRejectQuote}
                  variant="danger"
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
        
        {/* SMS Modal */}
        <Modal
          visible={showSmsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSmsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Send Quote via SMS</Text>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Phone Number</Text>
                <TextInput
                  style={styles.modalInput}
                  value={smsPhoneNumber}
                  onChangeText={setSmsPhoneNumber}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
                
                <Text style={styles.modalLabel}>Message</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={smsMessage}
                  onChangeText={setSmsMessage}
                  placeholder="Enter message"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                
                <View style={styles.infoContainer}>
                  <FileText size={18} color={colors.blue[500]} />
                  <Text style={styles.infoText}>
                    A PDF of the quote will be generated and attached to the SMS.
                  </Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowSmsModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Send SMS"
                  onPress={handleSendSMS}
                  variant="primary"
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Email Modal */}
        <Modal
          visible={showEmailModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEmailModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Send Quote via Email</Text>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Email Address</Text>
                <TextInput
                  style={styles.modalInput}
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <Text style={styles.modalLabel}>Subject</Text>
                <TextInput
                  style={styles.modalInput}
                  value={emailSubject}
                  onChangeText={setEmailSubject}
                  placeholder="Enter email subject"
                />
                
                <Text style={styles.modalLabel}>Message</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={emailMessage}
                  onChangeText={setEmailMessage}
                  placeholder="Enter email message"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                
                <View style={styles.infoContainer}>
                  <FileText size={18} color={colors.blue[500]} />
                  <Text style={styles.infoText}>
                    A PDF of the quote will be generated and attached to the email.
                  </Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowEmailModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Send Email"
                  onPress={handleSendEmail}
                  variant="primary"
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Signature Modal */}
        <Modal
          visible={showSignatureModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSignatureModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Create Signable Document</Text>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Customer Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={signatureCustomerName}
                  onChangeText={setSignatureCustomerName}
                  placeholder="Enter customer name"
                />
                
                <Text style={styles.modalLabel}>Customer Email</Text>
                <TextInput
                  style={styles.modalInput}
                  value={signatureCustomerEmail}
                  onChangeText={setSignatureCustomerEmail}
                  placeholder="Enter customer email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <View style={styles.infoContainer}>
                  <PenTool size={18} color={colors.blue[500]} />
                  <Text style={styles.infoText}>
                    This will create a signable document that the customer can sign electronically.
                    You can then send the signature link via email or SMS.
                  </Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowSignatureModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Create"
                  onPress={handleCreateSignableDocument}
                  variant="primary"
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Communication History Modal */}
        <Modal
          visible={showCommunicationHistory}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCommunicationHistory(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Communication History</Text>
              
              <ScrollView style={styles.historyScrollView}>
                {communicationHistory.length > 0 ? (
                  communicationHistory.map((comm, index) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyItemHeader}>
                        <View style={styles.historyItemType}>
                          {comm.type === 'sms' ? (
                            <Phone size={16} color={colors.primary} />
                          ) : (
                            <Mail size={16} color={colors.primary} />
                          )}
                          <Text style={styles.historyItemTypeText}>
                            {comm.type === 'sms' ? 'SMS' : 'Email'}
                          </Text>
                        </View>
                        <StatusBadge status={comm.status} type="priority" size="sm" />
                      </View>
                      
                      <Text style={styles.historyItemTo}>To: {comm.to}</Text>
                      <Text style={styles.historyItemTime}>
                        {new Date(comm.sentAt).toLocaleString()}
                      </Text>
                      
                      {comm.mediaUrl && (
                        <TouchableOpacity 
                          style={styles.historyItemMedia}
                          onPress={() => Linking.openURL(comm.mediaUrl!)}
                        >
                          <FileText size={14} color={colors.primary} />
                          <Text style={styles.historyItemMediaText}>View Attachment</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyHistoryText}>
                    No communication history yet
                  </Text>
                )}
              </ScrollView>
              
              <View style={styles.modalActions}>
                <Button
                  title="Close"
                  onPress={() => setShowCommunicationHistory(false)}
                  variant="outline"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Close Quote Modal */}
        <Modal
          visible={showCloseQuoteModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCloseQuoteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Close Quote</Text>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>
                  Would you like to save this quote as a draft or delete it completely?
                </Text>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowCloseQuoteModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Save as Draft"
                  onPress={() => confirmDeleteQuote(true)}
                  variant="secondary"
                  loading={loading}
                  style={styles.modalButton}
                />
                <Button
                  title="Delete"
                  onPress={() => confirmDeleteQuote(false)}
                  variant="danger"
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Invoice Creation Modal */}
        <Modal
          visible={showInvoiceModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowInvoiceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Create Invoice</Text>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Due Date</Text>
                <TouchableOpacity 
                  style={styles.dateTimeSelector}
                  onPress={() => setShowInvoiceDatePicker(true)}
                >
                  <Calendar size={18} color={colors.gray[500]} />
                  <Text style={styles.dateTimeText}>
                    {invoiceDueDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
                
                {showInvoiceDatePicker && (
                  <DateTimePicker
                    value={invoiceDueDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowInvoiceDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setInvoiceDueDate(selectedDate);
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}
                
                <Text style={styles.modalLabel}>Notes</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={invoiceNotes}
                  onChangeText={setInvoiceNotes}
                  placeholder="Enter invoice notes"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                
                <View style={styles.infoContainer}>
                  <FileText size={18} color={colors.blue[500]} />
                  <Text style={styles.infoText}>
                    This will create an invoice based on this quote. The invoice will be added to your open invoices.
                  </Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowInvoiceModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Create Invoice"
                  onPress={confirmCreateInvoice}
                  variant="primary"
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
        
        {/* QuickBooks Export Modal */}
        <Modal
          visible={showQuickBooksModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowQuickBooksModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Export to QuickBooks</Text>
              
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Export Format</Text>
                
                <TouchableOpacity 
                  style={[
                    styles.exportFormatOption,
                    quickBooksExportType === 'estimate' && styles.exportFormatOptionSelected
                  ]}
                  onPress={() => setQuickBooksExportType('estimate')}
                >
                  <View style={styles.exportFormatRadio}>
                    {quickBooksExportType === 'estimate' && (
                      <View style={styles.exportFormatRadioSelected} />
                    )}
                  </View>
                  <View style={styles.exportFormatInfo}>
                    <Text style={styles.exportFormatTitle}>Estimate</Text>
                    <Text style={styles.exportFormatDescription}>
                      Export as a QuickBooks estimate that can be converted to an invoice later.
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.exportFormatOption,
                    quickBooksExportType === 'invoice' && styles.exportFormatOptionSelected
                  ]}
                  onPress={() => setQuickBooksExportType('invoice')}
                >
                  <View style={styles.exportFormatRadio}>
                    {quickBooksExportType === 'invoice' && (
                      <View style={styles.exportFormatRadioSelected} />
                    )}
                  </View>
                  <View style={styles.exportFormatInfo}>
                    <Text style={styles.exportFormatTitle}>Invoice</Text>
                    <Text style={styles.exportFormatDescription}>
                      Export directly as a QuickBooks invoice ready for payment.
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.exportFormatOption,
                    quickBooksExportType === 'sales_receipt' && styles.exportFormatOptionSelected
                  ]}
                  onPress={() => setQuickBooksExportType('sales_receipt')}
                >
                  <View style={styles.exportFormatRadio}>
                    {quickBooksExportType === 'sales_receipt' && (
                      <View style={styles.exportFormatRadioSelected} />
                    )}
                  </View>
                  <View style={styles.exportFormatInfo}>
                    <Text style={styles.exportFormatTitle}>Sales Receipt</Text>
                    <Text style={styles.exportFormatDescription}>
                      Export as a QuickBooks sales receipt for paid transactions.
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.infoContainer}>
                  <FileText size={18} color={colors.blue[500]} />
                  <Text style={styles.infoText}>
                    The exported file will be formatted for easy import into QuickBooks using the File > Import feature.
                  </Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowQuickBooksModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Export"
                  onPress={confirmExportToQuickBooks}
                  variant="primary"
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  trashButton: {
    marginRight: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  quoteNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  headerInfo: {
    marginTop: theme.spacing.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: theme.spacing.xs,
  },
  jobLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
  },
  jobLinkText: {
    color: colors.white,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  customerInitials: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  initialsText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 2,
  },
  lineItemsTable: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
  },
  descriptionHeader: {
    flex: 3,
  },
  qtyHeader: {
    flex: 1,
    textAlign: 'center',
  },
  priceHeader: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalHeader: {
    flex: 1.5,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  descriptionCell: {
    flex: 3,
    paddingRight: theme.spacing.xs,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
  },
  itemDescription: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  qtyCell: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[800],
    textAlign: 'center',
  },
  priceCell: {
    flex: 1.5,
    fontSize: 14,
    color: colors.gray[800],
    textAlign: 'right',
  },
  totalCell: {
    flex: 1.5,
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
    textAlign: 'right',
  },
  totalsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: theme.spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.gray[700],
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  notesText: {
    fontSize: 14,
    color: colors.gray[800],
    lineHeight: 20,
  },
  workflowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  workflowStep: {
    alignItems: 'center',
    width: 60,
  },
  workflowStepCompleted: {
    // Completed step styling
  },
  workflowIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  workflowText: {
    fontSize: 12,
    color: colors.gray[700],
    textAlign: 'center',
  },
  workflowConnector: {
    height: 2,
    backgroundColor: colors.gray[300],
    flex: 1,
    marginHorizontal: 4,
  },
  workflowConnectorCompleted: {
    backgroundColor: colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  communicationActions: {
    marginBottom: theme.spacing.md,
  },
  communicationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: theme.spacing.xs,
  },
  communicationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  communicationButton: {
    flex: 1,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    marginBottom: theme.spacing.sm,
  },
  dangerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  dangerButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    color: colors.gray[700],
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalContent: {
    marginBottom: theme.spacing.md,
  },
  modalText: {
    fontSize: 16,
    color: colors.gray[800],
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: theme.spacing.xs,
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
    marginBottom: theme.spacing.md,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.gray[900],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  signatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue[50],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  signatureText: {
    fontSize: 14,
    color: colors.blue[700],
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue[50],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: colors.blue[700],
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  communicationList: {
    marginTop: theme.spacing.xs,
  },
  communicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  communicationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  communicationDetails: {
    flex: 1,
  },
  communicationType: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
  },
  communicationTime: {
    fontSize: 12,
    color: colors.gray[500],
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  viewMoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyHistoryText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  historyScrollView: {
    maxHeight: 400,
    marginBottom: theme.spacing.md,
  },
  historyItem: {
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyItemType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
    marginLeft: 4,
  },
  historyItemTo: {
    fontSize: 14,
    color: colors.gray[700],
  },
  historyItemTime: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  historyItemMedia: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  historyItemMediaText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  pdfContainer: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  pdfPreview: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pdfName: {
    fontSize: 14,
    color: colors.gray[800],
    marginTop: theme.spacing.xs,
  },
  pdfActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  pdfActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfActionText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  generatePdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    borderStyle: 'dashed',
  },
  generatePdfText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: theme.spacing.sm,
  },
  pdfLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  pdfLoadingText: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: theme.spacing.sm,
  },
  quickbooksSection: {
    backgroundColor: colors.blue[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  quickbooksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue[700],
    marginBottom: theme.spacing.xs,
  },
  quickbooksText: {
    fontSize: 14,
    color: colors.blue[800],
    lineHeight: 20,
  },
  exportFormatOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  exportFormatOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10', // 10% opacity
  },
  exportFormatRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[400],
    marginRight: theme.spacing.sm,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportFormatRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  exportFormatInfo: {
    flex: 1,
  },
  exportFormatTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[800],
    marginBottom: 4,
  },
  exportFormatDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
});