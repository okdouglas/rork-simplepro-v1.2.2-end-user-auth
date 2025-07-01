import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Check, MoreHorizontal, ArrowUpDown } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import StatusBadge from '@/components/StatusBadge';
import { Quote } from '@/types';

interface QuotesTableProps {
  quotes: Quote[];
  selectedQuotes: string[];
  onSelectQuote: (id: string) => void;
  onSelectAll: () => void;
  onQuotePress: (id: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
  getCustomerName: (customerId: string) => string | undefined;
}

const QuotesTable: React.FC<QuotesTableProps> = ({
  quotes,
  selectedQuotes,
  onSelectQuote,
  onSelectAll,
  onQuotePress,
  sortConfig,
  onSort,
  getCustomerName,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <TouchableOpacity 
          style={styles.checkboxCell}
          onPress={onSelectAll}
        >
          <View style={[
            styles.checkbox, 
            selectedQuotes.length === quotes.length && quotes.length > 0 && styles.checkboxSelected
          ]}>
            {selectedQuotes.length === quotes.length && quotes.length > 0 && (
              <Check size={14} color={colors.white} />
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerCell, { width: 100 }]}
          onPress={() => onSort('id')}
        >
          <Text style={styles.headerCellText}>Quote #</Text>
          <ArrowUpDown 
            size={14} 
            color={sortConfig.key === 'id' ? colors.primary : colors.gray[400]} 
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerCell, { width: 180 }]}
          onPress={() => onSort('customerName')}
        >
          <Text style={styles.headerCellText}>Customer</Text>
          <ArrowUpDown 
            size={14} 
            color={sortConfig.key === 'customerName' ? colors.primary : colors.gray[400]} 
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerCell, { width: 120 }]}
          onPress={() => onSort('total')}
        >
          <Text style={styles.headerCellText}>Amount</Text>
          <ArrowUpDown 
            size={14} 
            color={sortConfig.key === 'total' ? colors.primary : colors.gray[400]} 
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerCell, { width: 120 }]}
          onPress={() => onSort('status')}
        >
          <Text style={styles.headerCellText}>Status</Text>
          <ArrowUpDown 
            size={14} 
            color={sortConfig.key === 'status' ? colors.primary : colors.gray[400]} 
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerCell, { width: 120 }]}
          onPress={() => onSort('createdAt')}
        >
          <Text style={styles.headerCellText}>Created</Text>
          <ArrowUpDown 
            size={14} 
            color={sortConfig.key === 'createdAt' ? colors.primary : colors.gray[400]} 
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerCell, { width: 120 }]}
          onPress={() => onSort('expiresAt')}
        >
          <Text style={styles.headerCellText}>Expires</Text>
          <ArrowUpDown 
            size={14} 
            color={sortConfig.key === 'expiresAt' ? colors.primary : colors.gray[400]} 
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>
      
      {/* Table Body */}
      <ScrollView>
        {quotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No quotes found</Text>
          </View>
        ) : (
          quotes.map(quote => {
            const isSelected = selectedQuotes.includes(quote.id);
            const customerName = getCustomerName(quote.customerId) || 'Unknown';
            
            return (
              <View 
                key={quote.id}
                style={[styles.tableRow, isSelected && styles.selectedRow]}
              >
                <TouchableOpacity 
                  style={styles.checkboxCell}
                  onPress={() => onSelectQuote(quote.id)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Check size={14} color={colors.white} />}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.tableRowContent}
                  onPress={() => onQuotePress(quote.id)}
                >
                  <View style={[styles.tableCell, { width: 100 }]}>
                    <Text style={styles.tableCellText}>#{quote.id}</Text>
                  </View>
                  
                  <View style={[styles.tableCell, { width: 180 }]}>
                    <Text style={styles.tableCellText} numberOfLines={1}>{customerName}</Text>
                  </View>
                  
                  <View style={[styles.tableCell, { width: 120 }]}>
                    <Text style={styles.tableCellAmount}>{formatCurrency(quote.total)}</Text>
                  </View>
                  
                  <View style={[styles.tableCell, { width: 120 }]}>
                    <StatusBadge status={quote.status} type="quote" size="sm" />
                  </View>
                  
                  <View style={[styles.tableCell, { width: 120 }]}>
                    <Text style={styles.tableCellText}>{formatDate(quote.createdAt)}</Text>
                  </View>
                  
                  <View style={[styles.tableCell, { width: 120 }]}>
                    <Text style={styles.tableCellText}>{formatDate(quote.expiresAt)}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  headerCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  tableRowContent: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  selectedRow: {
    backgroundColor: colors.primary + '10', // 10% opacity
  },
  checkboxCell: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tableCell: {
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  tableCellText: {
    fontSize: 14,
    color: colors.gray[800],
  },
  tableCellAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray[500],
  },
});

export default QuotesTable;