import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  User, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Bell,
  Moon,
  Shield,
  Building,
  UserCircle,
  Receipt
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useBusinessStore } from '@/store/businessStore';
import Header from '@/components/Header';

// SimplePro logo URL
const LOGO_URL = "https://i.imgur.com/JGUmZ5F.png";

export default function ProfileScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, colorScheme } = useTheme();
  const { profile, updateProfile } = useBusinessStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  
  const themeColors = colors[colorScheme] || colors;
  
  const handleSettingsPress = () => {
    router.push('/settings');
  };
  
  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: themeColors.background }]} 
      edges={['top']}
    >
      <Header title="Profile" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileSection, { backgroundColor: themeColors.card }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80' }}
              style={styles.profileImage}
            />
          </View>
          
          <Text style={[styles.profileName, { color: themeColors.text }]}>{profile.owner}</Text>
          <Text style={[styles.profileBusiness, { color: isDarkMode ? colors.gray[400] : colors.gray[600] }]}>{profile.name}</Text>
          
          <TouchableOpacity 
            style={[styles.editProfileButton, { backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100] }]}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={[styles.editProfileText, { color: isDarkMode ? colors.gray[300] : colors.gray[700] }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.sectionTitle}>
          <Text style={[styles.sectionTitleText, { color: isDarkMode ? colors.gray[300] : colors.gray[700] }]}>Preferences</Text>
        </View>
        
        <View style={[styles.settingsSection, { 
          backgroundColor: themeColors.card, 
          borderTopColor: themeColors.border,
          borderBottomColor: themeColors.border
        }]}>
          <View style={[styles.settingItem, { borderBottomColor: themeColors.border }]}>
            <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100] }]}>
              <Bell size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: isDarkMode ? colors.gray[700] : colors.gray[300], true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : isDarkMode ? colors.gray[500] : colors.gray[100]}
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: themeColors.border }]}>
            <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100] }]}>
              <Moon size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: isDarkMode ? colors.gray[700] : colors.gray[300], true: colors.primaryLight }}
              thumbColor={isDarkMode ? colors.primary : colors.gray[100]}
            />
          </View>
        </View>
        
        <View style={styles.sectionTitle}>
          <Text style={[styles.sectionTitleText, { color: isDarkMode ? colors.gray[300] : colors.gray[700] }]}>Account</Text>
        </View>
        
        <View style={[styles.settingsSection, { 
          backgroundColor: themeColors.card, 
          borderTopColor: themeColors.border,
          borderBottomColor: themeColors.border
        }]}>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={() => router.push('/profile/edit')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100] }]}>
              <UserCircle size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>Edit Profile</Text>
              <Text style={[styles.settingValue, { color: isDarkMode ? colors.gray[400] : colors.gray[500] }]}>Update your personal information</Text>
            </View>
            <ChevronRight size={20} color={isDarkMode ? colors.gray[400] : colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={() => router.push('/profile/business')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100] }]}>
              <Building size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>Business Information</Text>
              <Text style={[styles.settingValue, { color: isDarkMode ? colors.gray[400] : colors.gray[500] }]}>{profile.name}</Text>
            </View>
            <ChevronRight size={20} color={isDarkMode ? colors.gray[400] : colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={() => router.push('/profile/billing')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100] }]}>
              <Receipt size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>Billing & Subscription</Text>
              <Text style={[styles.settingValue, { color: isDarkMode ? colors.gray[400] : colors.gray[500] }]}>Professional Plan</Text>
            </View>
            <ChevronRight size={20} color={isDarkMode ? colors.gray[400] : colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={() => router.push('/profile/payment-methods')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100] }]}>
              <CreditCard size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>Payment Methods</Text>
              <Text style={[styles.settingValue, { color: isDarkMode ? colors.gray[400] : colors.gray[500] }]}>Visa •••• 4242</Text>
            </View>
            <ChevronRight size={20} color={isDarkMode ? colors.gray[400] : colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={() => router.push('/profile/security')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100] }]}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>Security</Text>
            </View>
            <ChevronRight size={20} color={isDarkMode ? colors.gray[400] : colors.gray[400]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.sectionTitle}>
          <Text style={[styles.sectionTitleText, { color: isDarkMode ? colors.gray[300] : colors.gray[700] }]}>Support</Text>
        </View>
        
        <View style={[styles.settingsSection, { 
          backgroundColor: themeColors.card, 
          borderTopColor: themeColors.border,
          borderBottomColor: themeColors.border
        }]}>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={() => router.push('/help')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100] }]}>
              <HelpCircle size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color={isDarkMode ? colors.gray[400] : colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: themeColors.border }]}
            onPress={handleSettingsPress}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100] }]}>
              <Settings size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>App Settings</Text>
            </View>
            <ChevronRight size={20} color={isDarkMode ? colors.gray[400] : colors.gray[400]} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.logoutButton, { 
            backgroundColor: themeColors.card,
            borderColor: colors.danger
          }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={[styles.versionText, { color: isDarkMode ? colors.gray[400] : colors.gray[500] }]}>SimplePro v1.0.0</Text>
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
    paddingBottom: theme.spacing.xxl,
  },
  profileSection: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileBusiness: {
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  logoutText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
  },
  versionText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    fontSize: 14,
  },
});