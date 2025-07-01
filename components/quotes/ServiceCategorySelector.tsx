import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Wrench, Thermometer, Zap } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface ServiceCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { id: 'plumbing', name: 'Plumbing', icon: <Wrench size={24} color={colors.primary} /> },
  { id: 'hvac', name: 'HVAC', icon: <Thermometer size={24} color={colors.primary} /> },
  { id: 'electrical', name: 'Electrical', icon: <Zap size={24} color={colors.primary} /> },
];

export default function ServiceCategorySelector({ selectedCategory, onSelectCategory }: ServiceCategorySelectorProps) {
  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.selectedCategory,
          ]}
          onPress={() => onSelectCategory(category.id)}
        >
          <View style={styles.iconContainer}>
            {category.icon}
          </View>
          <Text 
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    marginHorizontal: 4,
  },
  selectedCategory: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10', // 10% opacity
  },
  iconContainer: {
    marginBottom: theme.spacing.xs,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  selectedCategoryText: {
    color: colors.primary,
  },
});