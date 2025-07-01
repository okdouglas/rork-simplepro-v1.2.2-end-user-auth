import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { User, Phone, MapPin, Mail, Calendar, DollarSign, AlertTriangle, Award, Repeat, UserPlus, Bell, MessageCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Customer } from '@/types';

interface CustomerCardProps {
  customer: Customer;
  onPress: () => void;
}

export default function CustomerCard({ customer, onPress }: CustomerCardProps) {
  // Format the last service date if it exists
  const formattedLastServiceDate = customer.lastServiceDate 
    ? new Date(customer.lastServiceDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    : 'No service history';

  // Get the appropriate segment icon and color
  const getSegmentDetails = () => {
    switch (customer.segment) {
      case 'vip':
        return { 
          icon: <Award size={14} color={colors.white} />,
          color: colors.secondary,
          label: 'VIP'
        };
      case 'recurring':
        return { 
          icon: <Repeat size={14} color={colors.white} />,
          color: colors.primaryLight,
          label: 'Recurring'
        };
      case 'at_risk':
        return { 
          icon: <AlertTriangle size={14} color={colors.white} />,
          color: colors.danger,
          label: 'At Risk'
        };
      case 'new':
        return { 
          icon: <UserPlus size={14} color={colors.white} />,
          color: colors.warningLight,
          label: 'New'
        };
      default:
        return { 
          icon: <User size={14} color={colors.white} />,
          color: colors.gray[500],
          label: 'Customer'
        };
    }
  };

  const segmentDetails = getSegmentDetails();

  // Count active campaigns
  const activeCampaignsCount = customer.campaigns?.filter(
    campaign => campaign.status === 'scheduled' || campaign.status === 'sent'
  ).length || 0;

  // Get campaign types for display
  const getCampaignTypes = () => {
    if (!customer.campaigns || customer.campaigns.length === 0) return null;
    
    const campaignTypes = customer.campaigns
      .filter(campaign => campaign.status === 'scheduled' || campaign.status === 'sent')
      .map(campaign => {
        switch (campaign.type) {
          case 'reminder':
            return { icon: <Bell size={12} color={colors.primary} />, name: 'Reminder' };
          case 'seasonal':
            return { icon: <Calendar size={12} color={colors.secondary} />, name: 'Seasonal' };
          case 'win_back':
            return { icon: <Repeat size={12} color={colors.warningLight} />, name: 'Win-back' };
          case 'follow_up':
            return { icon: <MessageCircle size={12} color={colors.blue[500]} />, name: 'Follow-up' };
          default:
            return { icon: <Bell size={12} color={colors.gray[500]} />, name: 'Campaign' };
        }
      });
    
    return campaignTypes;
  };

  const campaignTypes = getCampaignTypes();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        customer.segment === 'vip' && styles.vipContainer
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.customerInitials}>
          <Text style={styles.initialsText}>
            {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.headerContent}>
          <Text style={styles.customerName}>{customer.name}</Text>
          
          <View style={[styles.segmentBadge, { backgroundColor: segmentDetails.color }]}>
            {segmentDetails.icon}
            <Text style={styles.segmentText}>{segmentDetails.label}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Phone size={14} color={colors.gray[500]} />
          <Text style={styles.detailText}>{customer.phone}</Text>
        </View>
        
        {customer.email && (
          <View style={styles.detailRow}>
            <Mail size={14} color={colors.gray[500]} />
            <Text style={styles.detailText} numberOfLines={1}>{customer.email}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <MapPin size={14} color={colors.gray[500]} />
          <Text style={styles.detailText} numberOfLines={1}>{customer.address}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Calendar size={14} color={colors.gray[600]} />
          <Text style={styles.footerText}>{formattedLastServiceDate}</Text>
        </View>
        
        {customer.lifetimeValue && (
          <View style={styles.footerItem}>
            <DollarSign size={14} color={colors.gray[600]} />
            <Text style={styles.footerText}>${customer.lifetimeValue}</Text>
          </View>
        )}
        
        {customer.totalJobs && (
          <View style={styles.jobCountBadge}>
            <Text style={styles.jobCountText}>{customer.totalJobs} jobs</Text>
          </View>
        )}
      </View>
      
      {activeCampaignsCount > 0 && campaignTypes && (
        <View style={styles.campaignsContainer}>
          <Text style={styles.campaignsTitle}>Active Campaigns:</Text>
          <View style={styles.campaignsList}>
            {campaignTypes.map((campaign, index) => (
              <View key={index} style={styles.campaignItem}>
                {campaign.icon}
                <Text style={styles.campaignName}>{campaign.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {customer.nextRecommendedService && (
        <View style={styles.recommendationContainer}>
          <Text style={styles.recommendationText}>
            Recommended: {customer.nextRecommendedService.type}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  vipContainer: {
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
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
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  segmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 4,
  },
  detailsContainer: {
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: theme.spacing.sm,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.gray[700],
    marginLeft: 6,
  },
  jobCountBadge: {
    backgroundColor: colors.gray[100],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  jobCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[700],
  },
  campaignsContainer: {
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: theme.spacing.sm,
  },
  campaignsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 4,
  },
  campaignsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  campaignItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  campaignName: {
    fontSize: 11,
    color: colors.gray[800],
    marginLeft: 4,
  },
  recommendationContainer: {
    backgroundColor: colors.primary + '10', // 10% opacity
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});