import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { HelpCircle, FileText, Calendar, CreditCard, ExternalLink, MessageSquare, TicketIcon } from 'lucide-react-native';
import Button from '@/components/Button';
import * as WebBrowser from 'expo-web-browser';

// Support article URLs
const SUPPORT_URLS = {
  invoice: 'https://support.simpleproapp.com/articles/how-to-send-an-invoice',
  schedule: 'https://support.simpleproapp.com/articles/setting-up-your-schedule',
  payments: 'https://support.simpleproapp.com/articles/getting-paid-faster',
  zendesk: 'https://simpleproapp.zendesk.com/hc/en-us/requests/new',
  zendeskChat: 'https://simpleproapp.zendesk.com/hc/en-us/chat',
};

export default function HelpScreen() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);

  const openSupportArticle = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening browser:', error);
      // Fallback to regular linking
      Linking.openURL(url);
    }
  };

  const openZendeskChat = async () => {
    setIsLoading(true);
    try {
      await WebBrowser.openBrowserAsync(SUPPORT_URLS.zendeskChat);
    } catch (error) {
      console.error('Error opening Zendesk chat:', error);
      // Fallback to regular linking
      Linking.openURL(SUPPORT_URLS.zendeskChat);
    } finally {
      setIsLoading(false);
    }
  };

  const submitSupportTicket = async () => {
    setIsLoading(true);
    try {
      await WebBrowser.openBrowserAsync(SUPPORT_URLS.zendesk);
    } catch (error) {
      console.error('Error opening Zendesk ticket form:', error);
      // Fallback to regular linking
      Linking.openURL(SUPPORT_URLS.zendesk);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Help & Support' }} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro Section */}
          <View style={[styles.introSection, { backgroundColor: colors.card }]}>
            <View style={styles.iconContainer}>
              <HelpCircle size={32} color={colors.primary} />
            </View>
            <Text style={[styles.introText, { color: colors.text }]}>
              Need help using SimplePro? Check our guides or contact us directly.
            </Text>
          </View>

          {/* Popular Guides Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Guides</Text>
            
            <TouchableOpacity 
              style={[styles.guideCard, { backgroundColor: colors.card }]} 
              onPress={() => openSupportArticle(SUPPORT_URLS.invoice)}
              activeOpacity={0.7}
            >
              <View style={[styles.guideIconContainer, { backgroundColor: colors.primaryLight }]}>
                <FileText size={24} color={colors.tertiary} />
              </View>
              <View style={styles.guideContent}>
                <Text style={[styles.guideTitle, { color: colors.text }]}>How to Send an Invoice</Text>
                <Text style={[styles.guideDescription, { color: colors.gray[600] }]}>
                  Learn how to create and send professional invoices to your customers.
                </Text>
              </View>
              <ExternalLink size={18} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.guideCard, { backgroundColor: colors.card }]} 
              onPress={() => openSupportArticle(SUPPORT_URLS.schedule)}
              activeOpacity={0.7}
            >
              <View style={[styles.guideIconContainer, { backgroundColor: colors.secondaryLight }]}>
                <Calendar size={24} color={colors.tertiary} />
              </View>
              <View style={styles.guideContent}>
                <Text style={[styles.guideTitle, { color: colors.text }]}>Setting Up Your Schedule</Text>
                <Text style={[styles.guideDescription, { color: colors.gray[600] }]}>
                  Optimize your workflow by configuring your work schedule and availability.
                </Text>
              </View>
              <ExternalLink size={18} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.guideCard, { backgroundColor: colors.card }]} 
              onPress={() => openSupportArticle(SUPPORT_URLS.payments)}
              activeOpacity={0.7}
            >
              <View style={[styles.guideIconContainer, { backgroundColor: colors.tertiary }]}>
                <CreditCard size={24} color={colors.white} />
              </View>
              <View style={styles.guideContent}>
                <Text style={[styles.guideTitle, { color: colors.text }]}>Getting Paid Faster</Text>
                <Text style={[styles.guideDescription, { color: colors.gray[600] }]}>
                  Tips and best practices to improve your cash flow and reduce payment delays.
                </Text>
              </View>
              <ExternalLink size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Need More Help Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Need More Help?</Text>
            
            <View style={[styles.zendeskContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.zendeskText, { color: colors.text }]}>
                Our support team is ready to help you with any questions or issues you might have.
              </Text>
              
              <View style={styles.zendeskButtons}>
                <Button
                  title="Chat with Support"
                  onPress={openZendeskChat}
                  variant="primary"
                  icon={<MessageSquare size={18} color={colors.white} />}
                  loading={isLoading}
                  style={styles.zendeskButton}
                />
                
                <Button
                  title="Submit a Ticket"
                  onPress={submitSupportTicket}
                  variant="outline"
                  icon={<TicketIcon size={18} color={colors.primary} />}
                  loading={isLoading}
                  style={styles.zendeskButton}
                />
              </View>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
            
            <View style={[styles.faqCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                How do I update my subscription plan?
              </Text>
              <Text style={[styles.faqAnswer, { color: colors.gray[600] }]}>
                Go to Profile {"->"} Billing & Subscription to view and change your current plan.
              </Text>
            </View>
            
            <View style={[styles.faqCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                Can I export my customer data?
              </Text>
              <Text style={[styles.faqAnswer, { color: colors.gray[600] }]}>
                Yes, go to Settings {"->"} Data Management {"->"} Export Data to download all your customer information.
              </Text>
            </View>
            
            <View style={[styles.faqCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                How do I add team members?
              </Text>
              <Text style={[styles.faqAnswer, { color: colors.gray[600] }]}>
                Team member access is available on Professional and Enterprise plans. Go to Settings {"->"} Team Management to add members.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
  introSection: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  introText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  guideCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  guideIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  zendeskContainer: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  zendeskText: {
    fontSize: 16,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  zendeskButtons: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  zendeskButton: {
    marginBottom: theme.spacing.xs,
  },
  faqCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
});