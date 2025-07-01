import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Download, Bell } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface HeaderProps {
  title?: string;
  businessName?: string;
  showAdd?: boolean;
  onAddPress?: () => void;
  showExport?: boolean;
  onExportPress?: () => void;
  rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  businessName,
  showAdd = false,
  onAddPress,
  showExport = false,
  onExportPress,
  rightComponent,
}) => {
  const router = useRouter();

  const handleNotificationsPress = () => {
    router.push('/notifications');
  };

  return (
    <View style={styles.container}>
      {/* Title on the left */}
      <View style={styles.titleContainer}>
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <Text style={styles.businessName}>{businessName || 'SimplePro'}</Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        {/* Notification bell on the right */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationsPress}
        >
          <Bell size={20} color={colors.gray[700]} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>

        {showExport && onExportPress && (
          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={onExportPress}
          >
            <Download size={20} color={colors.white} />
          </TouchableOpacity>
        )}

        {showAdd && onAddPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onAddPress}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        )}

        {rightComponent && (
          <View style={styles.rightComponentContainer}>
            {rightComponent}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    height: Platform.OS === 'ios' ? 50 : 56, // Fixed height for consistency across platforms
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start', // Left align the title
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  businessName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButton: {
    backgroundColor: colors.blue[500],
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  rightComponentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;