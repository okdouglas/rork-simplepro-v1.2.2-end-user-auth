// Stripe configuration for SimplePro

// Stripe account ID: acct_1ReIlXDZjunbRthd
export const STRIPE_ACCOUNT_ID = 'acct_1ReIlXDZjunbRthd';

// Stripe publishable key (this would be environment-specific in a real app)
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51ReIlXDZjunbRthd0000000000000000000000000000';

// Stripe API version
export const STRIPE_API_VERSION = '2023-10-16';

// Stripe payment processing fee rates
export const STRIPE_PROCESSING_RATES = {
  percentage: 2.9, // 2.9%
  fixed: 0.30, // 30 cents
};

// Stripe product IDs (these would be created in the Stripe dashboard)
export const STRIPE_PRODUCTS = {
  STARTER_MONTHLY: 'prod_starter_monthly',
  STARTER_ANNUAL: 'prod_starter_annual',
  PROFESSIONAL_MONTHLY: 'prod_professional_monthly',
  PROFESSIONAL_ANNUAL: 'prod_professional_annual',
  ENTERPRISE_MONTHLY: 'prod_enterprise_monthly',
  ENTERPRISE_ANNUAL: 'prod_enterprise_annual',
};

// Stripe price IDs (these would be created in the Stripe dashboard)
export const STRIPE_PRICES = {
  STARTER_MONTHLY: 'price_starter_monthly',
  STARTER_ANNUAL: 'price_starter_annual',
  PROFESSIONAL_MONTHLY: 'price_professional_monthly',
  PROFESSIONAL_ANNUAL: 'price_professional_annual',
  ENTERPRISE_MONTHLY: 'price_enterprise_monthly',
  ENTERPRISE_ANNUAL: 'price_enterprise_annual',
};

// Stripe webhook endpoints
export const STRIPE_WEBHOOK_ENDPOINTS = {
  SUBSCRIPTION_UPDATED: '/api/webhooks/stripe/subscription-updated',
  PAYMENT_SUCCEEDED: '/api/webhooks/stripe/payment-succeeded',
  PAYMENT_FAILED: '/api/webhooks/stripe/payment-failed',
};

// Stripe card brands
export const STRIPE_CARD_BRANDS = {
  visa: {
    name: 'Visa',
    image: 'https://i.imgur.com/QGTIO76.png',
  },
  mastercard: {
    name: 'Mastercard',
    image: 'https://i.imgur.com/bkiVZfS.png',
  },
  amex: {
    name: 'American Express',
    image: 'https://i.imgur.com/lqiBoVS.png',
  },
  discover: {
    name: 'Discover',
    image: 'https://i.imgur.com/EPoJyQx.png',
  },
  jcb: {
    name: 'JCB',
    image: 'https://i.imgur.com/QRVHGhO.png',
  },
  diners: {
    name: 'Diners Club',
    image: 'https://i.imgur.com/pBmA0dX.png',
  },
  unionpay: {
    name: 'UnionPay',
    image: 'https://i.imgur.com/WIAP8HT.png',
  },
  unknown: {
    name: 'Card',
    image: 'https://i.imgur.com/QGTIO76.png',
  },
};

// Helper functions for Stripe
export const getCardBrandImage = (brand: string) => {
  const lowerBrand = brand.toLowerCase();
  return STRIPE_CARD_BRANDS[lowerBrand]?.image || STRIPE_CARD_BRANDS.unknown.image;
};

export const getCardBrandName = (brand: string) => {
  const lowerBrand = brand.toLowerCase();
  return STRIPE_CARD_BRANDS[lowerBrand]?.name || STRIPE_CARD_BRANDS.unknown.name;
};

// Calculate Stripe processing fee
export const calculateProcessingFee = (amount: number) => {
  return (amount * (STRIPE_PROCESSING_RATES.percentage / 100)) + STRIPE_PROCESSING_RATES.fixed;
};

// Format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};