import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Clock, DollarSign, Users, Star, TrendingUp } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { TemplateAnalytics } from '@/types';

interface TemplateAnalyticsSectionProps {
  templates: TemplateAnalytics[];
  onTemplatePress?: (templateId: string) => void;
}

export default function TemplateAnalyticsSection({ templates, onTemplatePress }: TemplateAnalyticsSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hvac':
        return colors.primary;
      case 'plumbing':
        return colors.secondary;
      case 'electrical':
        return colors.warning;
      default:
        return colors.gray[500];
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Template Analytics</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.templatesContainer}
      >
        {templates.map((template) => (
          <TouchableOpacity 
            key={template.templateId}
            style={styles.templateCard}
            onPress={() => onTemplatePress && onTemplatePress(template.templateId)}
          >
            <View style={styles.templateHeader}>
              <Text style={styles.templateName} numberOfLines={1}>{template.name}</Text>
              <View 
                style={[
                  styles.categoryBadge, 
                  { backgroundColor: getCategoryColor(template.category) }
                ]}
              >
                <Text style={styles.categoryText}>{template.category}</Text>
              </View>
            </View>
            
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <TrendingUp size={14} color={colors.success} />
                <Text style={styles.metricValue}>{formatPercent(template.conversionRate)}</Text>
                <Text style={styles.metricLabel}>Conversion</Text>
              </View>
              
              <View style={styles.metricItem}>
                <DollarSign size={14} color={colors.primary} />
                <Text style={styles.metricValue}>{formatCurrency(template.averageJobValue)}</Text>
                <Text style={styles.metricLabel}>Avg Value</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Users size={14} color={colors.secondary} />
                <Text style={styles.metricValue}>{template.jobCount}</Text>
                <Text style={styles.metricLabel}>Jobs</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Star size={14} color={colors.warning} />
                <Text style={styles.metricValue}>{template.customerSatisfaction}</Text>
                <Text style={styles.metricLabel}>Rating</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Clock size={14} color={colors.gray[600]} />
                <Text style={styles.metricValue}>{template.averageCompletionTime}h</Text>
                <Text style={styles.metricLabel}>Avg Time</Text>
              </View>
              
              <View style={styles.metricItem}>
                <DollarSign size={14} color={colors.success} />
                <Text style={styles.metricValue}>{formatPercent(template.profitMargin)}</Text>
                <Text style={styles.metricLabel}>Margin</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  templatesContainer: {
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  templateCard: {
    width: 280,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.white,
    textTransform: 'uppercase',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metricItem: {
    width: '30%',
    alignItems: 'flex-start',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.gray[500],
  },
});