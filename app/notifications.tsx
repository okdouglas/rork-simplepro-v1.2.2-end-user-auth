import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Bell, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, PenTool, FileCheck } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Notification, NotificationType } from '@/types';
import { useQuoteStore } from '@/store/quoteStore';

// Mock notifications
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Upcoming Job',
    message: 'AC Repair for John Smith scheduled tomorrow at 9:00 AM',
    time: '1 hour ago',
    read: false,
    relatedId: 'job_1',
    relatedType: 'job',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    message: 'Sarah Johnson paid invoice #1234 for $1,201.56',
    time: '3 hours ago',
    read: false,
    relatedId: 'invoice_1234',
    relatedType: 'invoice',
  },
  {
    id: '3',
    type: 'alert',
    title: 'Overdue Invoice',
    message: 'Invoice #1122 for Emily Davis is 5 days overdue',
    time: '1 day ago',
    read: true,
    relatedId: 'invoice_1122',
    relatedType: 'invoice',
  },
  {
    id: '4',
    type: 'update',
    title: 'Quote Approved',
    message: 'Mike Williams approved quote #3456 for $269.53',
    time: '2 days ago',
    read: true,
    relatedId: '3456',
    relatedType: 'quote',
  },
  {
    id: '5',
    type: 'reminder',
    title: 'Job Completed',
    message: 'Water Heater Installation for Sarah Johnson marked as completed',
    time: '3 days ago',
    read: true,
    relatedId: 'job_2',
    relatedType: 'job',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { quotes, checkQuoteSignatureStatus } = useQuoteStore();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [refreshing, setRefreshing] = useState(false);
  
  // Check for quote signatures on load
  useEffect(() => {
    checkForSignedQuotes();
  }, [quotes]);
  
  const checkForSignedQuotes = async () => {
    // Find quotes with signature IDs that are in 'sent' status
    const quotesWithSignatures = quotes.filter(
      quote => quote.status === 'sent' && quote.signatureId
    );
    
    // Check each quote for signature status
    for (const quote of quotesWithSignatures) {
      try {
        const status = await checkQuoteSignatureStatus(quote.id);
        
        // If the quote was signed, add a notification
        if (status.status === 'completed' && status.signedBy) {
          // Check if we already have a notification for this signature
          const existingNotification = notifications.find(
            n => n.relatedId === quote.id && n.type === 'signature'
          );
          
          if (!existingNotification) {
            // Add a new notification
            const newNotification: Notification = {
              id: `sig_${Date.now()}`,
              type: 'signature',
              title: 'Quote Signed',
              message: `Quote #${quote.id} was signed by ${status.signedBy}`,
              time: 'Just now',
              read: false,
              relatedId: quote.id,
              relatedType: 'quote',
              actionUrl: `/quotes/${quote.id}`,
            };
            
            setNotifications(prev => [newNotification, ...prev]);
          }
        }
      } catch (error) {
        console.error('Error checking signature status:', error);
      }
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await checkForSignedQuotes();
    setRefreshing(false);
  };
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'reminder':
        return <Calendar size={24} color={colors.primary} />;
      case 'payment':
        return <DollarSign size={24} color={colors.secondary} />;
      case 'alert':
        return <AlertTriangle size={24} color={colors.warning} />;
      case 'update':
        return <CheckCircle size={24} color={colors.primary} />;
      case 'signature':
        return <PenTool size={24} color={colors.primary} />;
      default:
        return <Bell size={24} color={colors.gray[500]} />;
    }
  };
  
  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    
    // Navigate to the related item
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.relatedType && notification.relatedId) {
      switch (notification.relatedType) {
        case 'quote':
          router.push(`/quotes/${notification.relatedId}`);
          break;
        case 'job':
          router.push(`/jobs/${notification.relatedId}`);
          break;
        case 'invoice':
          // Assuming you have an invoices route
          router.push(`/invoices/${notification.relatedId}`);
          break;
        case 'customer':
          router.push(`/customers/${notification.relatedId}`);
          break;
      }
    }
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Recent Notifications</Text>
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllRead}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
          
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <TouchableOpacity 
                key={notification.id}
                style={[
                  styles.notificationItem,
                  notification.read ? styles.readNotification : styles.unreadNotification,
                ]}
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </View>
                
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <View style={styles.notificationTime}>
                    <Clock size={12} color={colors.gray[500]} />
                    <Text style={styles.timeText}>{notification.time}</Text>
                  </View>
                </View>
                
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Bell size={48} color={colors.gray[400]} />
              <Text style={styles.emptyStateTitle}>No Notifications</Text>
              <Text style={styles.emptyStateMessage}>
                You don't have any notifications at the moment
              </Text>
            </View>
          )}
          
          {/* Signature Notifications Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Document Signatures</Text>
          </View>
          
          {notifications.filter(n => n.type === 'signature').length > 0 ? (
            notifications
              .filter(n => n.type === 'signature')
              .map((notification) => (
                <TouchableOpacity 
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    styles.signatureNotification,
                    notification.read ? styles.readNotification : styles.unreadNotification,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View style={[styles.notificationIcon, styles.signatureIcon]}>
                    <FileCheck size={24} color={colors.white} />
                  </View>
                  
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <View style={styles.notificationTime}>
                      <Clock size={12} color={colors.gray[500]} />
                      <Text style={styles.timeText}>{notification.time}</Text>
                    </View>
                  </View>
                  
                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))
          ) : (
            <View style={styles.emptySignatures}>
              <Text style={styles.emptySignaturesText}>
                No signature notifications
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
  },
  markAllRead: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  sectionHeader: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  signatureNotification: {
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  readNotification: {
    opacity: 0.8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  signatureIcon: {
    backgroundColor: colors.secondary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.gray[700],
    marginBottom: 8,
  },
  notificationTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: theme.spacing.sm,
    alignSelf: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  emptySignatures: {
    padding: theme.spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  emptySignaturesText: {
    fontSize: 14,
    color: colors.gray[500],
  },
});