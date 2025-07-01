import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Switch } from 'react-native';
import { Mail, Bell, Calendar, RefreshCw, ChevronRight, CheckCircle, ArrowLeft, Users, Clock, Send, X, Search, Filter, Calendar as CalendarIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useCustomerStore } from '@/store/customerStore';
import { Customer } from '@/types';
import { sendMarketingCampaign, scheduleMarketingCampaign } from '@/services/twilio';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  previewText: string;
  conversionRate: number;
  openRate: number;
  emailContent?: string;
  smsContent?: string;
}

interface CampaignType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  active: number;
  templates: CampaignTemplate[];
}

interface CustomerAutomationSectionProps {
  onCreateCampaign: (campaignType: string, templateId?: string) => void;
  stats: {
    active: number;
    completed: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  onBack?: () => void;
}

export default function CustomerAutomationSection({ 
  onCreateCampaign,
  stats,
  onBack,
}: CustomerAutomationSectionProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showCustomerSelection, setShowCustomerSelection] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'sms'>('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showActiveCustomers, setShowActiveCustomers] = useState(false);
  
  // Get customers from store
  const { 
    customers, 
    getCustomersByCampaign, 
    addCustomersToCampaign, 
    removeCustomerFromCampaign,
    getCustomersForAutomaticCampaigns
  } = useCustomerStore();

  // Filter customers based on search query
  const filteredCustomers = searchQuery.trim() === '' 
    ? customers 
    : customers.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        customer.phone.includes(searchQuery)
      );

  // Get customers already on this campaign
  const customersOnCampaign = selectedCampaign 
    ? getCustomersByCampaign(selectedCampaign)
    : [];

  // Get customers for automatic campaigns
  const automaticCampaignCustomers = getCustomersForAutomaticCampaigns();
  
  const campaignTypes: CampaignType[] = [
    {
      id: 'reminder',
      name: 'Service Reminders',
      description: 'Annual maintenance reminders',
      icon: <Bell size={20} color={colors.white} />,
      color: colors.primary,
      active: 3,
      templates: [
        {
          id: 'reminder_1',
          name: 'Annual HVAC Maintenance',
          description: 'Reminder for yearly HVAC system check-up',
          subject: 'Time for your annual HVAC maintenance',
          previewText: 'Keep your system running efficiently with our annual maintenance service',
          conversionRate: 28,
          openRate: 65,
          emailContent: `
            <h2>Time for Your Annual HVAC Maintenance</h2>
            <p>Hello [Customer Name],</p>
            <p>It's that time of year again! Your HVAC system is due for its annual maintenance check-up.</p>
            <p>Regular maintenance helps:</p>
            <ul>
              <li>Extend the life of your system</li>
              <li>Improve energy efficiency</li>
              <li>Prevent costly breakdowns</li>
              <li>Maintain manufacturer warranties</li>
            </ul>
            <p>Would you like to schedule your maintenance appointment now? Our calendar is filling up quickly for the season.</p>
            <p><a href="[BOOKING_LINK]" style="background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Schedule Now</a></p>
            <p>Or give us a call at (555) 123-4567 to book your appointment.</p>
            <p>Thank you for choosing our services!</p>
          `,
          smsContent: "Hi [Customer Name], it's time for your annual HVAC maintenance! Regular check-ups help prevent breakdowns and keep your system running efficiently. Reply YES to schedule your appointment or call us at (555) 123-4567."
        },
        {
          id: 'reminder_2',
          name: 'Seasonal Tune-up',
          description: 'Pre-season system tune-up reminder',
          subject: 'Prepare for [season] with a system tune-up',
          previewText: 'Ensure your comfort all [season] long with our professional tune-up service',
          conversionRate: 32,
          openRate: 70,
          emailContent: `
            <h2>Get Ready for [Season] - Schedule Your Tune-Up</h2>
            <p>Hello [Customer Name],</p>
            <p>[Season] is just around the corner! Now is the perfect time to schedule your HVAC system tune-up to ensure it's ready for the [season] [weather condition].</p>
            <p>Our comprehensive tune-up includes:</p>
            <ul>
              <li>Complete system inspection</li>
              <li>Cleaning of key components</li>
              <li>Performance testing</li>
              <li>Filter replacement (if needed)</li>
              <li>Safety check</li>
            </ul>
            <p>Book now and save 15% on our standard tune-up service!</p>
            <p><a href="[BOOKING_LINK]" style="background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Schedule Your Tune-Up</a></p>
            <p>This offer expires in two weeks, so don't delay!</p>
            <p>Thank you for being a valued customer.</p>
          `,
          smsContent: "Hi [Customer Name], [Season] is coming! Schedule your HVAC tune-up now and save 15%. Our tune-ups help prevent breakdowns during peak [season]. Reply TUNE to book your appointment or call (555) 123-4567."
        },
        {
          id: 'reminder_3',
          name: 'Filter Replacement',
          description: 'Quarterly filter replacement reminder',
          subject: 'Your air filter is due for replacement',
          previewText: 'Maintain indoor air quality with our professional filter replacement service',
          conversionRate: 25,
          openRate: 62,
          emailContent: `
            <h2>Time to Replace Your Air Filter</h2>
            <p>Hello [Customer Name],</p>
            <p>According to our records, it's been about 3 months since your last air filter replacement. Regular filter changes are essential for:</p>
            <ul>
              <li>Maintaining good indoor air quality</li>
              <li>Reducing allergens and pollutants</li>
              <li>Improving system efficiency</li>
              <li>Extending the life of your HVAC equipment</li>
            </ul>
            <p>Would you like us to schedule a quick filter replacement service? We can also provide you with a supply of filters for future changes.</p>
            <p><a href="[BOOKING_LINK]" style="background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Schedule Filter Replacement</a></p>
            <p>If you've already replaced your filter, please disregard this message.</p>
            <p>Thank you for your continued business!</p>
          `,
          smsContent: "Hi [Customer Name], your air filter is due for replacement! Regular changes improve air quality and system efficiency. Reply FILTER to schedule a replacement or call us at (555) 123-4567."
        },
      ],
    },
    {
      id: 'seasonal',
      name: 'Seasonal Campaigns',
      description: 'Pre-season maintenance offers',
      icon: <Calendar size={20} color={colors.white} />,
      color: colors.secondary,
      active: 2,
      templates: [
        {
          id: 'seasonal_1',
          name: 'Summer Prep Special',
          description: 'AC tune-up before summer heat',
          subject: 'Beat the heat with our Summer AC Special',
          previewText: 'Ensure your AC is ready for summer with our special tune-up offer',
          conversionRate: 35,
          openRate: 68,
          emailContent: `
            <h2>Beat the Heat: Summer AC Special</h2>
            <p>Hello [Customer Name],</p>
            <p>Summer is almost here, and the last thing you want is for your AC to fail during the hottest days of the year.</p>
            <p>Our Summer AC Special includes:</p>
            <ul>
              <li>Complete system inspection</li>
              <li>Coil cleaning</li>
              <li>Refrigerant level check</li>
              <li>Electrical component testing</li>
              <li>Thermostat calibration</li>
            </ul>
            <p><strong>Special Offer:</strong> Book your AC tune-up before June 1st and save 20%!</p>
            <p><a href="[BOOKING_LINK]" style="background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Schedule Your AC Tune-Up</a></p>
            <p>Don't wait until it's too late. Appointments are filling up quickly!</p>
            <p>Stay cool this summer!</p>
          `,
          smsContent: "Hi [Customer Name], summer is coming! Book your AC tune-up now and save 20%. Our Summer AC Special ensures your system is ready for the heat. Reply SUMMER to schedule or call (555) 123-4567."
        },
        {
          id: 'seasonal_2',
          name: 'Winter Ready Package',
          description: 'Heating system check before winter',
          subject: 'Is your heating system ready for winter?',
          previewText: 'Stay warm all winter with our heating system maintenance package',
          conversionRate: 38,
          openRate: 72,
          emailContent: `
            <h2>Winter Ready: Heating System Check</h2>
            <p>Hello [Customer Name],</p>
            <p>Winter is approaching, and now is the perfect time to ensure your heating system is ready for the cold months ahead.</p>
            <p>Our Winter Ready Package includes:</p>
            <ul>
              <li>Comprehensive heating system inspection</li>
              <li>Burner cleaning and adjustment</li>
              <li>Heat exchanger inspection</li>
              <li>Safety control testing</li>
              <li>Filter replacement</li>
              <li>Carbon monoxide check</li>
            </ul>
            <p><strong>Limited Time Offer:</strong> Schedule before November 1st and receive a free programmable thermostat upgrade!</p>
            <p><a href="[BOOKING_LINK]" style="background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Get Winter Ready</a></p>
            <p>Stay warm and safe this winter with a properly maintained heating system.</p>
          `,
          smsContent: "Hi [Customer Name], winter is coming! Is your heating system ready? Schedule our Winter Ready Package now and get a FREE programmable thermostat. Reply WINTER to book or call (555) 123-4567."
        },
        {
          id: 'seasonal_3',
          name: 'Spring Cleaning Special',
          description: 'Duct cleaning and system check',
          subject: 'Spring into savings with our cleaning special',
          previewText: 'Improve your indoor air quality with our comprehensive duct cleaning service',
          conversionRate: 30,
          openRate: 65,
          emailContent: `
            <h2>Spring Cleaning for Your HVAC System</h2>
            <p>Hello [Customer Name],</p>
            <p>Spring is the perfect time to clean your HVAC system and ductwork. After a long winter of closed windows and recirculated air, your ducts may be harboring dust, allergens, and other contaminants.</p>
            <p>Our Spring Cleaning Special includes:</p>
            <ul>
              <li>Complete duct system cleaning</li>
              <li>Sanitizing treatment</li>
              <li>System inspection</li>
              <li>Filter replacement</li>
              <li>Outdoor unit cleaning</li>
            </ul>
            <p><strong>Spring Special:</strong> 25% off duct cleaning services through May 31st!</p>
            <p><a href="[BOOKING_LINK]" style="background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Schedule Duct Cleaning</a></p>
            <p>Breathe easier this spring with clean ducts and improved indoor air quality.</p>
          `,
          smsContent: "Hi [Customer Name], spring cleaning time! Get 25% off our duct cleaning service through May 31st. Improve your indoor air quality and system efficiency. Reply SPRING to schedule or call (555) 123-4567."
        },
      ],
    },
    {
      id: 'win_back',
      name: 'Win-Back Campaigns',
      description: 'Re-engage inactive customers',
      icon: <RefreshCw size={20} color={colors.white} />,
      color: colors.warningLight,
      active: 1,
      templates: [
        {
          id: 'win_back_1',
          name: 'We Miss You',
          description: 'Reconnect with customers after 1+ year',
          subject: 'We miss you! Special offer inside',
          previewText: "It's been a while since your last service. Here's a special offer just for you",
          conversionRate: 22,
          openRate: 55,
          emailContent: `
            <h2>We Miss You!</h2>
            <p>Hello [Customer Name],</p>
            <p>It's been a while since we've had the pleasure of serving you, and we wanted to reach out to see how you're doing.</p>
            <p>We value your business and would love the opportunity to work with you again. To show our appreciation, we're offering you a special discount on your next service:</p>
            <p style="font-size: 18px; font-weight: bold; color: #4A6FFF;">25% OFF Your Next Service</p>
            <p>Whether you need maintenance, repairs, or are considering an upgrade to your system, we're here to help with the same quality service you've experienced before.</p>
            <p><a href="[BOOKING_LINK]" style="background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Book Your Service</a></p>
            <p>This exclusive offer expires in 30 days, so don't wait too long!</p>
            <p>We hope to hear from you soon.</p>
          `,
          smsContent: "Hi [Customer Name], we miss you! It's been a while since your last service. We'd love to welcome you back with 25% OFF your next appointment. Reply BACK to schedule or call (555) 123-4567. Offer expires in 30 days."
        },
        {
          id: 'win_back_2',
          name: 'Loyalty Discount',
          description: 'Special discount for returning customers',
          subject: 'A special thank you for your past business',
          previewText: 'We value your loyalty. Enjoy this exclusive discount on your next service',
          conversionRate: 26,
          openRate: 60,
          emailContent: `
            <h2>A Special Thank You for Your Loyalty</h2>
            <p>Hello [Customer Name],</p>
            <p>We wanted to reach out and thank you for choosing our services in the past. Loyal customers like you are the foundation of our business.</p>
            <p>As a token of our appreciation, we'd like to offer you an exclusive loyalty discount:</p>
            <p style="font-size: 18px; font-weight: bold; color: #4A6FFF;">$50 OFF Any Service Over $200</p>
            <p>This offer is available for any of our services, including:</p>
            <ul>
              <li>System maintenance</li>
              <li>Repairs</li>
              <li>Upgrades</li>
              <li>New installations</li>
            </ul>
            <p><a href="[BOOKING_LINK]" style="background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Claim Your Discount</a></p>
            <p>We look forward to serving you again soon!</p>
          `,
          smsContent: "Hi [Customer Name], as a thank you for your past business, enjoy $50 OFF any service over $200! This exclusive loyalty discount is our way of showing appreciation. Reply LOYAL to redeem or call (555) 123-4567."
        },
        {
          id: 'win_back_3',
          name: 'Service Check-in',
          description: 'Follow-up on system performance',
          subject: 'How is your system performing?',
          previewText: 'We want to ensure your continued satisfaction with our previous service',
          conversionRate: 20,
          openRate: 58,
          emailContent: `
            <h2>How Is Your System Performing?</h2>
            <p>Hello [Customer Name],</p>
            <p>We hope this message finds you well. It's been some time since we performed service on your system, and we wanted to check in to see how everything is working.</p>
            <p>Your satisfaction is our top priority, and we want to ensure that your system continues to operate efficiently and reliably.</p>
            <p>If you've noticed any issues or have any concerns about your system's performance, we'd be happy to schedule a follow-up visit.</p>
            <p>As a valued customer, we're offering a complimentary system check-up to ensure everything is running as it should.</p>
            <p><a href="[BOOKING_LINK]" style="background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Schedule Free Check-Up</a></p>
            <p>Or simply reply to this email with any questions or concerns you might have.</p>
            <p>Thank you for your continued trust in our services.</p>
          `,
          smsContent: "Hi [Customer Name], how is your system performing since our last service? We'd like to offer you a FREE check-up to ensure everything is working properly. Reply CHECK to schedule or call (555) 123-4567."
        },
      ],
    },
    {
      id: 'new_customer',
      name: 'New Customer Welcome',
      description: 'Welcome and thank new customers',
      icon: <Users size={20} color={colors.white} />,
      color: colors.blue[500],
      active: 2,
      templates: [
        {
          id: 'new_customer_1',
          name: 'Welcome & Thank You',
          description: 'Thank customers for choosing your service',
          subject: 'Thank you for choosing our service',
          previewText: 'We appreciate your business and look forward to serving you',
          conversionRate: 40,
          openRate: 75,
          emailContent: `
            <h2>Welcome and Thank You!</h2>
            <p>Hello [Customer Name],</p>
            <p>We wanted to take a moment to thank you for choosing our services. We're thrilled to welcome you as a new customer!</p>
            <p>At [Company Name], we pride ourselves on providing exceptional service and building lasting relationships with our customers. Your satisfaction is our top priority.</p>
            <p>Here's what you can expect from us:</p>
            <ul>
              <li>Prompt, professional service</li>
              <li>Transparent pricing</li>
              <li>Expert technicians</li>
              <li>24/7 emergency support</li>
              <li>Satisfaction guarantee</li>
            </ul>
            <p>If you have any questions or need assistance, please don't hesitate to contact us at (555) 123-4567 or reply to this email.</p>
            <p>We look forward to serving all your future needs!</p>
            <p>Warmest regards,<br>[Your Name]<br>Owner/Manager</p>
          `,
          smsContent: "Hi [Customer Name], thank you for choosing our services! We're thrilled to welcome you as a new customer. If you need anything, please call us at (555) 123-4567. We look forward to serving you!"
        },
        {
          id: 'new_customer_2',
          name: 'New Customer Discount',
          description: 'Special offer for first-time customers',
          subject: 'A special offer for our new customers',
          previewText: 'Enjoy this exclusive discount on your next service as a new customer',
          conversionRate: 45,
          openRate: 80,
          emailContent: `
            <h2>Welcome Aboard with a Special Offer!</h2>
            <p>Hello [Customer Name],</p>
            <p>Thank you for choosing us for your recent service! We're delighted to have you as a new customer and want to show our appreciation.</p>
            <p>As a special welcome gift, we're offering you:</p>
            <p style="font-size: 18px; font-weight: bold; color: #4A6FFF;">15% OFF Your Next Service</p>
            <p>This offer is valid for 3 months and can be applied to any of our services.</p>
            <p>Additionally, we'd like to invite you to join our maintenance plan, which includes:</p>
            <ul>
              <li>Priority scheduling</li>
              <li>Discounted service rates</li>
              <li>Annual maintenance visits</li>
              <li>Extended warranty coverage</li>
            </ul>
            <p><a href="[BOOKING_LINK]" style="background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Book Your Next Service</a></p>
            <p>Thank you again for your business. We look forward to building a long-lasting relationship!</p>
          `,
          smsContent: "Hi [Customer Name], welcome to the family! Enjoy 15% OFF your next service as our way of saying thanks. This offer is valid for 3 months. Reply WELCOME to learn more or call (555) 123-4567."
        },
        {
          id: 'new_customer_3',
          name: 'Service Introduction',
          description: 'Introduce all available services',
          subject: 'Discover all our services',
          previewText: 'Learn about the full range of services we offer to keep your home comfortable',
          conversionRate: 35,
          openRate: 70,
          emailContent: `
            <h2>Discover Our Complete Range of Services</h2>
            <p>Hello [Customer Name],</p>
            <p>Thank you for recently choosing our services! We wanted to take this opportunity to introduce you to the full range of solutions we offer to keep your home comfortable and efficient year-round.</p>
            <p><strong>Our Services Include:</strong></p>
            <ul>
              <li><strong>HVAC Services:</strong> Installation, maintenance, and repair of heating and cooling systems</li>
              <li><strong>Plumbing Services:</strong> Repairs, installations, drain cleaning, and water heater services</li>
              <li><strong>Electrical Services:</strong> Panel upgrades, wiring, lighting, and safety inspections</li>
              <li><strong>Indoor Air Quality:</strong> Air purification, humidifiers, dehumidifiers, and ventilation</li>
              <li><strong>Maintenance Plans:</strong> Regular service to prevent costly breakdowns</li>
            </ul>
            <p>We're your one-stop solution for home comfort and maintenance needs!</p>
            <p><a href="[WEBSITE_LINK]" style="background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Explore Our Services</a></p>
            <p>If you have any questions or would like to schedule a service, please don't hesitate to contact us.</p>
            <p>We appreciate your business and look forward to serving you!</p>
          `,
          smsContent: "Hi [Customer Name], did you know we offer a complete range of home services? From HVAC to plumbing, electrical, and air quality solutions - we've got you covered! Reply INFO to learn more or call (555) 123-4567."
        },
      ],
    },
  ];

  const handleCampaignSelect = (campaignId: string) => {
    if (selectedCampaign === campaignId) {
      setSelectedCampaign(null);
      setSelectedTemplate(null);
      setShowCustomerSelection(false);
    } else {
      setSelectedCampaign(campaignId);
      setSelectedTemplate(null);
      setShowCustomerSelection(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowCustomerSelection(false);
  };

  const handleCreateCampaign = () => {
    if (selectedTemplate) {
      setShowCustomerSelection(true);
      // Pre-select customers based on campaign type
      if (selectedCampaign === 'reminder') {
        // For reminders, pre-select customers who had service in the last 3 months
        setSelectedCustomers(automaticCampaignCustomers.completedServiceCustomers.map(c => c.id));
      } else if (selectedCampaign === 'new_customer') {
        // For new customer campaigns, pre-select new customers
        setSelectedCustomers(automaticCampaignCustomers.newCustomers.map(c => c.id));
      } else if (selectedCampaign === 'win_back') {
        // For win-back campaigns, pre-select inactive customers
        setSelectedCustomers(automaticCampaignCustomers.inactiveCustomers.map(c => c.id));
      }
    } else if (selectedCampaign) {
      onCreateCampaign(selectedCampaign);
      // Reset selections after creating
      setSelectedCampaign(null);
      setSelectedTemplate(null);
    }
  };

  const handleBack = () => {
    if (showCustomerSelection) {
      setShowCustomerSelection(false);
    } else if (selectedTemplate) {
      setSelectedTemplate(null);
    } else if (selectedCampaign) {
      setSelectedCampaign(null);
    } else if (onBack) {
      onBack();
    }
  };

  const handleUseTemplate = () => {
    if (selectedCampaign && selectedTemplate) {
      setShowCustomerSelection(true);
    }
  };

  const toggleCustomerSelection = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  const handleSendCampaign = async () => {
    if (!selectedCampaign || !selectedTemplate || selectedCustomers.length === 0) {
      Alert.alert('Error', 'Please select a campaign, template, and at least one customer.');
      return;
    }

    setIsSending(true);

    try {
      const selectedCampaignData = campaignTypes.find(c => c.id === selectedCampaign);
      const selectedTemplateData = selectedCampaignData?.templates.find(t => t.id === selectedTemplate);
      
      if (!selectedCampaignData || !selectedTemplateData) {
        throw new Error('Campaign or template not found');
      }

      // Get customer data for selected customers
      const customersToSend = customers.filter(c => selectedCustomers.includes(c.id))
        .map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone
        }));

      if (isScheduled) {
        // Schedule the campaign
        await scheduleMarketingCampaign(
          selectedCampaign,
          selectedTemplate,
          customersToSend,
          deliveryMethod,
          scheduledDate.toISOString()
        );

        // Add customers to campaign in store
        await addCustomersToCampaign(selectedCustomers, selectedCampaign);

        Alert.alert(
          'Campaign Scheduled',
          `Your ${selectedCampaignData.name} campaign has been scheduled for ${scheduledDate.toLocaleDateString()} and will be sent to ${selectedCustomers.length} customer(s).`
        );
      } else {
        // Send the campaign immediately
        await sendMarketingCampaign(
          selectedCampaign,
          selectedTemplate,
          customersToSend,
          deliveryMethod
        );

        // Add customers to campaign in store
        await addCustomersToCampaign(selectedCustomers, selectedCampaign);

        Alert.alert(
          'Campaign Sent',
          `Your ${selectedCampaignData.name} campaign has been sent to ${selectedCustomers.length} customer(s).`
        );
      }

      // Reset selections after sending
      setSelectedCampaign(null);
      setSelectedTemplate(null);
      setSelectedCustomers([]);
      setShowCustomerSelection(false);
      setIsScheduled(false);
    } catch (error) {
      console.error('Error sending campaign:', error);
      Alert.alert('Error', 'Failed to send campaign. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  };

  const selectedCampaignData = campaignTypes.find(c => c.id === selectedCampaign);
  const selectedTemplateData = selectedCampaignData?.templates.find(t => t.id === selectedTemplate);

  // Toggle between showing all customers or only active customers
  const displayedCustomers = showActiveCustomers 
    ? customersOnCampaign 
    : filteredCustomers;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketing Automation</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.openRate}%</Text>
            <Text style={styles.statLabel}>Open Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.conversionRate}%</Text>
            <Text style={styles.statLabel}>Conversion</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
      >
        <ArrowLeft size={18} color={colors.primary} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      
      {!selectedCampaign ? (
        // Campaign Type Selection
        <View style={styles.campaignsContainer}>
          {campaignTypes.map((campaign) => (
            <TouchableOpacity
              key={campaign.id}
              style={styles.campaignCard}
              onPress={() => handleCampaignSelect(campaign.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: campaign.color }]}>
                {campaign.icon}
              </View>
              <View style={styles.campaignInfo}>
                <Text style={styles.campaignName}>{campaign.name}</Text>
                <Text style={styles.campaignDescription}>{campaign.description}</Text>
              </View>
              {campaign.active > 0 && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>{campaign.active} active</Text>
                </View>
              )}
              <ChevronRight size={18} color={colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>
      ) : !selectedTemplate ? (
        // Template Selection
        <View style={styles.templatesContainer}>
          <View style={styles.breadcrumb}>
            <TouchableOpacity 
              onPress={() => setSelectedCampaign(null)}
              style={styles.breadcrumbItem}
            >
              <Text style={styles.breadcrumbText}>Campaigns</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>›</Text>
            <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>
              {selectedCampaignData?.name}
            </Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateScrollContent}
          >
            {selectedCampaignData?.templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate === template.id && styles.templateCardSelected
                ]}
                onPress={() => handleTemplateSelect(template.id)}
                activeOpacity={0.7}
              >
                {/* Template preview mockup */}
                <View style={styles.templatePreview}>
                  <View style={styles.templateHeader}>
                    <View style={styles.templateHeaderLine} />
                    <View style={styles.templateHeaderLine} />
                  </View>
                  <View style={styles.templateBody}>
                    <View style={styles.templateBodyLine} />
                    <View style={styles.templateBodyLine} />
                    <View style={[styles.templateBodyLine, { width: '70%' }]} />
                  </View>
                  <View style={styles.templateFooter}>
                    <View style={styles.templateButton} />
                  </View>
                </View>
                
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
                
                <View style={styles.templateStats}>
                  <View style={styles.templateStatItem}>
                    <Text style={styles.templateStatValue}>{template.openRate}%</Text>
                    <Text style={styles.templateStatLabel}>Open</Text>
                  </View>
                  <View style={styles.templateStatItem}>
                    <Text style={styles.templateStatValue}>{template.conversionRate}%</Text>
                    <Text style={styles.templateStatLabel}>Conv.</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateCampaign}
            activeOpacity={0.7}
          >
            <Text style={styles.createButtonText}>Create Campaign</Text>
          </TouchableOpacity>
        </View>
      ) : showCustomerSelection ? (
        // Customer Selection
        <View style={styles.customerSelectionContainer}>
          <View style={styles.breadcrumb}>
            <TouchableOpacity 
              onPress={() => setSelectedCampaign(null)}
              style={styles.breadcrumbItem}
            >
              <Text style={styles.breadcrumbText}>Campaigns</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>›</Text>
            <TouchableOpacity 
              onPress={() => setSelectedTemplate(null)}
              style={styles.breadcrumbItem}
            >
              <Text style={styles.breadcrumbText}>{selectedCampaignData?.name}</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>›</Text>
            <TouchableOpacity 
              onPress={() => setShowCustomerSelection(false)}
              style={styles.breadcrumbItem}
            >
              <Text style={styles.breadcrumbText}>{selectedTemplateData?.name}</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>›</Text>
            <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>
              Select Customers
            </Text>
          </View>
          
          <View style={styles.customerSelectionHeader}>
            <Text style={styles.sectionTitle}>Choose Customers</Text>
            
            <View style={styles.customerToggle}>
              <Text style={styles.toggleLabel}>Show active customers</Text>
              <Switch
                value={showActiveCustomers}
                onValueChange={setShowActiveCustomers}
                trackColor={{ false: colors.gray[300], true: colors.primary + '70' }}
                thumbColor={showActiveCustomers ? colors.primary : colors.gray[100]}
              />
            </View>
          </View>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={18} color={colors.gray[400]} style={styles.searchIcon} />
              <TouchableOpacity 
                style={styles.searchClearButton}
                onPress={() => setSearchQuery('')}
                disabled={searchQuery.length === 0}
              >
                {searchQuery.length > 0 && (
                  <X size={16} color={colors.gray[400]} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.customerList}>
            {displayedCustomers.map(customer => (
              <TouchableOpacity
                key={customer.id}
                style={[
                  styles.customerItem,
                  selectedCustomers.includes(customer.id) && styles.customerItemSelected
                ]}
                onPress={() => toggleCustomerSelection(customer.id)}
              >
                <View style={styles.customerInitials}>
                  <Text style={styles.initialsText}>
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerEmail}>
                    {deliveryMethod === 'email' 
                      ? customer.email || 'No email available'
                      : customer.phone || 'No phone available'
                    }
                  </Text>
                </View>
                {selectedCustomers.includes(customer.id) && (
                  <CheckCircle size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            
            {displayedCustomers.length === 0 && (
              <View style={styles.emptyCustomerList}>
                <Text style={styles.emptyCustomerText}>
                  {showActiveCustomers 
                    ? 'No customers are currently on this campaign.' 
                    : 'No customers match your search criteria.'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.deliveryOptions}>
            <Text style={styles.sectionTitle}>Delivery Method</Text>
            <View style={styles.deliveryButtons}>
              <TouchableOpacity 
                style={[
                  styles.deliveryButton, 
                  deliveryMethod === 'email' && styles.deliveryButtonSelected
                ]}
                onPress={() => setDeliveryMethod('email')}
              >
                <Mail size={18} color={deliveryMethod === 'email' ? colors.white : colors.gray[600]} />
                <Text style={[
                  styles.deliveryButtonText, 
                  { color: deliveryMethod === 'email' ? colors.white : colors.gray[600] }
                ]}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.deliveryButton,
                  deliveryMethod === 'sms' && styles.deliveryButtonSelected
                ]}
                onPress={() => setDeliveryMethod('sms')}
              >
                <Bell size={18} color={deliveryMethod === 'sms' ? colors.white : colors.gray[600]} />
                <Text style={[
                  styles.deliveryButtonText, 
                  { color: deliveryMethod === 'sms' ? colors.white : colors.gray[600] }
                ]}>SMS</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.scheduleOption}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.sectionTitle}>Delivery Schedule</Text>
              <Switch
                value={isScheduled}
                onValueChange={setIsScheduled}
                trackColor={{ false: colors.gray[300], true: colors.primary + '70' }}
                thumbColor={isScheduled ? colors.primary : colors.gray[100]}
              />
            </View>
            
            {isScheduled && (
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <CalendarIcon size={18} color={colors.primary} />
                <Text style={styles.datePickerText}>
                  {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            )}
            
            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
          
          <View style={styles.messagePreview}>
            <Text style={styles.sectionTitle}>Message Preview</Text>
            <View style={styles.previewCard}>
              {deliveryMethod === 'email' ? (
                <>
                  <Text style={styles.previewSubject}>Subject: {selectedTemplateData?.subject}</Text>
                  <Text style={styles.previewText}>{selectedTemplateData?.previewText}</Text>
                </>
              ) : (
                <Text style={styles.previewText}>
                  {selectedTemplateData?.smsContent?.substring(0, 100)}
                  {(selectedTemplateData?.smsContent?.length || 0) > 100 ? '...' : ''}
                </Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (selectedCustomers.length === 0 || isSending) && styles.sendButtonDisabled
            ]}
            onPress={handleSendCampaign}
            disabled={selectedCustomers.length === 0 || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.sendButtonText}>
                {isScheduled ? 'Schedule' : 'Send'} to {selectedCustomers.length} Customer{selectedCustomers.length !== 1 ? 's' : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        // Template Details
        <View style={styles.templateDetailContainer}>
          <View style={styles.breadcrumb}>
            <TouchableOpacity 
              onPress={() => setSelectedCampaign(null)}
              style={styles.breadcrumbItem}
            >
              <Text style={styles.breadcrumbText}>Campaigns</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>›</Text>
            <TouchableOpacity 
              onPress={() => setSelectedTemplate(null)}
              style={styles.breadcrumbItem}
            >
              <Text style={styles.breadcrumbText}>{selectedCampaignData?.name}</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>›</Text>
            <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>
              {selectedTemplateData?.name}
            </Text>
          </View>
          
          <View style={styles.templateDetailCard}>
            <View style={styles.templateDetailHeader}>
              <Text style={styles.templateDetailSubject}>{selectedTemplateData?.subject}</Text>
              <Text style={styles.templateDetailPreview}>{selectedTemplateData?.previewText}</Text>
            </View>
            
            <View style={styles.templateDetailPreviewContainer}>
              {/* Email template mockup */}
              <View style={styles.emailMockup}>
                <View style={styles.emailHeader}>
                  <View style={styles.emailLogo} />
                  <View style={styles.emailHeaderText}>
                    <View style={styles.emailHeaderLine} />
                    <View style={[styles.emailHeaderLine, { width: '60%' }]} />
                  </View>
                </View>
                <View style={styles.emailBody}>
                  <View style={styles.emailBodyLine} />
                  <View style={styles.emailBodyLine} />
                  <View style={[styles.emailBodyLine, { width: '80%' }]} />
                  <View style={styles.emailBodyLine} />
                  <View style={[styles.emailBodyLine, { width: '70%' }]} />
                  <View style={styles.emailCta}>
                    <View style={styles.emailCtaButton} />
                  </View>
                  <View style={[styles.emailBodyLine, { width: '60%' }]} />
                  <View style={[styles.emailBodyLine, { width: '50%' }]} />
                </View>
                <View style={styles.emailFooter}>
                  <View style={[styles.emailFooterLine, { width: '90%' }]} />
                  <View style={[styles.emailFooterLine, { width: '70%' }]} />
                </View>
              </View>
            </View>
            
            <View style={styles.templateDetailStats}>
              <View style={styles.templateDetailStatItem}>
                <Text style={styles.templateDetailStatValue}>{selectedTemplateData?.openRate}%</Text>
                <Text style={styles.templateDetailStatLabel}>Open Rate</Text>
              </View>
              <View style={styles.templateDetailStatItem}>
                <Text style={styles.templateDetailStatValue}>{selectedTemplateData?.conversionRate}%</Text>
                <Text style={styles.templateDetailStatLabel}>Conversion Rate</Text>
              </View>
            </View>
            
            <View style={styles.templateContentPreview}>
              <Text style={styles.templateContentTitle}>Content Preview</Text>
              <View style={styles.contentTabs}>
                <TouchableOpacity 
                  style={[
                    styles.contentTab,
                    deliveryMethod === 'email' && styles.contentTabActive
                  ]}
                  onPress={() => setDeliveryMethod('email')}
                >
                  <Text style={[
                    styles.contentTabText,
                    deliveryMethod === 'email' && styles.contentTabTextActive
                  ]}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.contentTab,
                    deliveryMethod === 'sms' && styles.contentTabActive
                  ]}
                  onPress={() => setDeliveryMethod('sms')}
                >
                  <Text style={[
                    styles.contentTabText,
                    deliveryMethod === 'sms' && styles.contentTabTextActive
                  ]}>SMS</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.contentPreviewScroll}>
                <Text style={styles.contentPreviewText}>
                  {deliveryMethod === 'email' 
                    ? selectedTemplateData?.emailContent?.replace(/<[^>]*>/g, '') // Strip HTML tags for preview
                    : selectedTemplateData?.smsContent
                  }
                </Text>
              </ScrollView>
            </View>
            
            <TouchableOpacity
              style={styles.useTemplateButton}
              onPress={handleUseTemplate}
              activeOpacity={0.7}
            >
              <CheckCircle size={18} color={colors.white} />
              <Text style={styles.useTemplateButtonText}>Use This Template</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  campaignsContainer: {
    padding: theme.spacing.md,
  },
  campaignCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
  },
  campaignDescription: {
    fontSize: 12,
    color: colors.gray[500],
  },
  activeBadge: {
    backgroundColor: colors.primary + '15', // 15% opacity
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    marginRight: theme.spacing.sm,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  // Template selection styles
  templatesContainer: {
    padding: theme.spacing.md,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  breadcrumbActive: {
    color: colors.gray[800],
    fontWeight: '600',
  },
  breadcrumbSeparator: {
    fontSize: 12,
    color: colors.gray[400],
    marginHorizontal: 4,
  },
  templateScrollContent: {
    paddingBottom: theme.spacing.sm,
  },
  templateCard: {
    width: 160,
    backgroundColor: colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  templateCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05', // 5% opacity
  },
  templatePreview: {
    height: 100,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  templateHeader: {
    marginBottom: theme.spacing.xs,
  },
  templateHeaderLine: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    marginBottom: 4,
  },
  templateBody: {
    flex: 1,
    justifyContent: 'center',
  },
  templateBodyLine: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    marginBottom: 4,
  },
  templateFooter: {
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  templateButton: {
    width: 60,
    height: 12,
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: theme.spacing.sm,
  },
  templateStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  templateStatItem: {
    alignItems: 'center',
  },
  templateStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[800],
  },
  templateStatLabel: {
    fontSize: 10,
    color: colors.gray[500],
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  createButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  // Template detail styles
  templateDetailContainer: {
    padding: theme.spacing.md,
  },
  templateDetailCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  templateDetailHeader: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.gray[50],
  },
  templateDetailSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 4,
  },
  templateDetailPreview: {
    fontSize: 12,
    color: colors.gray[500],
  },
  templateDetailPreviewContainer: {
    padding: theme.spacing.md,
  },
  emailMockup: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  emailHeader: {
    backgroundColor: colors.gray[50],
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  emailLogo: {
    width: 30,
    height: 30,
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  emailHeaderText: {
    flex: 1,
  },
  emailHeaderLine: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    marginBottom: 4,
    width: '100%',
  },
  emailBody: {
    padding: theme.spacing.md,
  },
  emailBodyLine: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    marginBottom: 8,
    width: '100%',
  },
  emailCta: {
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  emailCtaButton: {
    width: 120,
    height: 20,
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  emailFooter: {
    padding: theme.spacing.sm,
    backgroundColor: colors.gray[50],
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  emailFooterLine: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    marginBottom: 4,
  },
  templateDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.gray[50],
  },
  templateDetailStatItem: {
    alignItems: 'center',
  },
  templateDetailStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[800],
  },
  templateDetailStatLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  templateContentPreview: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  templateContentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  contentTabs: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  contentTab: {
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: colors.gray[100],
  },
  contentTabActive: {
    backgroundColor: colors.primary,
  },
  contentTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[700],
  },
  contentTabTextActive: {
    color: colors.white,
  },
  contentPreviewScroll: {
    maxHeight: 120,
    backgroundColor: colors.gray[50],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  contentPreviewText: {
    fontSize: 12,
    color: colors.gray[700],
    lineHeight: 18,
  },
  useTemplateButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.primary + '30', // 30% opacity
  },
  useTemplateButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: theme.spacing.xs,
  },
  // Customer selection styles
  customerSelectionContainer: {
    padding: theme.spacing.md,
  },
  customerSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  customerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginRight: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[800],
  },
  searchClearButton: {
    padding: 4,
  },
  customerList: {
    marginBottom: theme.spacing.md,
    maxHeight: 200,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
    backgroundColor: colors.white,
  },
  customerItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05', // 5% opacity
  },
  customerInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
  },
  customerEmail: {
    fontSize: 12,
    color: colors.gray[500],
  },
  emptyCustomerList: {
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  emptyCustomerText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  deliveryOptions: {
    marginBottom: theme.spacing.md,
  },
  deliveryButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  deliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    gap: theme.spacing.xs,
  },
  deliveryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  deliveryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleOption: {
    marginBottom: theme.spacing.md,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  datePickerText: {
    fontSize: 14,
    color: colors.gray[800],
    marginLeft: theme.spacing.sm,
  },
  messagePreview: {
    marginBottom: theme.spacing.md,
  },
  previewCard: {
    backgroundColor: colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  previewSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 4,
  },
  previewText: {
    fontSize: 12,
    color: colors.gray[700],
    lineHeight: 18,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  sendButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});