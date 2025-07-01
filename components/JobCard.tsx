import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, MapPin, Phone } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Job } from '@/types';
import StatusBadge from './StatusBadge';
import { customers } from '@/mocks/customers';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const customer = customers.find((c) => c.id === job.customerId);

  const handlePress = () => {
    router.push(`/jobs/${job.id}`);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, theme.shadows.md]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {job.title}
        </Text>
        <StatusBadge status={job.priority} type="priority" />
      </View>
      
      <View style={styles.customerInfo}>
        <Text style={styles.customerName} numberOfLines={1}>
          {customer?.name || 'Unknown Customer'}
        </Text>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Clock size={16} color={colors.gray[500]} />
          <Text style={styles.detailText}>{formatTime(job.scheduledTime)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MapPin size={16} color={colors.gray[500]} />
          <Text style={styles.detailText} numberOfLines={1}>
            {customer?.address.split(',')[0] || 'No address'}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <StatusBadge status={job.status} type="job" />
        
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => {/* Would handle phone call */}}
        >
          <Phone size={16} color={colors.primary} />
          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  customerInfo: {
    marginBottom: theme.spacing.sm,
  },
  customerName: {
    fontSize: 14,
    color: colors.gray[700],
  },
  details: {
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  callText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
});