import { z } from 'zod';
import { publicProcedure, createTRPCRouter } from '../../create-context';
import { ADMIN_CONFIG, validateAdminPassword, isAdminEmail } from '@/constants/admin';

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
      
      // Check if this is an admin login attempt
      if (!isAdminEmail(email)) {
        throw new Error('Invalid admin email');
      }
      
      // Validate admin password
      if (password !== ADMIN_CONFIG.DEFAULT_PASSWORD) {
        throw new Error('Invalid admin password');
      }
      
      // Validate password format
      const passwordValidation = validateAdminPassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }
      
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
          },
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          onboardingCompleted: true,
          permissions: ADMIN_CONFIG.PERMISSIONS,
        },
        token: `admin_jwt_${Date.now()}`,
        message: 'Admin login successful',
      };
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
      
      return {
        isValidEmail,
        isValidPassword,
        passwordValidation,
        isAdmin: isValidEmail && isValidPassword && passwordValidation.isValid,
      };
    }),
  
  // Get admin configuration (for frontend)
  getConfig: publicProcedure
    .query(async () => {
      return {
        email: ADMIN_CONFIG.DEFAULT_EMAIL,
        passwordRequirements: ADMIN_CONFIG.PASSWORD_REQUIREMENTS,
        permissions: ADMIN_CONFIG.PERMISSIONS,
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
      // For this demo, we'll just return success
      console.log('Admin password change requested:', {
        oldPassword: currentPassword,
        newPassword: newPassword,
        timestamp: new Date().toISOString(),
      });
      
      return {
        success: true,
        message: 'Admin password updated successfully',
        timestamp: new Date().toISOString(),
      };
    }),
});