import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Platform, Alert, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter, Download, ChevronDown, Check, X, Calendar, ArrowUpDown, MoreHorizontal, RefreshCw, FileText, Table } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Header from '@/components/Header';
import QuoteCard from '@/components/QuoteCard';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import { useQuoteStore } from '@/store/quoteStore';
import { Quote, QuoteStatus } from '@/types';
import QuotesToolbar from '@/components/quotes/QuotesToolbar';
import QuotesTable from '@/components/quotes/QuotesTable';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

export default function QuotesScreen() {
  const router = useRouter();
  const { quotes, fetchQuotes, getQuotesByStatus, getCustomerNameById, exportQuotesToQuickBooks } = useQuoteStore();
  
  // State for UI
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [activeFilter, setActiveFilter] = useState<QuoteStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [amountRange, setAmountRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | null>(null);
  const [quickbooksExportLoading, setQuickbooksExportLoading] = useState(false);
  
  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'createdAt', 
    direction: 'desc' 
  });

  // Quick filters
  const quickFilters = [
    { id: 'expiring-soon', label: 'Expiring Soon', icon: <Calendar size={14} color={colors.warning} /> },
    { id: 'pending-approval', label: 'Pending Approval', icon: <RefreshCw size={14} color={colors.info} /> },
    { id: 'this-month', label: 'This Month', icon: <Calendar size={14} color={colors.primary} /> },
  ];
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);

  // Fetch quotes on mount
  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      await fetchQuotes();
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchQuotes();
    } catch (error) {
      console.error('Failed to refresh quotes:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter quotes based on all active filters
  const filteredQuotes = useCallback(() => {
    let result = [...quotes];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter(quote => quote.status === activeFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(quote => {
        const customerName = getCustomerNameById(quote.customerId)?.toLowerCase() || '';
        return (
          quote.id.toLowerCase().includes(query) ||
          customerName.includes(query) ||
          quote.total.toString().includes(query)
        );
      });
    }
    
    // Apply quick filters
    if (activeQuickFilters.includes('expiring-soon')) {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.setDate(now.getDate() + 7));
      result = result.filter(quote => {
        if (!quote.expiresAt) return false;
        const expiryDate = new Date(quote.expiresAt);
        return expiryDate <= sevenDaysFromNow && expiryDate >= new Date();
      });
    }
    
    if (activeQuickFilters.includes('pending-approval')) {
      result = result.filter(quote => quote.status === 'sent');
    }
    
    if (activeQuickFilters.includes('this-month')) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      result = result.filter(quote => {
        const createdDate = new Date(quote.createdAt);
        return createdDate >= startOfMonth && createdDate <= endOfMonth;
      });
    }
    
    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      result = result.filter(quote => {
        const createdDate = new Date(quote.createdAt);
        return createdDate >= startDate && createdDate <= endDate;
      });
    }
    
    // Apply amount range filter
    if (amountRange.min !== null) {
      result = result.filter(quote => quote.total >= (amountRange.min || 0));
    }
    
    if (amountRange.max !== null) {
      result = result.filter(quote => quote.total <= (amountRange.max || Infinity));
    }
    
    return result;
  }, [quotes, activeFilter, searchQuery, activeQuickFilters, dateRange, amountRange, getCustomerNameById]);

  // Sort quotes
  const sortedQuotes = useCallback(() => {
    const filtered = filteredQuotes();
    
    return [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'customerName':
          aValue = getCustomerNameById(a.customerId) || '';
          bValue = getCustomerNameById(b.customerId) || '';
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'expiresAt':
          aValue = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
          bValue = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredQuotes, sortConfig, getCustomerNameById]);

  const handleAddQuote = () => {
    router.push('/quotes/new');
  };

  const handleQuotePress = (quoteId: string) => {
    router.push(`/quotes/${quoteId}`);
  };

  const toggleQuickFilter = (filterId: string) => {
    setActiveQuickFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId) 
        : [...prev, filterId]
    );
  };

  const toggleQuoteSelection = (quoteId: string) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId) 
        : [...prev, quoteId]
    );
  };

  const selectAllQuotes = () => {
    if (selectedQuotes.length === sortedQuotes().length) {
      setSelectedQuotes([]);
    } else {
      setSelectedQuotes(sortedQuotes().map(quote => quote.id));
    }
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
    setActiveQuickFilters([]);
    setDateRange({ start: null, end: null });
    setAmountRange({ min: null, max: null });
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

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

  const handleSort = (columnId: string) => {
    setSortConfig(prevConfig => ({
      key: columnId,
      direction: prevConfig.key === columnId && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Export functions
  const handleExportToPDF = async () => {
    setExportLoading('pdf');
    try {
      const quotesToExport = selectedQuotes.length > 0 
        ? sortedQuotes().filter(quote => selectedQuotes.includes(quote.id))
        : sortedQuotes();
      
      if (quotesToExport.length === 0) {
        Alert.alert('No Data', 'There are no quotes to export.');
        setExportLoading(null);
        return;
      }
      
      // Format current date for filename
      const dateStr = new Date().toISOString().split('T')[0];
      
      // Create HTML content for PDF
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica'; margin: 20px; }
              h1 { color: #2563EB; font-size: 24px; margin-bottom: 10px; }
              h2 { color: #4B5563; font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
              .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
              .company { font-size: 14px; color: #6B7280; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th { background-color: #F3F4F6; text-align: left; padding: 10px; font-weight: bold; color: #4B5563; }
              td { padding: 10px; border-bottom: 1px solid #E5E7EB; }
              .total-row td { font-weight: bold; border-top: 2px solid #D1D5DB; }
              .footer { margin-top: 30px; font-size: 12px; color: #6B7280; text-align: center; }
              .qb-export { background-color: #E8F4FD; padding: 15px; border-radius: 5px; margin-top: 20px; }
              .qb-export h3 { color: #0369A1; margin-top: 0; }
              .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
              .status-draft { background-color: #E5E7EB; color: #4B5563; }
              .status-sent { background-color: #DBEAFE; color: #1E40AF; }
              .status-approved { background-color: #D1FAE5; color: #065F46; }
              .status-rejected { background-color: #FEE2E2; color: #B91C1C; }
              .status-expired { background-color: #FEF3C7; color: #92400E; }
              .status-scheduled { background-color: #E0E7FF; color: #3730A3; }
              .status-converted { background-color: #C7D2FE; color: #4338CA; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>Quotes Report</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
              </div>
              <div class="company">
                <p>Your Company Name<br>123 Business St, City, State</p>
              </div>
            </div>
            
            <h2>Quotes Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Customer</th>
                  <th>Date Created</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${quotesToExport.map(quote => `
                  <tr>
                    <td>${quote.id}</td>
                    <td>${getCustomerNameById(quote.customerId) || 'Unknown'}</td>
                    <td>${formatDate(quote.createdAt)}</td>
                    <td>${formatDate(quote.expiresAt)}</td>
                    <td>
                      <span class="status-badge status-${quote.status}">
                        ${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </td>
                    <td>${formatCurrency(quote.total)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="5">Total</td>
                  <td>${formatCurrency(
                    quotesToExport.reduce((sum, quote) => sum + quote.total, 0)
                  )}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="qb-export">
              <h3>QuickBooks Integration</h3>
              <p>This report is formatted for easy import into QuickBooks. To import:</p>
              <ol>
                <li>Open QuickBooks</li>
                <li>Go to File > Import > PDF</li>
                <li>Select this PDF file</li>
                <li>Follow the on-screen instructions to map fields</li>
                <li>Review and confirm the import</li>
              </ol>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company Name - All Rights Reserved</p>
            </div>
          </body>
        </html>
      `;
      
      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Rename the file to have a more descriptive name
      const newUri = FileSystem.documentDirectory + `quotes_report_${dateStr}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: newUri });
      
      // Share the PDF
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(newUri);
      } else {
        await Sharing.shareAsync(newUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share PDF Report',
          UTI: 'com.adobe.pdf'
        });
      }
      
      Alert.alert('Success', 'PDF exported successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      Alert.alert('Export Failed', 'Failed to export as PDF. Please try again.');
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportToExcel = async () => {
    setExportLoading('excel');
    try {
      const quotesToExport = selectedQuotes.length > 0 
        ? sortedQuotes().filter(quote => selectedQuotes.includes(quote.id))
        : sortedQuotes();
      
      if (quotesToExport.length === 0) {
        Alert.alert('No Data', 'There are no quotes to export.');
        setExportLoading(null);
        return;
      }
      
      // Format current date for filename
      const dateStr = new Date().toISOString().split('T')[0];
      
      // Create CSV content
      let csvContent = 'Quote ID,Customer,Date Created,Expiry Date,Status,Amount,Items,Notes\n';
      
      quotesToExport.forEach(quote => {
        const customerName = getCustomerNameById(quote.customerId) || 'Unknown';
        const createdDate = formatDate(quote.createdAt);
        const expiryDate = formatDate(quote.expiresAt);
        const amount = quote.total.toFixed(2);
        const items = quote.items.map(item => `${item.name} (${item.quantity})`).join('; ');
        const notes = quote.notes ? quote.notes.replace(/,/g, ';').replace(/\n/g, ' ') : '';
        
        csvContent += `${quote.id},${customerName},${createdDate},${expiryDate},${quote.status},${amount},"${items}","${notes}"\n`;
      });
      
      // Add QuickBooks import instructions
      csvContent += '\nQuickBooks Import Instructions:\n';
      csvContent += '1. Open QuickBooks\n';
      csvContent += '2. Go to File > Import > Excel/CSV\n';
      csvContent += '3. Select this CSV file\n';
      csvContent += '4. Map the columns to QuickBooks fields\n';
      csvContent += '5. Review and confirm the import\n';
      
      // Save CSV file
      const fileUri = FileSystem.documentDirectory + `quotes_report_${dateStr}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      // Share the CSV file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Share Excel Report',
        UTI: 'public.comma-separated-values-text'
      });
      
      Alert.alert('Success', 'Excel (CSV) exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('Export Failed', 'Failed to export as Excel. Please try again.');
    } finally {
      setExportLoading(null);
    }
  };

  // QuickBooks export by status
  const handleQuickBooksExport = async (type: 'estimate' | 'invoice' | 'sales_receipt') => {
    setQuickbooksExportLoading(true);
    try {
      // Get quotes to export
      const quotesToExport = selectedQuotes.length > 0 
        ? selectedQuotes
        : sortedQuotes().map(q => q.id);
      
      if (quotesToExport.length === 0) {
        Alert.alert('No Data', 'There are no quotes to export.');
        setQuickbooksExportLoading(false);
        return;
      }
      
      // Export to QuickBooks
      const result = await exportQuotesToQuickBooks(quotesToExport, type);
      
      if (result.success) {
        Alert.alert(
          'Export Successful', 
          `${quotesToExport.length} quote${quotesToExport.length > 1 ? 's' : ''} exported to QuickBooks as ${type}s.`,
          [
            {
              text: 'View Files',
              onPress: async () => {
                // Share the first file if there are multiple
                if (result.fileUris.length > 0) {
                  await Sharing.shareAsync(result.fileUris[0], {
                    dialogTitle: 'QuickBooks Export Files'
                  });
                }
              }
            },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Export Failed', 'Failed to export to QuickBooks. Please try again.');
      }
    } catch (error) {
      console.error('Error with QuickBooks export:', error);
      Alert.alert('Export Failed', 'Failed to export to QuickBooks. Please try again.');
    } finally {
      setQuickbooksExportLoading(false);
      setShowExportModal(false);
    }
  };

  // Render card view
  const renderCardView = () => (
    <FlatList
      data={sortedQuotes()}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <QuoteCard 
          quote={item} 
          isSelected={selectedQuotes.includes(item.id)}
          onSelect={() => toggleQuoteSelection(item.id)}
          onPress={() => handleQuotePress(item.id)}
        />
      )}
      contentContainerStyle={styles.cardListContent}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No quotes found</Text>
          <Button 
            title="Create New Quote" 
            onPress={handleAddQuote} 
            variant="primary"
            size="md"
            style={styles.emptyStateButton}
          />
        </View>
      }
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Quotes" 
        showAdd 
        onAddPress={handleAddQuote} 
        showExport
        onExportPress={handleExport} 
      />
      
      {/* Search and filter bar */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quotes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.gray[500]} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <View style={styles.filterActions}>
          <TouchableOpacity 
            style={[styles.filterButton, showAdvancedFilters && styles.filterButtonActive]}
            onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter size={18} color={showAdvancedFilters ? colors.primary : colors.gray[600]} />
            <Text style={[styles.filterButtonText, showAdvancedFilters && styles.filterButtonTextActive]}>
              Filter
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Quick filters */}
      <View style={styles.quickFiltersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFiltersContent}
        >
          <TouchableOpacity
            style={[
              styles.statusFilter,
              activeFilter === 'all' && styles.activeStatusFilter,
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.statusFilterText,
                activeFilter === 'all' && styles.activeStatusFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusFilter,
              activeFilter === 'draft' && styles.activeStatusFilter,
            ]}
            onPress={() => setActiveFilter('draft')}
          >
            <Text
              style={[
                styles.statusFilterText,
                activeFilter === 'draft' && styles.activeStatusFilterText,
              ]}
            >
              Draft
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusFilter,
              activeFilter === 'sent' && styles.activeStatusFilter,
            ]}
            onPress={() => setActiveFilter('sent')}
          >
            <Text
              style={[
                styles.statusFilterText,
                activeFilter === 'sent' && styles.activeStatusFilterText,
              ]}
            >
              Sent
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusFilter,
              activeFilter === 'approved' && styles.activeStatusFilter,
            ]}
            onPress={() => setActiveFilter('approved')}
          >
            <Text
              style={[
                styles.statusFilterText,
                activeFilter === 'approved' && styles.activeStatusFilterText,
              ]}
            >
              Approved
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusFilter,
              activeFilter === 'rejected' && styles.activeStatusFilter,
            ]}
            onPress={() => setActiveFilter('rejected')}
          >
            <Text
              style={[
                styles.statusFilterText,
                activeFilter === 'rejected' && styles.activeStatusFilterText,
              ]}
            >
              Rejected
            </Text>
          </TouchableOpacity>
          
          <View style={styles.filterDivider} />
          
          {quickFilters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.quickFilter,
                activeQuickFilters.includes(filter.id) && styles.activeQuickFilter,
              ]}
              onPress={() => toggleQuickFilter(filter.id)}
            >
              {filter.icon}
              <Text
                style={[
                  styles.quickFilterText,
                  activeQuickFilters.includes(filter.id) && styles.activeQuickFilterText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
          
          {(activeFilter !== 'all' || searchQuery || activeQuickFilters.length > 0) && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <X size={14} color={colors.gray[600]} />
              <Text style={styles.clearFiltersText}>Clear</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
      
      {/* Advanced filters panel */}
      {showAdvancedFilters && (
        <View style={styles.advancedFiltersPanel}>
          <Text style={styles.advancedFilterTitle}>Advanced Filters</Text>
          
          <View style={styles.advancedFilterRow}>
            <Text style={styles.filterLabel}>Date Range:</Text>
            <View style={styles.dateRangeInputs}>
              <TextInput
                style={styles.dateInput}
                placeholder="Start date"
                value={dateRange.start || ''}
                onChangeText={(text) => setDateRange(prev => ({ ...prev, start: text }))}
              />
              <Text style={styles.dateRangeSeparator}>to</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="End date"
                value={dateRange.end || ''}
                onChangeText={(text) => setDateRange(prev => ({ ...prev, end: text }))}
              />
            </View>
          </View>
          
          <View style={styles.advancedFilterRow}>
            <Text style={styles.filterLabel}>Amount Range:</Text>
            <View style={styles.amountRangeInputs}>
              <TextInput
                style={styles.amountInput}
                placeholder="Min"
                value={amountRange.min?.toString() || ''}
                onChangeText={(text) => setAmountRange(prev => ({ 
                  ...prev, 
                  min: text ? parseFloat(text) : null 
                }))}
                keyboardType="numeric"
              />
              <Text style={styles.amountRangeSeparator}>to</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Max"
                value={amountRange.max?.toString() || ''}
                onChangeText={(text) => setAmountRange(prev => ({ 
                  ...prev, 
                  max: text ? parseFloat(text) : null 
                }))}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.advancedFilterActions}>
            <Button
              title="Apply Filters"
              onPress={() => setShowAdvancedFilters(false)}
              variant="primary"
              size="sm"
            />
            <Button
              title="Reset"
              onPress={() => {
                setDateRange({ start: null, end: null });
                setAmountRange({ min: null, max: null });
              }}
              variant="outline"
              size="sm"
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>
      )}
      
      {/* Quotes Toolbar */}
      <QuotesToolbar
        selectedQuotes={selectedQuotes}
        onClearSelection={() => setSelectedQuotes([])}
        onNavigateToQuote={handleQuotePress}
      />
      
      {/* Quote list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading quotes...</Text>
        </View>
      ) : (
        <View style={styles.quotesListContainer}>
          {renderCardView()}
        </View>
      )}
      
      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export Quotes</Text>
              <TouchableOpacity onPress={() => setShowExportModal(false)}>
                <X size={24} color={colors.gray[700]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              {/* Table view of quotes */}
              <Text style={styles.sectionTitle}>Selected Quotes ({selectedQuotes.length || 'All'})</Text>
              
              <View style={styles.tableContainer}>
                <QuotesTable
                  quotes={sortedQuotes()}
                  selectedQuotes={selectedQuotes}
                  onSelectQuote={toggleQuoteSelection}
                  onSelectAll={selectAllQuotes}
                  onQuotePress={handleQuotePress}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  getCustomerName={getCustomerNameById}
                />
              </View>
              
              <View style={styles.exportOptionsContainer}>
                <Text style={styles.sectionTitle}>Export Options</Text>
                
                <View style={styles.exportButtons}>
                  <Button 
                    title="Export to PDF" 
                    onPress={handleExportToPDF}
                    variant="outline"
                    size="md"
                    icon={<FileText size={18} color={colors.primary} />}
                    loading={exportLoading === 'pdf'}
                    style={styles.exportButton}
                  />
                  
                  <Button 
                    title="Export to Excel" 
                    onPress={handleExportToExcel}
                    variant="outline"
                    size="md"
                    icon={<Table size={18} color={colors.primary} />}
                    loading={exportLoading === 'excel'}
                    style={styles.exportButton}
                  />
                </View>
                
                <View style={styles.quickbooksContainer}>
                  <Text style={styles.quickbooksTitle}>QuickBooks Integration</Text>
                  <Text style={styles.quickbooksText}>
                    Export your quotes to QuickBooks in formats that can be easily imported.
                  </Text>
                  
                  <Button
                    title="Export to QuickBooks"
                    onPress={() => handleQuickBooksExport('estimate')}
                    variant="primary"
                    size="lg"
                    icon={<Download size={20} color={colors.white} />}
                    style={styles.quickbooksButton}
                    loading={quickbooksExportLoading}
                  />
                  
                  <View style={styles.quickbooksOptions}>
                    <TouchableOpacity 
                      style={styles.quickbooksOption}
                      onPress={() => handleQuickBooksExport('estimate')}
                      disabled={quickbooksExportLoading}
                    >
                      <Text style={styles.quickbooksOptionText}>As Estimates</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.quickbooksOption}
                      onPress={() => handleQuickBooksExport('invoice')}
                      disabled={quickbooksExportLoading}
                    >
                      <Text style={styles.quickbooksOptionText}>As Invoices</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.quickbooksOption}
                      onPress={() => handleQuickBooksExport('sales_receipt')}
                      disabled={quickbooksExportLoading}
                    >
                      <Text style={styles.quickbooksOptionText}>As Sales Receipts</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    height: 40,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.gray[800],
  },
  filterActions: {
    flexDirection: 'row',
    marginLeft: theme.spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10', // 10% opacity
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  filterButtonTextActive: {
    color: colors.primary,
  },
  quickFiltersContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  quickFiltersContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  statusFilter: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.gray[100],
  },
  activeStatusFilter: {
    backgroundColor: colors.primary,
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  activeStatusFilterText: {
    color: colors.white,
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.gray[300],
    marginHorizontal: theme.spacing.xs,
  },
  quickFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.gray[100],
    gap: 6,
  },
  activeQuickFilter: {
    backgroundColor: colors.gray[200],
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  activeQuickFilterText: {
    color: colors.gray[900],
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.gray[200],
    gap: 6,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  advancedFiltersPanel: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    padding: theme.spacing.md,
  },
  advancedFilterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  advancedFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  filterLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  dateRangeInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 14,
  },
  dateRangeSeparator: {
    marginHorizontal: theme.spacing.sm,
    color: colors.gray[500],
  },
  amountRangeInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 14,
  },
  amountRangeSeparator: {
    marginHorizontal: theme.spacing.sm,
    color: colors.gray[500],
  },
  advancedFilterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  cardListContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: colors.gray[600],
  },
  emptyState: {
    padding: theme.spacing.xl,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
    marginTop: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyStateButton: {
    marginTop: theme.spacing.md,
  },
  quotesListContainer: {
    flex: 1,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  modalContent: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  tableContainer: {
    height: 300,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  exportOptionsContainer: {
    marginTop: theme.spacing.md,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  exportButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  quickbooksContainer: {
    backgroundColor: colors.blue[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  quickbooksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue[700],
    marginBottom: theme.spacing.xs,
  },
  quickbooksText: {
    fontSize: 14,
    color: colors.blue[800],
    marginBottom: theme.spacing.md,
  },
  quickbooksButton: {
    backgroundColor: colors.quickbooks,
    marginBottom: theme.spacing.sm,
  },
  quickbooksOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  quickbooksOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: colors.blue[100],
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
  },
  quickbooksOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.blue[700],
  },
});