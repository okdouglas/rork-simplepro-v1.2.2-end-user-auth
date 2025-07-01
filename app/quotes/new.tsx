import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlusCircle, Trash2, Save, Send, ArrowLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { useCustomerStore } from '@/store/customerStore';
import { useQuoteStore } from '@/store/quoteStore';
import { useJobStore } from '@/store/jobStore';
import CustomerSelector from '@/components/quotes/CustomerSelector';
import ServiceCategorySelector from '@/components/quotes/ServiceCategorySelector';
import LineItemsTable from '@/components/quotes/LineItemsTable';
import QuoteTemplateSelector from '@/components/quotes/QuoteTemplateSelector';
import SupplierSelector from '@/components/quotes/SupplierSelector';
import { QuoteItem } from '@/types';

export default function NewQuoteScreen() {
  const params = useLocalSearchParams<{ jobId?: string; customerId?: string }>();
  const router = useRouter();
  const { customers, getCustomerById } = useCustomerStore();
  const { getJobById } = useJobStore();
  const { addQuote } = useQuoteStore();

  // State for the quote
  const [quoteName, setQuoteName] = useState<string>('New Quote');
  const [customerId, setCustomerId] = useState<string>(params.customerId || '');
  const [serviceCategory, setServiceCategory] = useState<string>('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number>(8.5); // Default to Norman, OK tax rate
  const [markupRate, setMarkupRate] = useState<number>(25); // Default markup
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');

  // Calculate totals with markup
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const markedUpSubtotal = subtotal * (1 + markupRate / 100);
  const taxAmount = (markedUpSubtotal * taxRate) / 100;
  const total = markedUpSubtotal + taxAmount;

  useEffect(() => {
    // If jobId is provided, pre-fill customer info
    if (params.jobId) {
      const job = getJobById(params.jobId);
      if (job) {
        setCustomerId(job.customerId);
      }
    }
  }, [params.jobId, getJobById]);

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (updatedItem: QuoteItem) => {
    const updatedItems = items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    setItems(updatedItems);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleApplyTemplate = (templateItems: QuoteItem[], templateName: string) => {
    // Add template items to current items
    setItems([...items, ...templateItems]);
    // Set quote name to template name if it's still the default
    if (quoteName === 'New Quote') {
      setQuoteName(templateName);
    }
  };

  const handleSaveDraft = async () => {
    if (!customerId) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item to the quote');
      return;
    }

    setIsLoading(true);
    try {
      const customer = getCustomerById(customerId);
      const customerName = customer ? customer.name : 'Unknown Customer';
      
      const newQuote = await addQuote({
        customerId,
        customerName,
        items,
        subtotal,
        markedUpSubtotal,
        tax: taxAmount,
        total,
        status: 'draft',
        notes,
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        margin: markupRate, // Store the markup rate as margin
        title: quoteName, // Use the quote name as title
      });
      
      Alert.alert('Success', 'Quote saved as draft and added to leads');
      router.push(`/quotes/${newQuote.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save quote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuote = async () => {
    if (!customerId) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item to the quote');
      return;
    }

    setIsLoading(true);
    try {
      const customer = getCustomerById(customerId);
      const customerName = customer ? customer.name : 'Unknown Customer';
      
      const newQuote = await addQuote({
        customerId,
        customerName,
        items,
        subtotal,
        markedUpSubtotal,
        tax: taxAmount,
        total,
        status: 'sent',
        notes,
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        margin: markupRate, // Store the markup rate as margin
        title: quoteName, // Use the quote name as title
      });
      
      Alert.alert('Success', 'Quote generated and ready to send');
      router.push(`/quotes/${newQuote.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate quote');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Create Quote',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary} />
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quote Name</Text>
            <TextInput
              style={styles.quoteNameInput}
              value={quoteName}
              onChangeText={setQuoteName}
              placeholder="Enter quote name"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <CustomerSelector
              selectedCustomerId={customerId}
              onSelectCustomer={setCustomerId}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Category</Text>
            <ServiceCategorySelector
              selectedCategory={serviceCategory}
              onSelectCategory={setServiceCategory}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Templates</Text>
            </View>
            <QuoteTemplateSelector 
              serviceCategory={serviceCategory}
              onApplyTemplate={handleApplyTemplate}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Supplier</Text>
            </View>
            <SupplierSelector
              selectedSupplier={selectedSupplier}
              onSelectSupplier={setSelectedSupplier}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddItem}
              >
                <PlusCircle size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
            
            <LineItemsTable
              items={items}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
            />
            
            {items.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No items added yet. Click "Add Item" to start building your quote.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tax & Markup</Text>
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Tax Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={taxRate.toString()}
                onChangeText={(text) => setTaxRate(parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="8.5"
              />
            </View>
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Markup Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={markupRate.toString()}
                onChangeText={(text) => setMarkupRate(parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="25"
              />
            </View>
            
            <View style={styles.markupOptionsContainer}>
              <TouchableOpacity 
                style={[styles.markupOption, markupRate === 0 && styles.markupOptionActive]}
                onPress={() => setMarkupRate(0)}
              >
                <Text style={[styles.markupOptionText, markupRate === 0 && styles.markupOptionTextActive]}>0%</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.markupOption, markupRate === 25 && styles.markupOptionActive]}
                onPress={() => setMarkupRate(25)}
              >
                <Text style={[styles.markupOptionText, markupRate === 25 && styles.markupOptionTextActive]}>25%</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.markupOption, markupRate === 50 && styles.markupOptionActive]}
                onPress={() => setMarkupRate(50)}
              >
                <Text style={[styles.markupOptionText, markupRate === 50 && styles.markupOptionTextActive]}>50%</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.markupOption, markupRate === 100 && styles.markupOptionActive]}
                onPress={() => setMarkupRate(100)}
              >
                <Text style={[styles.markupOptionText, markupRate === 100 && styles.markupOptionTextActive]}>100%</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes or terms..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Markup ({markupRate}%)</Text>
              <Text style={styles.totalValue}>${(markedUpSubtotal - subtotal).toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({taxRate}%)</Text>
              <Text style={styles.totalValue}>${taxAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button
              title="Save Draft"
              onPress={handleSaveDraft}
              variant="outline"
              icon={<Save size={18} color={colors.primary} />}
              loading={isLoading}
              style={styles.actionButton}
            />
            <Button
              title="Generate Quote"
              onPress={handleGenerateQuote}
              variant="primary"
              icon={<Send size={18} color={colors.white} />}
              loading={isLoading}
              style={styles.actionButton}
            />
          </View>
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
  backButton: {
    marginRight: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
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
  quoteNameInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: 16,
    color: colors.gray[800],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xs,
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  emptyState: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.gray[700],
  },
  input: {
    width: 100,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    fontSize: 14,
    color: colors.gray[800],
    textAlign: 'right',
  },
  markupOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  markupOption: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    minWidth: 60,
    alignItems: 'center',
  },
  markupOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  markupOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  markupOptionTextActive: {
    color: colors.white,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: 14,
    color: colors.gray[800],
    minHeight: 100,
    textAlignVertical: 'top',
  },
  totalsSection: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});