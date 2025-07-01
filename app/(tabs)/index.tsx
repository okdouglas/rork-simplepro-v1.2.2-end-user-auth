import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Download, Clock, AlertTriangle, CheckCircle, FileText, Table, Image } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { financialMetrics } from '@/mocks/dashboard';
import { useRouter } from 'expo-router';
import { useBusinessStore } from '@/store/businessStore';
import WeeklyCalendarView from '@/components/calendar/WeeklyCalendarView';
import { useJobStore } from '@/store/jobStore';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { captureRef } from 'react-native-view-shot';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useBusinessStore();
  const { jobs, getJobsByStatus } = useJobStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | 'png' | null>(null);
  const scrollViewRef = useRef(null);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const navigateToPipeline = () => {
    router.push('/(tabs)/pipeline');
  };

  const handleExport = async (type: 'pdf' | 'excel' | 'png') => {
    setExportLoading(type);
    try {
      // Get completed jobs for export
      const completedJobs = getJobsByStatus('completed');
      
      if (completedJobs.length === 0) {
        Alert.alert('No Data', 'There are no completed jobs to export.');
        setExportLoading(null);
        return;
      }
      
      // Format current date for filename
      const dateStr = new Date().toISOString().split('T')[0];
      
      if (type === 'pdf') {
        await exportToPDF(completedJobs, dateStr);
      } else if (type === 'excel') {
        await exportToExcel(completedJobs, dateStr);
      } else if (type === 'png') {
        await exportToPNG(dateStr);
      }
    } catch (error) {
      console.error(`Error exporting as ${type}:`, error);
      Alert.alert('Export Failed', `Failed to export as ${type.toUpperCase()}. Please try again.`);
    } finally {
      setExportLoading(null);
    }
  };
  
  const exportToPDF = async (completedJobs, dateStr) => {
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
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Completed Jobs Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="company">
              <p>${profile.name}<br>${profile.address || ''}</p>
            </div>
          </div>
          
          <h2>Completed Jobs Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Customer</th>
                <th>Date Completed</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${completedJobs.map(job => `
                <tr>
                  <td>${job.id}</td>
                  <td>${job.customerName}</td>
                  <td>${job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'N/A'}</td>
                  <td>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(job.totalAmount)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">Total</td>
                <td>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                  completedJobs.reduce((sum, job) => sum + job.totalAmount, 0)
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
            <p>© ${new Date().getFullYear()} ${profile.name} - All Rights Reserved</p>
          </div>
        </body>
      </html>
    `;
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    // Get the PDF file info
    const pdfInfo = await FileSystem.getInfoAsync(uri);
    
    // Rename the file to have a more descriptive name
    const newUri = FileSystem.documentDirectory + `completed_jobs_${dateStr}.pdf`;
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
  };
  
  const exportToExcel = async (completedJobs, dateStr) => {
    // Create CSV content
    let csvContent = 'Job ID,Customer,Date Completed,Amount,Description,Location\n';
    
    completedJobs.forEach(job => {
      const completedDate = job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'N/A';
      const amount = job.totalAmount.toFixed(2);
      const description = job.description.replace(/,/g, ';'); // Replace commas to avoid CSV issues
      const location = job.location ? `${job.location.address}, ${job.location.city}`.replace(/,/g, ';') : 'N/A';
      
      csvContent += `${job.id},${job.customerName},${completedDate},${amount},${description},${location}\n`;
    });
    
    // Add QuickBooks import instructions
    csvContent += '\nQuickBooks Import Instructions:\n';
    csvContent += '1. Open QuickBooks\n';
    csvContent += '2. Go to File > Import > Excel/CSV\n';
    csvContent += '3. Select this CSV file\n';
    csvContent += '4. Map the columns to QuickBooks fields\n';
    csvContent += '5. Review and confirm the import\n';
    
    // Save CSV file
    const fileUri = FileSystem.documentDirectory + `completed_jobs_${dateStr}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent);
    
    // Share the CSV file
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Share Excel Report',
      UTI: 'public.comma-separated-values-text'
    });
    
    Alert.alert('Success', 'Excel (CSV) exported successfully');
  };
  
  const exportToPNG = async (dateStr) => {
    if (!scrollViewRef.current) {
      Alert.alert('Error', 'Cannot capture screenshot');
      return;
    }
    
    try {
      // Capture the entire screen as PNG
      const uri = await captureRef(scrollViewRef, {
        format: 'png',
        quality: 1,
      });
      
      // Share the PNG
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Dashboard Screenshot',
        UTI: 'public.png'
      });
      
      Alert.alert('Success', 'Dashboard screenshot saved as PNG');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      Alert.alert('Error', 'Failed to capture screenshot');
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleInvoicePress = (status: string) => {
    // Navigate to filtered invoices view
    router.push({
      pathname: '/invoices',
      params: { status }
    } as any);
  };

  // Calculate YTD totals with null check for monthlyTrend
  const monthlyTrendData = financialMetrics.monthlyTrend ?? [];
  const ytdRevenue = monthlyTrendData.reduce((sum, month) => sum + month.revenue, 0);
  const ytdExpenses = monthlyTrendData.reduce((sum, month) => sum + month.expenses, 0);
  const ytdProfit = monthlyTrendData.reduce((sum, month) => sum + month.profit, 0);
  const profitMargin = ytdRevenue > 0 ? (ytdProfit / ytdRevenue) * 100 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Dashboard" />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Summary Section */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.kpiLabel}>YTD Revenue</Text>
              <Text style={styles.kpiValue}>{formatCurrency(ytdRevenue)}</Text>
              <View style={styles.kpiTrend}>
                <TrendingUp size={14} color={colors.secondary} />
                <Text style={[styles.kpiTrendValue, { color: colors.secondary }]}>
                  8.3%
                </Text>
              </View>
            </View>
            
            <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.kpiLabel}>YTD Expenses</Text>
              <Text style={styles.kpiValue}>{formatCurrency(ytdExpenses)}</Text>
              <View style={styles.kpiTrend}>
                <TrendingUp size={14} color={colors.warning} />
                <Text style={[styles.kpiTrendValue, { color: colors.warning }]}>
                  3.2%
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.kpiLabel}>YTD Profit</Text>
              <Text style={styles.kpiValue}>{formatCurrency(ytdProfit)}</Text>
              <View style={styles.kpiTrend}>
                <TrendingUp size={14} color={colors.success} />
                <Text style={[styles.kpiTrendValue, { color: colors.success }]}>
                  5.7%
                </Text>
              </View>
            </View>
            
            <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.kpiLabel}>Profit Margin</Text>
              <Text style={styles.kpiValue}>{formatPercent(profitMargin)}</Text>
              <View style={styles.kpiTrend}>
                <TrendingUp size={14} color={colors.success} />
                <Text style={[styles.kpiTrendValue, { color: colors.success }]}>
                  1.2%
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Weekly Calendar Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
              <Text style={styles.viewAllText}>View Calendar</Text>
            </TouchableOpacity>
          </View>
          <WeeklyCalendarView 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </View>
        
        {/* Invoice Aging Section */}
        <View style={[styles.invoiceAgingContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Invoice Aging</Text>
            <TouchableOpacity onPress={() => router.push('/invoices')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.agingContainer}>
              <TouchableOpacity 
                style={[styles.agingCard, styles.currentCard]}
                onPress={() => handleInvoicePress('current')}
              >
                <Text style={styles.agingTitle}>Current</Text>
                <Text style={styles.agingValue}>{formatCurrency(financialMetrics.invoiceAging.current.value)}</Text>
                <View style={styles.agingDetails}>
                  <Text style={styles.agingCount}>{financialMetrics.invoiceAging.current.count} invoices</Text>
                  <CheckCircle size={14} color={colors.success} style={styles.agingIcon} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.agingCard, styles.days30Card]}
                onPress={() => handleInvoicePress('days30')}
              >
                <Text style={styles.agingTitle}>30 Days</Text>
                <Text style={styles.agingValue}>{formatCurrency(financialMetrics.invoiceAging.days30.value)}</Text>
                <View style={styles.agingDetails}>
                  <Text style={styles.agingCount}>{financialMetrics.invoiceAging.days30.count} invoices</Text>
                  <Clock size={14} color={colors.warning} style={styles.agingIcon} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.agingCard, styles.days60Card]}
                onPress={() => handleInvoicePress('days60')}
              >
                <Text style={styles.agingTitle}>60 Days</Text>
                <Text style={styles.agingValue}>{formatCurrency(financialMetrics.invoiceAging.days60.value)}</Text>
                <View style={styles.agingDetails}>
                  <Text style={styles.agingCount}>{financialMetrics.invoiceAging.days60.count} invoices</Text>
                  <AlertTriangle size={14} color={colors.warningDark} style={styles.agingIcon} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.agingCard, styles.days90Card]}
                onPress={() => handleInvoicePress('days90Plus')}
              >
                <Text style={styles.agingTitle}>90+ Days</Text>
                <Text style={styles.agingValue}>{formatCurrency(financialMetrics.invoiceAging.days90Plus.value)}</Text>
                <View style={styles.agingDetails}>
                  <Text style={styles.agingCount}>{financialMetrics.invoiceAging.days90Plus.count} invoices</Text>
                  <AlertTriangle size={14} color={colors.danger} style={styles.agingIcon} />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
        
        {/* Revenue Breakdown */}
        <View style={[styles.breakdownContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.breakdownHeader}>
            <Text style={styles.breakdownTitle}>Revenue Breakdown</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/pipeline')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.breakdownContent}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownItemHeader}>
                <Text style={styles.breakdownItemTitle}>HVAC Services</Text>
                <Text style={styles.breakdownItemValue}>{formatCurrency(18500)}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { backgroundColor: colors.primary, width: '45%' }
                  ]} 
                />
              </View>
              <Text style={styles.breakdownItemPercent}>45%</Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownItemHeader}>
                <Text style={styles.breakdownItemTitle}>Plumbing</Text>
                <Text style={styles.breakdownItemValue}>{formatCurrency(12750)}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { backgroundColor: colors.secondary, width: '31%' }
                  ]} 
                />
              </View>
              <Text style={styles.breakdownItemPercent}>31%</Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownItemHeader}>
                <Text style={styles.breakdownItemTitle}>Electrical</Text>
                <Text style={styles.breakdownItemValue}>{formatCurrency(6200)}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { backgroundColor: colors.warning, width: '15%' }
                  ]} 
                />
              </View>
              <Text style={styles.breakdownItemPercent}>15%</Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownItemHeader}>
                <Text style={styles.breakdownItemTitle}>Other Services</Text>
                <Text style={styles.breakdownItemValue}>{formatCurrency(3700)}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { backgroundColor: colors.gray[400], width: '9%' }
                  ]} 
                />
              </View>
              <Text style={styles.breakdownItemPercent}>9%</Text>
            </View>
          </View>
        </View>
        
        {/* Pipeline Value Card */}
        <TouchableOpacity 
          style={[styles.pipelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={navigateToPipeline}
        >
          <View style={styles.pipelineHeader}>
            <Text style={styles.pipelineTitle}>Pipeline Value</Text>
            <Text style={styles.pipelineValue}>{formatCurrency(28750)}</Text>
          </View>
          
          <View style={styles.pipelineDetails}>
            <View style={styles.pipelineDetailItem}>
              <Text style={styles.pipelineDetailLabel}>Next 30 Days</Text>
              <Text style={styles.pipelineDetailValue}>{formatCurrency(12500)}</Text>
            </View>
            
            <View style={styles.pipelineDetailItem}>
              <Text style={styles.pipelineDetailLabel}>60-90 Days</Text>
              <Text style={styles.pipelineDetailValue}>{formatCurrency(16250)}</Text>
            </View>
          </View>
          
          <View style={styles.pipelineFooter}>
            <Text style={styles.pipelineFooterText}>View Pipeline Details</Text>
          </View>
        </TouchableOpacity>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Button 
            title="Export to PDF" 
            onPress={() => handleExport('pdf')}
            variant="outline"
            size="sm"
            icon={<FileText size={16} color={colors.primary} />}
            loading={exportLoading === 'pdf'}
            style={styles.actionButton}
          />
          
          <Button 
            title="Export to Excel" 
            onPress={() => handleExport('excel')}
            variant="outline"
            size="sm"
            icon={<Table size={16} color={colors.primary} />}
            loading={exportLoading === 'excel'}
            style={styles.actionButton}
          />
          
          <Button 
            title="Save as PNG" 
            onPress={() => handleExport('png')}
            variant="outline"
            size="sm"
            icon={<Image size={16} color={colors.primary} />}
            loading={exportLoading === 'png'}
            style={styles.actionButton}
          />
        </View>
        
        {/* QuickBooks Integration Info */}
        <View style={styles.quickbooksInfo}>
          <Text style={styles.quickbooksTitle}>QuickBooks Integration</Text>
          <Text style={styles.quickbooksText}>
            All exports are formatted for easy import into QuickBooks. PDF and Excel exports include detailed job information and can be directly imported into QuickBooks using the File > Import feature.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  kpiContainer: {
    marginBottom: theme.spacing.md,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  kpiCard: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[600],
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  kpiTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kpiTrendValue: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  sectionContainer: {
    marginBottom: theme.spacing.md,
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
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  // Invoice Aging styles
  invoiceAgingContainer: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  agingContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  agingCard: {
    width: 130,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.xs,
  },
  currentCard: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success + '30',
    borderWidth: 1,
  },
  days30Card: {
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning + '30',
    borderWidth: 1,
  },
  days60Card: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning + '40',
    borderWidth: 1,
  },
  days90Card: {
    backgroundColor: colors.danger + '10',
    borderColor: colors.danger + '30',
    borderWidth: 1,
  },
  agingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 4,
  },
  agingValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  agingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agingCount: {
    fontSize: 12,
    color: colors.gray[600],
  },
  agingIcon: {
    marginLeft: theme.spacing.xs,
  },
  // Revenue Breakdown styles
  breakdownContainer: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  breakdownContent: {
    gap: theme.spacing.md,
  },
  breakdownItem: {
    marginBottom: theme.spacing.sm,
  },
  breakdownItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  breakdownItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownItemPercent: {
    fontSize: 12,
    color: colors.gray[600],
    alignSelf: 'flex-end',
  },
  pipelineCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  pipelineHeader: {
    marginBottom: theme.spacing.sm,
  },
  pipelineTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 4,
  },
  pipelineValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  pipelineDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  pipelineDetailItem: {
    flex: 1,
  },
  pipelineDetailLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 2,
  },
  pipelineDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  pipelineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pipelineFooterText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  quickbooksInfo: {
    backgroundColor: colors.blue[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
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
    lineHeight: 20,
  },
});