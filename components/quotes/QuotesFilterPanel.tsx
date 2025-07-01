import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { Calendar, DollarSign, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';

interface DateRange {
  start: string | null;
  end: string | null;
}

interface AmountRange {
  min: number | null;
  max: number | null;
}

interface QuotesFilterPanelProps {
  dateRange: DateRange;
  amountRange: AmountRange;
  onDateRangeChange: (range: DateRange) => void;
  onAmountRangeChange: (range: AmountRange) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onClose: () => void;
}

const QuotesFilterPanel: React.FC<QuotesFilterPanelProps> = ({
  dateRange,
  amountRange,
  onDateRangeChange,
  onAmountRangeChange,
  onApplyFilters,
  onResetFilters,
  onClose,
}) => {
  // Local state for form inputs
  const [localDateRange, setLocalDateRange] = useState<DateRange>(dateRange);
  const [localAmountRange, setLocalAmountRange] = useState<AmountRange>(amountRange);

  const handleApply = () => {
    onDateRangeChange(localDateRange);
    onAmountRangeChange(localAmountRange);
    onApplyFilters();
  };

  const handleReset = () => {
    const emptyDateRange = { start: null, end: null };
    const emptyAmountRange = { min: null, max: null };
    
    setLocalDateRange(emptyDateRange);
    setLocalAmountRange(emptyAmountRange);
    
    onDateRangeChange(emptyDateRange);
    onAmountRangeChange(emptyAmountRange);
    onResetFilters();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Advanced Filters</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {/* Date Range Filter */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Calendar size={18} color={colors.gray[700]} />
            <Text style={styles.filterTitle}>Date Range</Text>
          </View>
          
          <View style={styles.dateRangeInputs}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={localDateRange.start || ''}
                onChangeText={(text) => setLocalDateRange(prev => ({ ...prev, start: text }))}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={localDateRange.end || ''}
                onChangeText={(text) => setLocalDateRange(prev => ({ ...prev, end: text }))}
              />
            </View>
          </View>
          
          <View style={styles.quickDateButtons}>
            <TouchableOpacity 
              style={styles.quickDateButton}
              onPress={() => {
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                
                setLocalDateRange({
                  start: startOfMonth.toISOString().split('T')[0],
                  end: endOfMonth.toISOString().split('T')[0]
                });
              }}
            >
              <Text style={styles.quickDateButtonText}>This Month</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickDateButton}
              onPress={() => {
                const today = new Date();
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                
                setLocalDateRange({
                  start: thirtyDaysAgo.toISOString().split('T')[0],
                  end: today.toISOString().split('T')[0]
                });
              }}
            >
              <Text style={styles.quickDateButtonText}>Last 30 Days</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickDateButton}
              onPress={() => {
                const today = new Date();
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                
                setLocalDateRange({
                  start: startOfYear.toISOString().split('T')[0],
                  end: today.toISOString().split('T')[0]
                });
              }}
            >
              <Text style={styles.quickDateButtonText}>Year to Date</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Amount Range Filter */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <DollarSign size={18} color={colors.gray[700]} />
            <Text style={styles.filterTitle}>Amount Range</Text>
          </View>
          
          <View style={styles.amountRangeInputs}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Min Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={localAmountRange.min?.toString() || ''}
                onChangeText={(text) => setLocalAmountRange(prev => ({ 
                  ...prev, 
                  min: text ? parseFloat(text) : null 
                }))}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Max Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="No limit"
                value={localAmountRange.max?.toString() || ''}
                onChangeText={(text) => setLocalAmountRange(prev => ({ 
                  ...prev, 
                  max: text ? parseFloat(text) : null 
                }))}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.quickAmountButtons}>
            <TouchableOpacity 
              style={styles.quickAmountButton}
              onPress={() => setLocalAmountRange({ min: 0, max: 500 })}
            >
              <Text style={styles.quickAmountButtonText}>Under $500</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAmountButton}
              onPress={() => setLocalAmountRange({ min: 500, max: 2000 })}
            >
              <Text style={styles.quickAmountButtonText}>$500 - $2,000</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAmountButton}
              onPress={() => setLocalAmountRange({ min: 2000, max: null })}
            >
              <Text style={styles.quickAmountButtonText}>Over $2,000</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button
          title="Reset Filters"
          onPress={handleReset}
          variant="outline"
          size="md"
          style={styles.resetButton}
        />
        
        <Button
          title="Apply Filters"
          onPress={handleApply}
          variant="primary"
          size="md"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: theme.spacing.md,
  },
  filterSection: {
    marginBottom: theme.spacing.lg,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginLeft: theme.spacing.xs,
  },
  dateRangeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.gray[700],
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    fontSize: 14,
  },
  quickDateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },
  quickDateButton: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  quickDateButtonText: {
    fontSize: 12,
    color: colors.gray[700],
  },
  amountRangeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },
  quickAmountButton: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  quickAmountButtonText: {
    fontSize: 12,
    color: colors.gray[700],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  resetButton: {
    marginRight: theme.spacing.sm,
  },
});

export default QuotesFilterPanel;