import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Clock, CheckCircle, XCircle, AlertCircle, Send, FileText } from 'lucide-react-native';

type StatusType = 'job' | 'quote' | 'invoice' | 'subscription' | 'priority';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = 'job', 
  size = 'md',
  showIcon = true
}) => {
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === 'dark';

  const getStatusColor = () => {
    if (type === 'job') {
      switch (status) {
        case 'scheduled':
          return colors.info;
        case 'in_progress':
          return colors.warning;
        case 'completed':
          return colors.secondary;
        case 'cancelled':
          return colors.danger;
        default:
          return isDarkMode ? colors.gray[600] : colors.gray[500];
      }
    } else if (type === 'quote') {
      switch (status) {
        case 'draft':
          return isDarkMode ? colors.gray[600] : colors.gray[500];
        case 'sent':
          return colors.info;
        case 'approved':
          return colors.success;
        case 'rejected':
          return colors.danger;
        case 'expired':
          return colors.warning;
        case 'scheduled':
          return colors.secondary;
        case 'converted':
          return colors.primary;
        default:
          return isDarkMode ? colors.gray[600] : colors.gray[500];
      }
    } else if (type === 'invoice') {
      switch (status) {
        case 'draft':
          return isDarkMode ? colors.gray[600] : colors.gray[500];
        case 'sent':
          return colors.info;
        case 'paid':
          return colors.success;
        case 'overdue':
          return colors.danger;
        case 'cancelled':
          return colors.warning;
        default:
          return isDarkMode ? colors.gray[600] : colors.gray[500];
      }
    } else if (type === 'subscription') {
      switch (status) {
        case 'active':
          return colors.success;
        case 'past_due':
          return colors.warning;
        case 'canceled':
          return colors.danger;
        case 'paused':
          return colors.info;
        case 'trial':
          return colors.primary;
        default:
          return isDarkMode ? colors.gray[600] : colors.gray[500];
      }
    } else if (type === 'priority') {
      switch (status) {
        case 'low':
          return colors.green[500];
        case 'medium':
          return colors.yellow[500];
        case 'high':
          return colors.orange[500];
        case 'urgent':
          return colors.red[500];
        default:
          return isDarkMode ? colors.gray[600] : colors.gray[500];
      }
    }
    
    return isDarkMode ? colors.gray[600] : colors.gray[500];
  };
  
  const getStatusText = () => {
    // Format status text to be more readable
    // e.g. 'in_progress' -> 'In Progress'
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: styles.containerSm,
          text: styles.textSm,
          icon: 14,
        };
      case 'lg':
        return {
          container: styles.containerLg,
          text: styles.textLg,
          icon: 18,
        };
      default:
        return {
          container: styles.containerMd,
          text: styles.textMd,
          icon: 16,
        };
    }
  };
  
  const getStatusIcon = () => {
    if (!showIcon) return null;
    
    const sizeStyles = getSizeStyles();
    const iconSize = sizeStyles.icon;
    const iconColor = 'white';
    
    if (type === 'quote') {
      switch (status) {
        case 'draft':
          return <FileText size={iconSize} color={iconColor} />;
        case 'sent':
          return <Send size={iconSize} color={iconColor} />;
        case 'approved':
          return <CheckCircle size={iconSize} color={iconColor} />;
        case 'rejected':
          return <XCircle size={iconSize} color={iconColor} />;
        case 'expired':
          return <Clock size={iconSize} color={iconColor} />;
        default:
          return null;
      }
    }
    
    return null;
  };
  
  const sizeStyles = getSizeStyles();
  const statusColor = getStatusColor();
  const statusIcon = getStatusIcon();
  
  return (
    <View style={[
      styles.container, 
      sizeStyles.container, 
      { backgroundColor: statusColor }
    ]}>
      {statusIcon && (
        <View style={styles.iconContainer}>
          {statusIcon}
        </View>
      )}
      <Text style={[styles.text, sizeStyles.text]}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  containerSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  containerMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  containerLg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    color: colors.white,
    fontWeight: '500',
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
  textLg: {
    fontSize: 14,
  },
  iconContainer: {
    marginRight: 4,
  },
});

export default StatusBadge;