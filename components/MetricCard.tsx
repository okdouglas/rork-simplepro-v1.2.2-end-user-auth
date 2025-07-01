import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface MetricCardProps {
  title: string;
  mainValue: string | number;
  secondaryValue?: string | number;
  tertiaryValue?: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string | number;
  subtitle?: string;
  onPress?: () => void;
  tooltip?: string;
}

export default function MetricCard({ 
  title, 
  mainValue, 
  secondaryValue, 
  tertiaryValue,
  icon, 
  color,
  trend,
  trendValue,
  subtitle,
  onPress,
  tooltip
}: MetricCardProps) {
  const renderTrendIcon = () => {
    if (!trend) return null;
    
    const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.gray[500];
    
    return (
      <View style={styles.trendContainer}>
        {trend === 'up' && <TrendingUp size={16} color={trendColor} />}
        {trend === 'down' && <TrendingDown size={16} color={trendColor} />}
        {trend === 'stable' && <Minus size={16} color={trendColor} />}
        {trendValue && <Text style={[styles.trendValue, { color: trendColor }]} numberOfLines={1}>{trendValue}</Text>}
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        theme.shadows.sm, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.border
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {tooltip && (
            <TouchableOpacity style={styles.tooltipIcon}>
              <Info size={14} color={colors.gray[500]} />
            </TouchableOpacity>
          )}
        </View>
        {renderTrendIcon()}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          {icon}
        </View>
        
        <View style={styles.valuesContainer}>
          <Text style={[styles.mainValue, { color: colors.text }]}>{mainValue}</Text>
          
          {secondaryValue && (
            <Text style={[styles.secondaryValue, { color: colors.gray[700] }]}>
              {secondaryValue}
            </Text>
          )}
          
          {tertiaryValue && (
            <Text style={[styles.tertiaryValue, { color: colors.gray[600] }]}>
              {tertiaryValue}
            </Text>
          )}
        </View>
      </View>
      
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.gray[500] }]}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  tooltipIcon: {
    marginLeft: theme.spacing.xs,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  valuesContainer: {
    flex: 1,
  },
  mainValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  secondaryValue: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  tertiaryValue: {
    fontSize: 12,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '40%',
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
    flexShrink: 1,
  },
});