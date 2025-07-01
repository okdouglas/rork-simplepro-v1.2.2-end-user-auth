import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, Phone, Mail, MapPin, Calendar, Clock, DollarSign, 
  FileText, Award, Repeat, AlertTriangle, UserPlus, 
  Bell, MessageCircle, Send, Trash2, Edit2, X
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useCustomerStore } from '@/store/customerStore';
import { Customer, CustomerSegment } from '@/types';
import Button from '@/components/Button';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getCustomerById, updateCustomer, deleteCustomer, addCustomerCampaign, removeCustomerFromCampaign } = useCustomerStore();
  
  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingCampaign, setIsRemovingCampaign] = useState(false);
  
  useEffect(() => {
    if (id) {
      const customerData = getCustomerById(id);
      setCustomer(customerData);
      setIsLoading(false);
    }
  }, [id, getCustomerById]);
  
  const handleEdit = () => {
    router.push(`/customers/edit/${id}`);
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    Alert.alert(
      "Delete Customer",
      "Are you sure you want to delete this customer? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteCustomer(id);
              router.back();
            } catch (error) {
              console.error('Failed to delete customer:', error);
              Alert.alert("Error", "Failed to delete customer. Please try again.");
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };
  
  const handleCreateCampaign = async (campaignType: string) => {
    if (!id) return;
    
    try {
      await addCustomerCampaign(id, campaignType);
      // Refresh customer data
      const updatedCustomer = getCustomerById(id);
      setCustomer(updatedCustomer);
      Alert.alert("Success", `Added customer to ${campaignType.replace('_', ' ')} campaign.`);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      Alert.alert("Error", "Failed to add customer to campaign. Please try again.");
    }
  };
  
  const handleRemoveCampaign = async (campaignId: string) => {
    if (!id) return;
    
    Alert.alert(
      "Remove Campaign",
      "Are you sure you want to remove this customer from this campaign?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          onPress: async () => {
            setIsRemovingCampaign(true);
            try {
              await removeCustomerFromCampaign(id, campaignId);
              // Refresh customer data
              const updatedCustomer = getCustomerById(id);
              setCustomer(updatedCustomer);
              Alert.alert("Success", "Customer removed from campaign.");
            } catch (error) {
              console.error('Failed to remove campaign:', error);
              Alert.alert("Error", "Failed to remove customer from campaign. Please try again.");
            } finally {
              setIsRemovingCampaign(false);
            }
          }
        }
      ]
    );
  };
  
  const handleContact = (method: 'call' | 'email' | 'sms') => {
    // In a real app, this would initiate the contact method
    console.log(`Contact customer via ${method}`);
  };
  
  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get segment badge details
  const getSegmentBadge = (segment?: CustomerSegment) => {
    switch (segment) {
      case 'vip':
        return { 
          icon: <Award size={16} color={colors.white} />,
          color: colors.secondary,
          label: 'VIP Customer'
        };
      case 'recurring':
        return { 
          icon: <Repeat size={16} color={colors.white} />,
          color: colors.primaryLight,
          label: 'Recurring Customer'
        };
      case 'at_risk':
        return { 
          icon: <AlertTriangle size={16} color={colors.white} />,
          color: colors.danger,
          label: 'At Risk Customer'
        };
      case 'new':
        return { 
          icon: <UserPlus size={16} color={colors.white} />,
          color: colors.warningLight,
          label: 'New Customer'
        };
      default:
        return { 
          icon: <User size={16} color={colors.white} />,
          color: colors.gray[500],
          label: 'Customer'
        };
    }
  };
  
  // Get campaign icon and color
  const getCampaignDetails = (campaignType: string) => {
    switch (campaignType) {
      case 'reminder':
        return { 
          icon: <Bell size={16} color={colors.white} />,
          color: colors.primary,
          label: 'Service Reminder'
        };
      case 'seasonal':
        return { 
          icon: <Calendar size={16} color={colors.white} />,
          color: colors.secondary,
          label: 'Seasonal Campaign'
        };
      case 'win_back':
        return { 
          icon: <Repeat size={16} color={colors.white} />,
          color: colors.warningLight,
          label: 'Win-Back Campaign'
        };
      case 'follow_up':
        return { 
          icon: <MessageCircle size={16} color={colors.white} />,
          color: colors.blue[500],
          label: 'Follow-Up'
        };
      case 'new_customer':
        return { 
          icon: <UserPlus size={16} color={colors.white} />,
          color: colors.blue[500],
          label: 'New Customer Welcome'
        };
      default:
        return { 
          icon: <Bell size={16} color={colors.white} />,
          color: colors.gray[500],
          label: 'Campaign'
        };
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }
  
  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Customer Not Found',
            headerBackTitle: 'Back',
          }} 
        />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Customer not found</Text>
          <Button 
            title="Go Back" 
            onPress={() => router.back()} 
            variant="primary"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const segmentBadge = getSegmentBadge(customer.segment);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{ 
          title: customer.name,
          headerBackTitle: 'Customers',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={handleEdit}
              >
                <Edit2 size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 size={20} color={colors.danger} />
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
        {/* Customer Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInitials}>
            <Text style={styles.initialsText}>
              {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.customerName}>{customer.name}</Text>
            
            <View style={[styles.segmentBadge, { backgroundColor: segmentBadge.color }]}>
              {segmentBadge.icon}
              <Text style={styles.segmentText}>{segmentBadge.label}</Text>
            </View>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleContact('call')}
          >
            <Phone size={20} color={colors.primary} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleContact('sms')}
          >
            <MessageCircle size={20} color={colors.primary} />
            <Text style={styles.actionText}>Text</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleContact('email')}
          >
            <Mail size={20} color={colors.primary} />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/quotes/new?customerId=${customer.id}`)}
          >
            <FileText size={20} color={colors.primary} />
            <Text style={styles.actionText}>Quote</Text>
          </TouchableOpacity>
        </View>
        
        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Phone size={18} color={colors.gray[600]} />
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{customer.phone}</Text>
            </View>
            
            {customer.email && (
              <View style={styles.infoRow}>
                <Mail size={18} color={colors.gray[600]} />
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{customer.email}</Text>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <MapPin size={18} color={colors.gray[600]} />
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{customer.address}</Text>
            </View>
            
            {customer.communicationPreference && (
              <View style={styles.infoRow}>
                <Bell size={18} color={colors.gray[600]} />
                <Text style={styles.infoLabel}>Preferred Contact:</Text>
                <Text style={styles.infoValue}>
                  {customer.communicationPreference.charAt(0).toUpperCase() + 
                   customer.communicationPreference.slice(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Customer Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Insights</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <DollarSign size={18} color={colors.gray[600]} />
              <Text style={styles.infoLabel}>Lifetime Value:</Text>
              <Text style={styles.infoValue}>${customer.lifetimeValue || 0}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <FileText size={18} color={colors.gray[600]} />
              <Text style={styles.infoLabel}>Total Jobs:</Text>
              <Text style={styles.infoValue}>{customer.totalJobs || 0}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Calendar size={18} color={colors.gray[600]} />
              <Text style={styles.infoLabel}>Last Service:</Text>
              <Text style={styles.infoValue}>{formatDate(customer.lastServiceDate)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={18} color={colors.gray[600]} />
              <Text style={styles.infoLabel}>Customer Since:</Text>
              <Text style={styles.infoValue}>{formatDate(customer.createdAt)}</Text>
            </View>
          </View>
        </View>
        
        {/* Property Information */}
        {customer.property && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Information</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type:</Text>
                <Text style={styles.infoValue}>
                  {customer.property.type.charAt(0).toUpperCase() + customer.property.type.slice(1)}
                </Text>
              </View>
              
              {customer.property.size && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Size:</Text>
                  <Text style={styles.infoValue}>{customer.property.size} sq ft</Text>
                </View>
              )}
              
              {customer.property.yearBuilt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Year Built:</Text>
                  <Text style={styles.infoValue}>{customer.property.yearBuilt}</Text>
                </View>
              )}
            </View>
            
            {/* Equipment */}
            {customer.property.equipment && customer.property.equipment.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Equipment</Text>
                
                {customer.property.equipment.map((equipment, index) => (
                  <View key={index} style={styles.equipmentCard}>
                    <Text style={styles.equipmentType}>{equipment.type}</Text>
                    
                    <View style={styles.equipmentDetails}>
                      {equipment.brand && (
                        <View style={styles.equipmentDetail}>
                          <Text style={styles.detailLabel}>Brand:</Text>
                          <Text style={styles.detailValue}>{equipment.brand}</Text>
                        </View>
                      )}
                      
                      {equipment.model && (
                        <View style={styles.equipmentDetail}>
                          <Text style={styles.detailLabel}>Model:</Text>
                          <Text style={styles.detailValue}>{equipment.model}</Text>
                        </View>
                      )}
                      
                      {equipment.installDate && (
                        <View style={styles.equipmentDetail}>
                          <Text style={styles.detailLabel}>Installed:</Text>
                          <Text style={styles.detailValue}>{formatDate(equipment.installDate)}</Text>
                        </View>
                      )}
                      
                      {equipment.lastServiceDate && (
                        <View style={styles.equipmentDetail}>
                          <Text style={styles.detailLabel}>Last Service:</Text>
                          <Text style={styles.detailValue}>{formatDate(equipment.lastServiceDate)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        
        {/* Next Recommended Service */}
        {customer.nextRecommendedService && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Service</Text>
            
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationType}>
                {customer.nextRecommendedService.type}
              </Text>
              <Text style={styles.recommendationDate}>
                Due by: {formatDate(customer.nextRecommendedService.dueDate)}
              </Text>
              
              <TouchableOpacity 
                style={styles.recommendationButton}
                onPress={() => router.push(`/quotes/new?customerId=${customer.id}&service=${customer.nextRecommendedService?.type}`)}
              >
                <Text style={styles.recommendationButtonText}>Create Quote</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Marketing Campaigns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Marketing Campaigns</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                Alert.alert(
                  "Add to Campaign",
                  "Select a campaign type",
                  [
                    { text: "Service Reminder", onPress: () => handleCreateCampaign('reminder') },
                    { text: "Seasonal", onPress: () => handleCreateCampaign('seasonal') },
                    { text: "Win-Back", onPress: () => handleCreateCampaign('win_back') },
                    { text: "New Customer", onPress: () => handleCreateCampaign('new_customer') },
                    { text: "Cancel", style: "cancel" }
                  ]
                );
              }}
            >
              <Text style={styles.addButtonText}>Add Campaign</Text>
            </TouchableOpacity>
          </View>
          
          {customer.campaigns && customer.campaigns.length > 0 ? (
            customer.campaigns.map((campaign, index) => {
              const campaignDetails = getCampaignDetails(campaign.type);
              
              return (
                <View key={index} style={styles.campaignCard}>
                  <View style={styles.campaignHeader}>
                    <View style={styles.campaignTitleContainer}>
                      <View style={[styles.campaignTypeIcon, { backgroundColor: campaignDetails.color }]}>
                        {campaignDetails.icon}
                      </View>
                      <Text style={styles.campaignType}>
                        {campaignDetails.label}
                      </Text>
                    </View>
                    
                    <View style={styles.campaignActions}>
                      <View style={[
                        styles.statusBadge,
                        { 
                          backgroundColor: 
                            campaign.status === 'scheduled' ? colors.secondary + '20' :
                            campaign.status === 'completed' ? colors.gray[300] :
                            colors.primary + '20'
                        }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { 
                            color: 
                              campaign.status === 'scheduled' ? colors.secondary :
                              campaign.status === 'completed' ? colors.gray[700] :
                              colors.primary
                          }
                        ]}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.removeCampaignButton}
                        onPress={() => handleRemoveCampaign(campaign.id)}
                        disabled={isRemovingCampaign}
                      >
                        <X size={16} color={colors.gray[500]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.campaignDetails}>
                    {campaign.scheduledDate && (
                      <View style={styles.campaignDetail}>
                        <Calendar size={14} color={colors.gray[600]} />
                        <Text style={styles.campaignDetailText}>
                          Scheduled: {formatDate(campaign.scheduledDate)}
                        </Text>
                      </View>
                    )}
                    
                    {campaign.sentDate && (
                      <View style={styles.campaignDetail}>
                        <Send size={14} color={colors.gray[600]} />
                        <Text style={styles.campaignDetailText}>
                          Sent: {formatDate(campaign.sentDate)}
                        </Text>
                      </View>
                    )}
                    
                    {(campaign.opened !== undefined || campaign.clicked !== undefined) && (
                      <View style={styles.campaignStats}>
                        {campaign.opened !== undefined && (
                          <View style={[
                            styles.statBadge,
                            { backgroundColor: campaign.opened ? colors.secondary + '20' : colors.gray[200] }
                          ]}>
                            <Text style={[
                              styles.statText,
                              { color: campaign.opened ? colors.secondary : colors.gray[600] }
                            ]}>
                              {campaign.opened ? 'Opened' : 'Not Opened'}
                            </Text>
                          </View>
                        )}
                        
                        {campaign.clicked !== undefined && (
                          <View style={[
                            styles.statBadge,
                            { backgroundColor: campaign.clicked ? colors.primary + '20' : colors.gray[200] }
                          ]}>
                            <Text style={[
                              styles.statText,
                              { color: campaign.clicked ? colors.primary : colors.gray[600] }
                            ]}>
                              {campaign.clicked ? 'Clicked' : 'Not Clicked'}
                            </Text>
                          </View>
                        )}
                        
                        {campaign.converted !== undefined && (
                          <View style={[
                            styles.statBadge,
                            { backgroundColor: campaign.converted ? colors.secondary + '20' : colors.gray[200] }
                          ]}>
                            <Text style={[
                              styles.statText,
                              { color: campaign.converted ? colors.secondary : colors.gray[600] }
                            ]}>
                              {campaign.converted ? 'Converted' : 'Not Converted'}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No active campaigns</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => {
                  Alert.alert(
                    "Add to Campaign",
                    "Select a campaign type",
                    [
                      { text: "Service Reminder", onPress: () => handleCreateCampaign('reminder') },
                      { text: "Seasonal", onPress: () => handleCreateCampaign('seasonal') },
                      { text: "Win-Back", onPress: () => handleCreateCampaign('win_back') },
                      { text: "New Customer", onPress: () => handleCreateCampaign('new_customer') },
                      { text: "Cancel", style: "cancel" }
                    ]
                  );
                }}
              >
                <Text style={styles.emptyStateButtonText}>Create Campaign</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          
          {customer.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{customer.notes}</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No notes added</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleEdit}
              >
                <Text style={styles.emptyStateButtonText}>Add Note</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: colors.background,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.gray[600],
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  profileInitials: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  initialsText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: theme.spacing.xs,
  },
  segmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    color: colors.gray[700],
    marginTop: 4,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    width: 100,
    marginLeft: theme.spacing.sm,
  },
  infoValue: {
    fontSize: 14,
    color: colors.gray[900],
    flex: 1,
  },
  subsection: {
    marginTop: theme.spacing.md,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  equipmentCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  equipmentType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  equipmentDetails: {
    marginLeft: theme.spacing.sm,
  },
  equipmentDetail: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[600],
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: colors.gray[800],
  },
  recommendationCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  recommendationType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  recommendationDate: {
    fontSize: 14,
    color: colors.gray[700],
    marginBottom: theme.spacing.md,
  },
  recommendationButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  recommendationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  campaignCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  campaignTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
  },
  campaignType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
  },
  campaignActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeCampaignButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignDetails: {
    marginTop: theme.spacing.xs,
  },
  campaignDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  campaignDetailText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: theme.spacing.sm,
  },
  campaignStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  statBadge: {
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  notesText: {
    fontSize: 14,
    color: colors.gray[800],
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: theme.spacing.sm,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
});