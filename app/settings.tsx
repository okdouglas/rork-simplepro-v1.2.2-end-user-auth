import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { HelpCircle, Info } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  
  const [offlineMode, setOfflineMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  
  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache? This will not delete any of your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: () => {
            // Would handle cache clearing
            Alert.alert('Success', 'Cache cleared successfully');
          }
        },
      ]
    );
  };
  
  const handleExportData = () => {
    // Would handle data export
    Alert.alert('Export Data', 'Your data has been exported successfully');
  };

  const navigateToHelp = () => {
    router.push('/help');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.gray[200] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>App Preferences</Text>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.gray[200] }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Offline Mode</Text>
                <Text style={[styles.settingDescription, { color: colors.gray[600] }]}>
                  Work without internet connection
                </Text>
              </View>
              <Switch
                value={offlineMode}
                onValueChange={setOfflineMode}
                trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                thumbColor={offlineMode ? colors.primary : colors.gray[100]}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.gray[200] }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Auto Sync</Text>
                <Text style={[styles.settingDescription, { color: colors.gray[600] }]}>
                  Automatically sync data when online
                </Text>
              </View>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                thumbColor={autoSync ? colors.primary : colors.gray[100]}
              />
            </View>
          </View>
          
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.gray[200] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.gray[200] }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.gray[600] }]}>
                  Receive alerts on your device
                </Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                thumbColor={pushNotifications ? colors.primary : colors.gray[100]}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.gray[200] }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Email Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.gray[600] }]}>
                  Receive alerts via email
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                thumbColor={emailNotifications ? colors.primary : colors.gray[100]}
              />
            </View>
          </View>
          
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.gray[200] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location & Privacy</Text>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.gray[200] }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Location Services</Text>
                <Text style={[styles.settingDescription, { color: colors.gray[600] }]}>
                  Allow app to access your location
                </Text>
              </View>
              <Switch
                value={locationServices}
                onValueChange={setLocationServices}
                trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                thumbColor={locationServices ? colors.primary : colors.gray[100]}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.gray[200] }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Auto Backup</Text>
                <Text style={[styles.settingDescription, { color: colors.gray[600] }]}>
                  Automatically backup your data
                </Text>
              </View>
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
                trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
                thumbColor={autoBackup ? colors.primary : colors.gray[100]}
              />
            </View>
          </View>
          
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.gray[200] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Management</Text>
            
            <Button
              title="Clear Cache"
              onPress={handleClearCache}
              variant="outline"
              fullWidth
              style={styles.dataButton}
            />
            
            <Button
              title="Export Data"
              onPress={handleExportData}
              variant="outline"
              fullWidth
              style={styles.dataButton}
            />
          </View>
          
          {/* Help & Support Section */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.gray[200] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Help & Support</Text>
            
            <Button
              title="Help & Support Center"
              onPress={navigateToHelp}
              variant="primary"
              fullWidth
              icon={<HelpCircle size={18} color={colors.white} />}
              style={styles.helpButton}
            />
            
            <Button
              title="About SimplePro"
              onPress={() => Alert.alert("About", "SimplePro v1.0.0\nBuild 2023.06.24")}
              variant="outline"
              fullWidth
              icon={<Info size={18} color={colors.primary} />}
              style={styles.dataButton}
            />
          </View>
          
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.gray[200] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            
            <View style={[styles.aboutItem, { borderBottomColor: colors.gray[200] }]}>
              <Text style={[styles.aboutLabel, { color: colors.text }]}>Version</Text>
              <Text style={[styles.aboutValue, { color: colors.gray[600] }]}>1.0.0</Text>
            </View>
            
            <View style={[styles.aboutItem, { borderBottomColor: colors.gray[200] }]}>
              <Text style={[styles.aboutLabel, { color: colors.text }]}>Build</Text>
              <Text style={[styles.aboutValue, { color: colors.gray[600] }]}>2023.06.24</Text>
            </View>
            
            <View style={[styles.aboutItem, { borderBottomColor: colors.gray[200] }]}>
              <Text style={[styles.aboutLabel, { color: colors.text }]}>Terms of Service</Text>
              <Text style={[styles.aboutLink, { color: colors.primary }]}>View</Text>
            </View>
            
            <View style={[styles.aboutItem, { borderBottomColor: colors.gray[200] }]}>
              <Text style={[styles.aboutLabel, { color: colors.text }]}>Privacy Policy</Text>
              <Text style={[styles.aboutLink, { color: colors.primary }]}>View</Text>
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
  section: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  dataButton: {
    marginBottom: theme.spacing.sm,
  },
  helpButton: {
    marginBottom: theme.spacing.sm,
    backgroundColor: colors.primary,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  aboutLabel: {
    fontSize: 16,
  },
  aboutValue: {
    fontSize: 16,
  },
  aboutLink: {
    fontSize: 16,
    fontWeight: '500',
  },
});