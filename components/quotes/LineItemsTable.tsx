import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { QuoteItem } from '@/types';

interface LineItemsTableProps {
  items: QuoteItem[];
  onUpdateItem: (item: QuoteItem) => void;
  onRemoveItem: (itemId: string) => void;
}

export default function LineItemsTable({ items, onUpdateItem, onRemoveItem }: LineItemsTableProps) {
  const handleUpdateField = (id: string, field: keyof QuoteItem, value: string | number) => {
    const item = items.find(item => item.id === id);
    if (!item) return;

    let updatedItem: QuoteItem;

    if (field === 'quantity' || field === 'unitPrice') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      
      if (field === 'quantity') {
        updatedItem = {
          ...item,
          quantity: numValue,
          total: numValue * item.unitPrice,
        };
      } else {
        updatedItem = {
          ...item,
          unitPrice: numValue,
          total: item.quantity * numValue,
        };
      }
    } else {
      updatedItem = {
        ...item,
        [field]: value,
      };
    }

    onUpdateItem(updatedItem);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.descriptionHeader]}>Description</Text>
        <Text style={[styles.headerCell, styles.qtyHeader]}>Qty</Text>
        <Text style={[styles.headerCell, styles.priceHeader]}>Price</Text>
        <Text style={[styles.headerCell, styles.totalHeader]}>Total</Text>
        <View style={styles.actionHeader} />
      </View>

      <ScrollView style={styles.itemsContainer}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.descriptionCell}>
              <TextInput
                style={styles.input}
                value={item.name}
                onChangeText={(text) => handleUpdateField(item.id, 'name', text)}
                placeholder="Item name"
              />
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={item.description || ''}
                onChangeText={(text) => handleUpdateField(item.id, 'description', text)}
                placeholder="Description (optional)"
              />
            </View>
            
            <TextInput
              style={[styles.input, styles.qtyInput]}
              value={item.quantity.toString()}
              onChangeText={(text) => handleUpdateField(item.id, 'quantity', text)}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[styles.input, styles.priceInput]}
              value={item.unitPrice.toString()}
              onChangeText={(text) => handleUpdateField(item.id, 'unitPrice', text)}
              keyboardType="numeric"
              placeholder="0.00"
            />
            
            <Text style={styles.totalText}>
              ${item.total.toFixed(2)}
            </Text>
            
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => onRemoveItem(item.id)}
            >
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  headerCell: {
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
  actionHeader: {
    width: 40,
  },
  itemsContainer: {
    maxHeight: 300,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  descriptionCell: {
    flex: 3,
    paddingRight: theme.spacing.xs,
  },
  input: {
    fontSize: 14,
    color: colors.gray[800],
    padding: 0,
  },
  descriptionInput: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  qtyInput: {
    flex: 1,
    textAlign: 'center',
  },
  priceInput: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalText: {
    flex: 1.5,
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[800],
    textAlign: 'right',
  },
  removeButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
  },
});