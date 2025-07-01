// Admin configuration constants
export const ADMIN_CONFIG = {
  // Default admin credentials
  DEFAULT_EMAIL: 'admin@simplepro.com',
  DEFAULT_PASSWORD: 'Admin007!',
  
  // Password requirements for admin
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 6,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: true,
    SPECIAL_CHARS: '!@#$%^&*',
  },
  
  // Admin permissions
  PERMISSIONS: {
    UNLIMITED_CUSTOMERS: true,
    UNLIMITED_QUOTES: true,
    UNLIMITED_JOBS: true,
    ALL_FEATURES: true,
    SYSTEM_MANAGEMENT: true,
    USER_MANAGEMENT: true,
    BILLING_MANAGEMENT: true,
    DATA_EXPORT: true,
    ANALYTICS_ACCESS: true,
    ADMIN_DASHBOARD: true,
  },
  
  // Admin subscription tier
  SUBSCRIPTION_TIER: 'enterprise' as const,
  
  // Admin user type
  USER_TYPE: 'admin' as const,
  
  // Admin session settings
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  
  // Admin features
  FEATURES: {
    SAMPLE_DATA_RESET: true,
    USER_IMPERSONATION: true,
    SYSTEM_LOGS: true,
    BACKUP_RESTORE: true,
    ADVANCED_ANALYTICS: true,
  },
};

// Validation functions
export const validateAdminPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const { PASSWORD_REQUIREMENTS } = ADMIN_CONFIG;
  
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`);
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHAR && !new RegExp(`[${PASSWORD_REQUIREMENTS.SPECIAL_CHARS}]`).test(password)) {
    errors.push(`Password must contain at least one special character (${PASSWORD_REQUIREMENTS.SPECIAL_CHARS})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Check if email is admin email
export const isAdminEmail = (email: string): boolean => {
  return email.toLowerCase().trim() === ADMIN_CONFIG.DEFAULT_EMAIL.toLowerCase();
};

// Get admin test credentials (for development/testing)
export const getAdminTestCredentials = () => ({
  email: ADMIN_CONFIG.DEFAULT_EMAIL,
  password: ADMIN_CONFIG.DEFAULT_PASSWORD,
});

// Validate admin credentials
export const validateAdminCredentials = (email: string, password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!isAdminEmail(email)) {
    errors.push('Invalid admin email address');
  }
  
  if (password !== ADMIN_CONFIG.DEFAULT_PASSWORD) {
    errors.push('Invalid admin password');
  }
  
  const passwordValidation = validateAdminPassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Check if user has admin permissions
export const hasAdminPermission = (user: any, permission: keyof typeof ADMIN_CONFIG.PERMISSIONS): boolean => {
  if (!user || user.userType !== ADMIN_CONFIG.USER_TYPE) {
    return false;
  }
  
  return ADMIN_CONFIG.PERMISSIONS[permission] === true;
};

// Get admin session expiry
export const getAdminSessionExpiry = (): Date => {
  return new Date(Date.now() + ADMIN_CONFIG.SESSION_TIMEOUT);
};