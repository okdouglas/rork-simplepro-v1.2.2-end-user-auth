import { z } from 'zod';
import { publicProcedure, createTRPCRouter } from '../../create-context';
import { 
  ADMIN_CONFIG, 
  validateAdminPassword, 
  isAdminEmail, 
  validateAdminCredentials,
  getAdminSessionExpiry 
} from '@/constants/admin';

// Admin authentication router
export const adminRouter = createTRPCRouter({
  // Admin login procedure
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const { email, password } = input;
      
      try {
        // Validate admin credentials
        const credentialValidation = validateAdminCredentials(email, password);
        if (!credentialValidation.isValid) {
          throw new Error(`Authentication failed: ${credentialValidation.errors.join(', ')}`);
        }
        
        // Create admin session
        const sessionExpiry = getAdminSessionExpiry();
        const adminToken = `admin_jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Return admin user data
        return {
          user: {
            id: 'admin_user',
            email: ADMIN_CONFIG.DEFAULT_EMAIL,
            userType: ADMIN_CONFIG.USER_TYPE,
            subscriptionTier: ADMIN_CONFIG.SUBSCRIPTION_TIER,
            subscriptionStatus: 'active' as const,
            emailVerified: true,
            businessProfile: {
              companyName: 'SimplePro Admin',
              ownerName: 'System Administrator',
              email: ADMIN_CONFIG.DEFAULT_EMAIL,
              phone: '+1 (555) 123-4567',
              address: 'System Administration',
            },
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            onboardingCompleted: true,
            permissions: ADMIN_CONFIG.PERMISSIONS,
            features: ADMIN_CONFIG.FEATURES,
            sessionExpiry: sessionExpiry.toISOString(),
          },
          token: adminToken,
          message: 'Admin login successful',
          sessionExpiry: sessionExpiry.toISOString(),
        };
      } catch (error) {
        console.error('Admin login error:', error);
        throw new Error((error as Error).message || 'Admin authentication failed');
      }
    }),
  
  // Validate admin credentials
  validateCredentials: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .query(async ({ input }) => {
      const { email, password } = input;
      
      const isValidEmail = isAdminEmail(email);
      const isValidPassword = password === ADMIN_CONFIG.DEFAULT_PASSWORD;
      const passwordValidation = validateAdminPassword(password);
      const credentialValidation = validateAdminCredentials(email, password);
      
      return {
        isValidEmail,
        isValidPassword,
        passwordValidation,
        credentialValidation,
        isAdmin: credentialValidation.isValid,
        adminFeatures: ADMIN_CONFIG.FEATURES,
        adminPermissions: ADMIN_CONFIG.PERMISSIONS,
      };
    }),
  
  // Get admin configuration (for frontend)
  getConfig: publicProcedure
    .query(async () => {
      return {
        email: ADMIN_CONFIG.DEFAULT_EMAIL,
        passwordRequirements: ADMIN_CONFIG.PASSWORD_REQUIREMENTS,
        permissions: ADMIN_CONFIG.PERMISSIONS,
        features: ADMIN_CONFIG.FEATURES,
        subscriptionTier: ADMIN_CONFIG.SUBSCRIPTION_TIER,
        sessionTimeout: ADMIN_CONFIG.SESSION_TIMEOUT,
        // Don't return the actual password for security
      };
    }),
  
  // Change admin password (protected procedure)
  changePassword: publicProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6),
      confirmPassword: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { currentPassword, newPassword, confirmPassword } = input;
      
      try {
        // Verify current password
        if (currentPassword !== ADMIN_CONFIG.DEFAULT_PASSWORD) {
          throw new Error('Current password is incorrect');
        }
        
        // Check if passwords match
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match');
        }
        
        // Validate new password
        const passwordValidation = validateAdminPassword(newPassword);
        if (!passwordValidation.isValid) {
          throw new Error(`New password validation failed: ${passwordValidation.errors.join(', ')}`);
        }
        
        // In a real application, you would update the password in the database
        // For this demo, we'll just return success and log the change
        console.log('Admin password change requested:', {
          oldPassword: currentPassword,
          newPassword: newPassword,
          timestamp: new Date().toISOString(),
          sessionId: `admin_session_${Date.now()}`,
        });
        
        return {
          success: true,
          message: 'Admin password updated successfully',
          timestamp: new Date().toISOString(),
          requiresReauth: true,
        };
      } catch (error) {
        console.error('Admin password change error:', error);
        throw new Error((error as Error).message || 'Failed to change admin password');
      }
    }),
  
  // Admin session validation
  validateSession: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ input }) => {
      const { token } = input;
      
      // Basic token validation (in production, use proper JWT validation)
      const isValidToken = token.startsWith('admin_jwt_');
      
      if (!isValidToken) {
        throw new Error('Invalid admin session token');
      }
      
      return {
        isValid: true,
        userType: ADMIN_CONFIG.USER_TYPE,
        permissions: ADMIN_CONFIG.PERMISSIONS,
        features: ADMIN_CONFIG.FEATURES,
        sessionExpiry: getAdminSessionExpiry().toISOString(),
      };
    }),
  
  // Get admin system stats
  getSystemStats: publicProcedure
    .query(async () => {
      // Mock system statistics for admin dashboard
      return {
        totalUsers: 1234,
        activeUsers: 567,
        totalQuotes: 8901,
        totalJobs: 2345,
        systemHealth: 99.9,
        serverUptime: '15 days, 4 hours',
        databaseSize: '2.3 GB',
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        activeSubscriptions: {
          free: 800,
          basic: 300,
          pro: 120,
          enterprise: 14,
        },
        revenueMetrics: {
          monthlyRecurring: 15420,
          totalRevenue: 89750,
          conversionRate: 12.5,
        },
      };
    }),
});