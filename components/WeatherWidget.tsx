import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Cloud, CloudRain, Sun, CloudSun } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { WeatherData } from '@/types';

interface WeatherWidgetProps {
  weather: WeatherData;
}

export default function WeatherWidget({ weather }: WeatherWidgetProps) {
  const getWeatherIcon = () => {
    switch (weather.icon) {
      case 'sunny':
        return <Sun size={24} color={colors.warning} />;
      case 'cloudy':
        return <Cloud size={24} color={colors.gray[500]} />;
      case 'rainy':
        return <CloudRain size={24} color={colors.primary} />;
      case 'partly-cloudy':
      default:
        return <CloudSun size={24} color={colors.warning} />;
    }
  };

  return (
    <View style={[styles.container, theme.shadows.sm]}>
      <View style={styles.iconContainer}>{getWeatherIcon()}</View>
      <View style={styles.infoContainer}>
        <Text style={styles.temperature}>{weather.temperature}°</Text>
        <Text style={styles.condition}>{weather.condition}</Text>
      </View>
      <View style={styles.highLowContainer}>
        <Text style={styles.highLow}>
          H: {weather.high}° L: {weather.low}°
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  condition: {
    fontSize: 14,
    color: colors.gray[600],
  },
  highLowContainer: {
    alignItems: 'flex-end',
  },
  highLow: {
    fontSize: 12,
    color: colors.gray[600],
  },
});