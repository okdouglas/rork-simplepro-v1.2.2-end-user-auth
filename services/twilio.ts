import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/lib/trpc';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useBusinessStore } from '@/store/businessStore';
import { useCustomerStore } from '@/store/customerStore';

// Mock Twilio API keys - in a real app, these would be stored securely
// and accessed through environment variables or a secure storage
const TWILIO_ACCOUNT_SID = 'AC00000000000000000000000000000000';
const TWILIO_AUTH_TOKEN = '0000000000000000000000000000000000';
const TWILIO_PHONE_NUMBER = '+15555555555';

// Cache for storing document URLs
const documentCache = new Map();

/**
 * Send an SMS message via Twilio
 * @param to Phone number to send to
 * @param message Message content
 * @param mediaUrl Optional URL to media attachment (PDF, image, etc.)
 */
export const sendSMS = async (to: string, message: string, mediaUrl?: string) => {
  try {
    console.log('Sending SMS via Twilio:', { to, message, mediaUrl });
    
    // In a real app, this would call the Twilio API through your backend
    const response = await trpcClient.quotes.workflow.sendSMS.mutate({
      to,
      message,
      mediaUrl
    });
    
    return {
      success: true,
      sid: response.sid,
      status: response.status,
      sentAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

/**
 * Send an email via Twilio SendGrid
 * @param to Email address to send to
 * @param subject Email subject
 * @param htmlContent HTML content of the email
 * @param attachments Optional array of attachments
 */
export const sendEmail = async (
  to: string, 
  subject: string, 
  htmlContent: string, 
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>
) => {
  try {
    console.log('Sending email via Twilio SendGrid:', { to, subject });
    
    // In a real app, this would call the SendGrid API through your backend
    const response = await trpcClient.quotes.workflow.sendEmail.mutate({
      to,
      subject,
      htmlContent,
      attachments
    });
    
    return {
      success: true,
      messageId: response.messageId,
      status: response.status,
      sentAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Generate a PDF document from a quote
 * @param quoteId ID of the quote to generate PDF for
 * @param options Additional options for PDF generation
 */
export const generateQuotePDF = async (quoteId: string, options?: {
  includeSignature?: boolean;
  includeTerms?: boolean;
  includeCompanyLogo?: boolean;
}) => {
  try {
    console.log('Generating PDF for quote:', quoteId);
    
    // Check if we have a cached version
    const cacheKey = `pdf_${quoteId}_${JSON.stringify(options)}`;
    const cachedUrl = documentCache.get(cacheKey);
    
    if (cachedUrl) {
      console.log('Using cached PDF URL');
      return cachedUrl;
    }
    
    // In a real app, this would call your backend to generate a PDF
    // For now, we'll generate a simple PDF using expo-print
    
    // Get business and quote data
    const businessState = useBusinessStore.getState();
    const business = businessState.profile;
    
    // Get quote data from the backend
    const response = await trpcClient.quotes.workflow.generatePDF.query({
      quoteId,
      options
    });
    
    // If backend returns a URL, use it
    if (response && response.documentUrl) {
      documentCache.set(cacheKey, response.documentUrl);
      return response.documentUrl;
    }
    
    // Otherwise, generate PDF locally (fallback)
    const quote = await trpcClient.quotes.getById.query({ id: quoteId });
    const customerState = useCustomerStore.getState();
    const customer = customerState.getCustomerById(quote.customerId);
    
    // Create HTML content for PDF
    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica'; margin: 0; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .company-info { text-align: right; }
            .quote-title { font-size: 24px; font-weight: bold; color: #2563EB; margin-bottom: 10px; }
            .quote-id { font-size: 16px; color: #6B7280; margin-bottom: 20px; }
            .section-title { font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; color: #374151; }
            .customer-info { margin-bottom: 30px; }
            .customer-name { font-weight: bold; margin-bottom: 5px; }
            .customer-detail { margin-bottom: 3px; color: #4B5563; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #F3F4F6; text-align: left; padding: 10px; }
            td { padding: 10px; border-bottom: 1px solid #E5E7EB; }
            .item-name { font-weight: bold; }
            .item-description { font-size: 12px; color: #6B7280; }
            .text-right { text-align: right; }
            .totals { margin-left: auto; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-label { font-weight: normal; color: #4B5563; }
            .total-value { font-weight: bold; }
            .grand-total { border-top: 2px solid #D1D5DB; margin-top: 10px; padding-top: 10px; }
            .grand-total .total-label, .grand-total .total-value { font-weight: bold; font-size: 18px; }
            .notes { margin-top: 40px; padding: 20px; background-color: #F9FAFB; border-radius: 5px; }
            .notes-title { font-weight: bold; margin-bottom: 10px; }
            .signature-section { margin-top: 60px; }
            .signature-line { border-top: 1px solid #000; width: 200px; margin-top: 40px; }
            .signature-name { margin-top: 10px; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #6B7280; }
            .qr-code { text-align: center; margin-top: 20px; }
            .qr-code img { width: 100px; height: 100px; }
            .qr-code-text { font-size: 12px; color: #6B7280; margin-top: 5px; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(0,0,0,0.05); z-index: -1; }
            .quickbooks-info { font-size: 10px; color: #6B7280; margin-top: 5px; text-align: center; }
          </style>
        </head>
        <body>
          ${options?.includeCompanyLogo ? `<div class="watermark">${business.name}</div>` : ''}
          
          <div class="header">
            <div>
              <div class="quote-title">QUOTE</div>
              <div class="quote-id">Quote #${quote.id}</div>
            </div>
            <div class="company-info">
              <div style="font-weight: bold; font-size: 18px;">${business.name}</div>
              <div>${business.address || ''}</div>
              <div>${business.phone || ''}</div>
              <div>${business.email || ''}</div>
            </div>
          </div>
          
          <div class="customer-info">
            <div class="section-title">Customer Information</div>
            <div class="customer-name">${customer?.name || 'Customer'}</div>
            <div class="customer-detail">${customer?.phone || ''}</div>
            <div class="customer-detail">${customer?.email || ''}</div>
            <div class="customer-detail">${customer?.address || ''}</div>
          </div>
          
          <div class="section-title">Quote Details</div>
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Description</th>
                <th style="width: 15%;">Quantity</th>
                <th style="width: 15%;">Unit Price</th>
                <th style="width: 20%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items.map(item => `
                <tr>
                  <td>
                    <div class="item-name">${item.name}</div>
                    ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                  </td>
                  <td>${item.quantity}</td>
                  <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                  <td class="text-right">$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <div class="total-label">Subtotal</div>
              <div class="total-value">$${quote.subtotal.toFixed(2)}</div>
            </div>
            <div class="total-row">
              <div class="total-label">Tax</div>
              <div class="total-value">$${quote.tax.toFixed(2)}</div>
            </div>
            <div class="total-row grand-total">
              <div class="total-label">Total</div>
              <div class="total-value">$${quote.total.toFixed(2)}</div>
            </div>
          </div>
          
          ${quote.notes ? `
            <div class="notes">
              <div class="notes-title">Notes</div>
              <div>${quote.notes}</div>
            </div>
          ` : ''}
          
          ${options?.includeTerms ? `
            <div class="notes">
              <div class="notes-title">Terms & Conditions</div>
              <div>
                <p>1. This quote is valid for 30 days from the date of issue.</p>
                <p>2. A 50% deposit is required to begin work.</p>
                <p>3. Final payment is due upon completion of work.</p>
                <p>4. Any changes to the scope of work may result in additional charges.</p>
                <p>5. All work is guaranteed for 90 days from completion.</p>
              </div>
            </div>
          ` : ''}
          
          ${options?.includeSignature ? `
            <div class="signature-section">
              <div class="section-title">Acceptance</div>
              <p>I, the customer, hereby accept this quote and authorize the work to be performed as described above.</p>
              
              <div class="signature-line"></div>
              <div class="signature-name">Customer Signature</div>
              
              <div class="signature-line"></div>
              <div class="signature-name">Date</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>© ${new Date().getFullYear()} ${business.name} - All Rights Reserved</p>
            <div class="quickbooks-info">This quote is compatible with QuickBooks import</div>
          </div>
          
          <div class="qr-code">
            <div class="qr-code-text">Scan to view digital copy</div>
          </div>
        </body>
      </html>
    `;
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    // Get the PDF file info
    const pdfInfo = await FileSystem.getInfoAsync(uri);
    
    // Rename the file to have a more descriptive name
    const newUri = FileSystem.documentDirectory + `quote_${quoteId}.pdf`;
    await FileSystem.moveAsync({ from: uri, to: newUri });
    
    // Cache the URL
    documentCache.set(cacheKey, newUri);
    
    return newUri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate an invoice PDF from a quote
 * @param quoteId ID of the quote to generate invoice for
 * @param invoiceId ID of the invoice
 * @param dueDate Due date for the invoice
 * @param notes Additional notes for the invoice
 */
export const generateInvoicePDF = async (
  quoteId: string,
  invoiceId: string,
  dueDate: string,
  notes?: string
) => {
  try {
    console.log('Generating invoice PDF for quote:', quoteId);
    
    // Check if we have a cached version
    const cacheKey = `invoice_pdf_${invoiceId}`;
    const cachedUrl = documentCache.get(cacheKey);
    
    if (cachedUrl) {
      console.log('Using cached invoice PDF URL');
      return cachedUrl;
    }
    
    // Get business and quote data
    const businessState = useBusinessStore.getState();
    const business = businessState.profile;
    
    // Get quote data from the backend
    const quote = await trpcClient.quotes.getById.query({ id: quoteId });
    const customerState = useCustomerStore.getState();
    const customer = customerState.getCustomerById(quote.customerId);
    
    // Format due date
    const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create HTML content for PDF
    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica'; margin: 0; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .company-info { text-align: right; }
            .invoice-title { font-size: 24px; font-weight: bold; color: #2563EB; margin-bottom: 10px; }
            .invoice-id { font-size: 16px; color: #6B7280; margin-bottom: 5px; }
            .invoice-date { font-size: 16px; color: #6B7280; margin-bottom: 20px; }
            .section-title { font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; color: #374151; }
            .customer-info { margin-bottom: 30px; }
            .customer-name { font-weight: bold; margin-bottom: 5px; }
            .customer-detail { margin-bottom: 3px; color: #4B5563; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #F3F4F6; text-align: left; padding: 10px; }
            td { padding: 10px; border-bottom: 1px solid #E5E7EB; }
            .item-name { font-weight: bold; }
            .item-description { font-size: 12px; color: #6B7280; }
            .text-right { text-align: right; }
            .totals { margin-left: auto; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-label { font-weight: normal; color: #4B5563; }
            .total-value { font-weight: bold; }
            .grand-total { border-top: 2px solid #D1D5DB; margin-top: 10px; padding-top: 10px; }
            .grand-total .total-label, .grand-total .total-value { font-weight: bold; font-size: 18px; }
            .notes { margin-top: 40px; padding: 20px; background-color: #F9FAFB; border-radius: 5px; }
            .notes-title { font-weight: bold; margin-bottom: 10px; }
            .payment-info { margin-top: 40px; padding: 20px; background-color: #EFF6FF; border-radius: 5px; }
            .payment-title { font-weight: bold; margin-bottom: 10px; color: #1E40AF; }
            .payment-detail { margin-bottom: 5px; }
            .due-date { font-weight: bold; color: #DC2626; margin-top: 10px; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #6B7280; }
            .qr-code { text-align: center; margin-top: 20px; }
            .qr-code img { width: 100px; height: 100px; }
            .qr-code-text { font-size: 12px; color: #6B7280; margin-top: 5px; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(0,0,0,0.05); z-index: -1; }
            .quickbooks-info { font-size: 10px; color: #6B7280; margin-top: 5px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="watermark">INVOICE</div>
          
          <div class="header">
            <div>
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-id">Invoice #${invoiceId}</div>
              <div class="invoice-date">Date: ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</div>
            </div>
            <div class="company-info">
              <div style="font-weight: bold; font-size: 18px;">${business.name}</div>
              <div>${business.address || ''}</div>
              <div>${business.phone || ''}</div>
              <div>${business.email || ''}</div>
            </div>
          </div>
          
          <div class="customer-info">
            <div class="section-title">Bill To</div>
            <div class="customer-name">${customer?.name || 'Customer'}</div>
            <div class="customer-detail">${customer?.phone || ''}</div>
            <div class="customer-detail">${customer?.email || ''}</div>
            <div class="customer-detail">${customer?.address || ''}</div>
          </div>
          
          <div class="section-title">Invoice Details</div>
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Description</th>
                <th style="width: 15%;">Quantity</th>
                <th style="width: 15%;">Unit Price</th>
                <th style="width: 20%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items.map(item => `
                <tr>
                  <td>
                    <div class="item-name">${item.name}</div>
                    ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                  </td>
                  <td>${item.quantity}</td>
                  <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                  <td class="text-right">$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <div class="total-label">Subtotal</div>
              <div class="total-value">$${quote.subtotal.toFixed(2)}</div>
            </div>
            <div class="total-row">
              <div class="total-label">Tax</div>
              <div class="total-value">$${quote.tax.toFixed(2)}</div>
            </div>
            <div class="total-row grand-total">
              <div class="total-label">Total Due</div>
              <div class="total-value">$${quote.total.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="payment-info">
            <div class="payment-title">Payment Information</div>
            <div class="payment-detail">Please make payment by check or bank transfer to:</div>
            <div class="payment-detail"><strong>Bank:</strong> First National Bank</div>
            <div class="payment-detail"><strong>Account Name:</strong> ${business.name}</div>
            <div class="payment-detail"><strong>Account Number:</strong> XXXX-XXXX-XXXX-1234</div>
            <div class="payment-detail"><strong>Routing Number:</strong> XXXXXXXXX</div>
            <div class="due-date">Due Date: ${formattedDueDate}</div>
          </div>
          
          ${notes ? `
            <div class="notes">
              <div class="notes-title">Notes</div>
              <div>${notes}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>© ${new Date().getFullYear()} ${business.name} - All Rights Reserved</p>
            <div class="quickbooks-info">This invoice is compatible with QuickBooks import</div>
          </div>
        </body>
      </html>
    `;
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    // Get the PDF file info
    const pdfInfo = await FileSystem.getInfoAsync(uri);
    
    // Rename the file to have a more descriptive name
    const newUri = FileSystem.documentDirectory + `invoice_${invoiceId}.pdf`;
    await FileSystem.moveAsync({ from: uri, to: newUri });
    
    // Cache the URL
    documentCache.set(cacheKey, newUri);
    
    return newUri;
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
};

/**
 * Export data to QuickBooks format
 * @param data Data to export
 * @param type Type of export (invoice, job, customer)
 */
export const exportToQuickBooks = async (data: any, type: 'invoice' | 'job' | 'customer' | 'estimate' | 'sales_receipt') => {
  try {
    console.log(`Exporting ${type} data to QuickBooks format:`, data);
    
    // Format data for QuickBooks
    let qbData;
    
    switch (type) {
      case 'invoice':
        qbData = {
          DocNumber: data.id,
          CustomerRef: {
            value: data.customerId,
            name: data.customerName
          },
          TxnDate: new Date(data.createdAt).toISOString().split('T')[0],
          DueDate: new Date(data.dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          Line: data.items.map(item => ({
            DetailType: 'SalesItemLineDetail',
            Amount: item.total,
            SalesItemLineDetail: {
              ItemRef: {
                name: item.name
              },
              Qty: item.quantity,
              UnitPrice: item.unitPrice
            },
            Description: item.description || item.name
          })),
          TotalAmt: data.total
        };
        break;
        
      case 'estimate':
        qbData = {
          DocNumber: data.id,
          CustomerRef: {
            value: data.customerId,
            name: data.customerName
          },
          TxnDate: new Date(data.createdAt).toISOString().split('T')[0],
          ExpirationDate: data.expiresAt ? new Date(data.expiresAt).toISOString().split('T')[0] : undefined,
          Line: data.items.map(item => ({
            DetailType: 'SalesItemLineDetail',
            Amount: item.total,
            SalesItemLineDetail: {
              ItemRef: {
                name: item.name
              },
              Qty: item.quantity,
              UnitPrice: item.unitPrice
            },
            Description: item.description || item.name
          })),
          TotalAmt: data.total,
          CustomerMemo: {
            value: data.notes || ''
          }
        };
        break;
        
      case 'sales_receipt':
        qbData = {
          DocNumber: data.id,
          CustomerRef: {
            value: data.customerId,
            name: data.customerName
          },
          TxnDate: new Date(data.createdAt).toISOString().split('T')[0],
          Line: data.items.map(item => ({
            DetailType: 'SalesItemLineDetail',
            Amount: item.total,
            SalesItemLineDetail: {
              ItemRef: {
                name: item.name
              },
              Qty: item.quantity,
              UnitPrice: item.unitPrice
            },
            Description: item.description || item.name
          })),
          TotalAmt: data.total,
          PaymentMethodRef: {
            value: "1", // Default payment method
            name: "Cash"
          }
        };
        break;
        
      case 'job':
        qbData = {
          Name: data.title,
          Notes: data.description,
          ParentRef: {
            value: data.customerId,
            name: data.customerName
          },
          Job: true,
          BillAddr: {
            Line1: data.location?.address,
            City: data.location?.city,
            CountrySubDivisionCode: data.location?.state,
            PostalCode: data.location?.zip
          }
        };
        break;
        
      case 'customer':
        qbData = {
          DisplayName: data.name,
          PrimaryPhone: {
            FreeFormNumber: data.phone
          },
          PrimaryEmailAddr: {
            Address: data.email
          },
          BillAddr: {
            Line1: data.address,
            City: data.city,
            CountrySubDivisionCode: data.state,
            PostalCode: data.zip
          }
        };
        break;
    }
    
    // In a real app, this would call the QuickBooks API through your backend
    // For now, we'll just return the formatted data
    
    // Create a JSON file with the formatted data
    const jsonString = JSON.stringify(qbData, null, 2);
    const fileUri = FileSystem.documentDirectory + `quickbooks_${type}_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString);
    
    // Share the JSON file
    if (Platform.OS !== 'web') {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: `Share QuickBooks ${type.charAt(0).toUpperCase() + type.slice(1)} Data`,
        UTI: 'public.json'
      });
    }
    
    return {
      success: true,
      fileUri,
      data: qbData
    };
  } catch (error) {
    console.error(`Error exporting to QuickBooks ${type} format:`, error);
    throw error;
  }
};

/**
 * Export multiple quotes to QuickBooks
 * @param quotes Array of quotes to export
 * @param type Type of export (estimate, invoice, sales_receipt)
 */
export const exportMultipleQuotesToQuickBooks = async (
  quotes: any[],
  type: 'estimate' | 'invoice' | 'sales_receipt'
) => {
  try {
    console.log(`Exporting ${quotes.length} quotes to QuickBooks as ${type}`);
    
    // Format all quotes for QuickBooks
    const qbData = {
      BatchItemRequest: quotes.map(quote => {
        let operation;
        switch (type) {
          case 'estimate':
            operation = {
              bId: quote.id,
              Estimate: {
                DocNumber: quote.id,
                CustomerRef: {
                  value: quote.customerId,
                  name: quote.customerName
                },
                TxnDate: new Date(quote.createdAt).toISOString().split('T')[0],
                ExpirationDate: quote.expiresAt ? new Date(quote.expiresAt).toISOString().split('T')[0] : undefined,
                Line: quote.items.map(item => ({
                  DetailType: 'SalesItemLineDetail',
                  Amount: item.total,
                  SalesItemLineDetail: {
                    ItemRef: {
                      name: item.name
                    },
                    Qty: item.quantity,
                    UnitPrice: item.unitPrice
                  },
                  Description: item.description || item.name
                })),
                TotalAmt: quote.total,
                CustomerMemo: {
                  value: quote.notes || ''
                }
              }
            };
            break;
            
          case 'invoice':
            operation = {
              bId: quote.id,
              Invoice: {
                DocNumber: quote.id,
                CustomerRef: {
                  value: quote.customerId,
                  name: quote.customerName
                },
                TxnDate: new Date(quote.createdAt).toISOString().split('T')[0],
                DueDate: new Date(quote.dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                Line: quote.items.map(item => ({
                  DetailType: 'SalesItemLineDetail',
                  Amount: item.total,
                  SalesItemLineDetail: {
                    ItemRef: {
                      name: item.name
                    },
                    Qty: item.quantity,
                    UnitPrice: item.unitPrice
                  },
                  Description: item.description || item.name
                })),
                TotalAmt: quote.total
              }
            };
            break;
            
          case 'sales_receipt':
            operation = {
              bId: quote.id,
              SalesReceipt: {
                DocNumber: quote.id,
                CustomerRef: {
                  value: quote.customerId,
                  name: quote.customerName
                },
                TxnDate: new Date(quote.createdAt).toISOString().split('T')[0],
                Line: quote.items.map(item => ({
                  DetailType: 'SalesItemLineDetail',
                  Amount: item.total,
                  SalesItemLineDetail: {
                    ItemRef: {
                      name: item.name
                    },
                    Qty: item.quantity,
                    UnitPrice: item.unitPrice
                  },
                  Description: item.description || item.name
                })),
                TotalAmt: quote.total,
                PaymentMethodRef: {
                  value: "1", // Default payment method
                  name: "Cash"
                }
              }
            };
            break;
        }
        
        return operation;
      })
    };
    
    // Create a JSON file with the formatted data
    const jsonString = JSON.stringify(qbData, null, 2);
    const fileUri = FileSystem.documentDirectory + `quickbooks_batch_${type}_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString);
    
    // Share the JSON file
    if (Platform.OS !== 'web') {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: `Share QuickBooks Batch ${type.charAt(0).toUpperCase() + type.slice(1)} Data`,
        UTI: 'public.json'
      });
    }
    
    return {
      success: true,
      fileUri,
      data: qbData
    };
  } catch (error) {
    console.error(`Error exporting batch to QuickBooks ${type} format:`, error);
    throw error;
  }
};

/**
 * Export quotes to Excel format
 * @param quotes Array of quotes to export
 */
export const exportQuotesToExcel = async (quotes: any[]) => {
  try {
    console.log(`Exporting ${quotes.length} quotes to Excel format`);
    
    // Format current date for filename
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Create CSV content (Excel compatible)
    let csvContent = 'Quote ID,Customer,Date Created,Expiry Date,Status,Amount,Items,Notes\n';
    
    quotes.forEach(quote => {
      const customerName = quote.customerName || 'Unknown';
      const createdDate = new Date(quote.createdAt).toLocaleDateString();
      const expiryDate = quote.expiresAt ? new Date(quote.expiresAt).toLocaleDateString() : 'N/A';
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
    if (Platform.OS !== 'web') {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Share Excel Report',
        UTI: 'public.comma-separated-values-text'
      });
    }
    
    return {
      success: true,
      fileUri
    };
  } catch (error) {
    console.error('Error exporting to Excel format:', error);
    throw error;
  }
};

/**
 * Clear document cache
 */
export const clearDocumentCache = () => {
  documentCache.clear();
};