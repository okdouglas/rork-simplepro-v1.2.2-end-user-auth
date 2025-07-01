import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { X, Send, MessageCircle, ArrowRightCircle, Download } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';

interface QuotesToolbarProps {
  selectedQuotes: string[];
  onClearSelection: () => void;
  onNavigateToQuote: (quoteId: string) => void;
  onExportSelected?: () => void;
}

const QuotesToolbar: React.FC<QuotesToolbarProps> = ({
  selectedQuotes,
  onClearSelection,
  onNavigateToQuote,
  onExportSelected,
}) => {
  const selectedCount = selectedQuotes.length;
  
  if (selectedCount === 0) return null;
  
  // Navigate to the first selected quote
  const handleButtonPress = (action: string) => {
    if (selectedQuotes.length > 0) {
      onNavigateToQuote(selectedQuotes[0]);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>{selectedCount} selected</Text>
      </View>
      
      <View style={styles.actions}>
        <Button
          title="Send"
          onPress={() => handleButtonPress('send')}
          variant="outline"
          size="sm"
          icon={<Send size={16} color={colors.primary} />}
          style={styles.actionButton}
        />
        
        <Button
          title="Follow Up"
          onPress={() => handleButtonPress('followUp')}
          variant="outline"
          size="sm"
          icon={<MessageCircle size={16} color={colors.primary} />}
          style={styles.actionButton}
        />
        
        <Button
          title="Convert"
          onPress={() => handleButtonPress('convert')}
          variant="outline"
          size="sm"
          icon={<ArrowRightCircle size={16} color={colors.primary} />}
          style={styles.actionButton}
        />
        
        {onExportSelected && (
          <Button
            title="Export"
            onPress={onExportSelected}
            variant="outline"
            size="sm"
            icon={<Download size={16} color={colors.quickbooks} />}
            style={styles.actionButton}
          />
        )}
        
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={onClearSelection}
        >
          <X size={20} color={colors.gray[600]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: theme.spacing.xs,
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuotesToolbar;