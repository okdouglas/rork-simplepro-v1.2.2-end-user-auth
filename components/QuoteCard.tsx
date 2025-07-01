import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, User, DollarSign, FileText, PenTool, ChevronRight, MoreHorizontal } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import StatusBadge from './StatusBadge';
import { Quote } from '@/types';
import { useCustomerStore } from '@/store/customerStore';

interface QuoteCardProps {
  quote: Quote;
  isSelected?: boolean;
  onSelect?: () => void;
  onPress?: () => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ 
  quote, 
  isSelected = false, 
  onSelect, 
  onPress 
}) => {
  const router = useRouter();
  const { getCustomerById } = useCustomerStore();
  const customer = getCustomerById(quote.customerId);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/quotes/${quote.id}`);
    }
  };

  // Calculate days since creation or until expiry
  const getDaysInfo = () => {
    const now = new Date();
    const createdDate = new Date(quote.createdAt);
    
    if (quote.expiresAt) {
      const expiryDate = new Date(quote.expiresAt);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        return { text: 'Expired', color: colors.danger };
      } else if (daysUntilExpiry <= 7) {
        return { text: `Expires in ${daysUntilExpiry} days`, color: colors.warning };
      } else {
        return { text: `Expires in ${daysUntilExpiry} days`, color: colors.gray[600] };
      }
    } else {
      const daysSinceCreation = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return { text: `Created ${daysSinceCreation} days ago`, color: colors.gray[600] };
    }
  };
  
  const daysInfo = getDaysInfo();
  
  // Get appropriate action button based on status
  const getActionButton = () => {
    switch (quote.status) {
      case 'draft':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => console.log('Send quote')}
          >
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>
        );
      case 'sent':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.info }]}
            onPress={() => console.log('Follow up')}
          >
            <Text style={styles.actionButtonText}>Follow Up</Text>
          </TouchableOpacity>
        );
      case 'approved':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => console.log('Convert to job')}
          >
            <Text style={styles.actionButtonText}>Convert</Text>
          </TouchableOpacity>
        );
      case 'rejected':
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.gray[500] }]}
            onPress={() => console.log('Revise quote')}
          >
            <Text style={styles.actionButtonText}>Revise</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };
  
  return (
    <View style={[styles.container, isSelected && styles.selectedContainer]}>
      {/* Selection checkbox */}
      {onSelect && (
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={onSelect}
        >
          <View style={[styles.checkboxInner, isSelected && styles.checkboxSelected]}>
            {isSelected && <View style={styles.checkboxDot} />}
          </View>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Header with status badge */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.quoteNumber}>
              Quote #{quote.id}
            </Text>
            <Text style={styles.title}>
              {quote.title || (customer ? `${customer.name}'s Quote` : 'Untitled Quote')}
            </Text>
          </View>
          <StatusBadge status={quote.status} type="quote" size="md" />
        </View>
        
        {/* Main content */}
        <View style={styles.content}>
          <View style={styles.leftContent}>
            {/* Customer info */}
            <View style={styles.infoRow}>
              <User size={16} color={colors.gray[500]} />
              <Text style={styles.infoText}>
                {customer ? customer.name : 'Unknown Customer'}
              </Text>
            </View>
            
            {/* Created date */}
            <View style={styles.infoRow}>
              <Calendar size={16} color={colors.gray[500]} />
              <Text style={styles.infoText}>
                Created: {formatDate(quote.createdAt)}
              </Text>
            </View>
            
            {/* Expiry date */}
            {quote.expiresAt && (
              <View style={styles.infoRow}>
                <Clock size={16} color={daysInfo.color} />
                <Text style={[styles.infoText, { color: daysInfo.color }]}>
                  {daysInfo.text}
                </Text>
              </View>
            )}
            
            {/* Items count */}
            <View style={styles.infoRow}>
              <FileText size={16} color={colors.gray[500]} />
              <Text style={styles.infoText}>
                {quote.items.length} {quote.items.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>
          
          <View style={styles.rightContent}>
            {/* Amount */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total</Text>
              <Text style={styles.amount}>{formatCurrency(quote.total)}</Text>
            </View>
            
            {/* Signature status */}
            {quote.signatureId && (
              <View style={styles.signatureContainer}>
                <PenTool size={14} color={quote.signedBy ? colors.success : colors.primary} />
                <Text style={[styles.signatureText, { 
                  color: quote.signedBy ? colors.success : colors.primary 
                }]}>
                  {quote.signedBy ? `Signed by ${quote.signedBy}` : 'Signature requested'}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Footer with actions */}
        <View style={styles.footer}>
          {getActionButton()}
          
          <View style={styles.footerActions}>
            {quote.pdfUrl && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => console.log('View PDF')}
              >
                <FileText size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => console.log('More options')}
            >
              <MoreHorizontal size={18} color={colors.gray[600]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handlePress}
            >
              <ChevronRight size={18} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  selectedContainer: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05', // 5% opacity
  },
  checkbox: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: theme.spacing.sm,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  quoteNumber: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  content: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  leftContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: theme.spacing.xs,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  signatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  signatureText: {
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.xs,
  },
});

export default QuoteCard;