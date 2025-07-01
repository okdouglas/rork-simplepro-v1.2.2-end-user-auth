import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ChevronRight, FileEdit, Send, CalendarClock, CheckCircle, ArrowRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

export interface PipelineItem {
  id: string;
  customerId: string;
  title: string;
  value: number;
  priority: string;
  date: string;
  type: string;
  status: string;
}

export interface PipelineStage {
  stage: string;
  name: string;
  count: number;
  value: number;
  color: string;
  icon: string;
  conversionRate?: number;
  avgTimeInStage?: number;
  items: PipelineItem[];
}

interface PipelineSectionProps {
  stages: PipelineStage[];
  onAddItem?: (stage: string) => void;
  onMoveItem?: (itemId: string, fromStage: string, toStage: string) => void;
  onFilterChange?: (filter: string) => void;
}

export default function PipelineSection({ 
  stages, 
  onAddItem, 
  onMoveItem, 
  onFilterChange 
}: PipelineSectionProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return colors.danger;
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.primary;
      default:
        return colors.gray[400];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStageIcon = (iconName: string, color: string) => {
    const size = 20;
    
    switch (iconName) {
      case 'FileEdit':
        return <FileEdit size={size} color={color} />;
      case 'Send':
        return <Send size={size} color={color} />;
      case 'CalendarClock':
        return <CalendarClock size={size} color={color} />;
      case 'CheckCircle':
        return <CheckCircle size={size} color={color} />;
      default:
        return <FileEdit size={size} color={color} />;
    }
  };

  const handleItemPress = (item: PipelineItem) => {
    if (item.type === 'quote') {
      // Navigate to quote details
      router.push({
        pathname: '/quotes/[id]',
        params: { id: item.id }
      } as any);
    } else {
      // Navigate to job details
      router.push({
        pathname: '/jobs/[id]',
        params: { id: item.id }
      } as any);
    }
  };

  const handleAddItem = (stage: string) => {
    if (onAddItem) {
      onAddItem(stage);
    } else {
      // Default behavior if no callback provided
      switch (stage) {
        case 'leads':
          router.push('/quotes/new');
          break;
        case 'warm':
          router.push('/quotes');
          break;
        case 'open_invoices':
          router.push('/jobs/new');
          break;
        case 'closed_won':
          router.push('/jobs');
          break;
      }
    }
  };

  const getQuickActionText = (stage: string) => {
    switch (stage) {
      case 'leads':
        return 'Create Quote';
      case 'warm':
        return 'Send Quote';
      case 'open_invoices':
        return 'Schedule Job';
      case 'closed_won':
        return 'View Completed';
      default:
        return 'Add Item';
    }
  };

  const getStageProgressWidth = (index: number) => {
    return `${(index + 1) * 25}%`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Financial Pipeline</Text>
        
        <View style={styles.pipelineMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total Value</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(stages.reduce((sum, stage) => sum + stage.value, 0))}
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Conversion</Text>
            <Text style={styles.metricValue}>
              {stages.find(s => s.stage === 'warm')?.conversionRate?.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
      
      {/* Pipeline Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          {stages.map((stage, index) => (
            <View 
              key={`progress-${stage.stage}`}
              style={[
                styles.progressSegment,
                { 
                  width: getStageProgressWidth(index),
                  backgroundColor: stage.color,
                  borderTopRightRadius: index === stages.length - 1 ? 4 : 0,
                  borderBottomRightRadius: index === stages.length - 1 ? 4 : 0,
                  borderTopLeftRadius: index === 0 ? 4 : 0,
                  borderBottomLeftRadius: index === 0 ? 4 : 0,
                }
              ]}
            />
          ))}
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stagesContainer}
      >
        {stages.map((stage, index) => (
          <View key={stage.stage} style={styles.stageColumn}>
            <View style={styles.stageHeader}>
              <View style={styles.stageNameContainer}>
                <View 
                  style={[
                    styles.stageIconContainer, 
                    { backgroundColor: `${stage.color}20` }
                  ]}
                >
                  {getStageIcon(stage.icon, stage.color)}
                </View>
                <View>
                  <Text style={styles.stageName}>{stage.name}</Text>
                  <Text style={styles.stageCount}>{stage.count} items</Text>
                </View>
              </View>
              
              <View style={styles.stageMetrics}>
                <Text style={styles.stageValue}>{formatCurrency(stage.value)}</Text>
                {stage.avgTimeInStage !== undefined && stage.avgTimeInStage > 0 && (
                  <Text style={styles.stageTimeMetric}>
                    Avg. {stage.avgTimeInStage.toFixed(1)} days
                  </Text>
                )}
              </View>
            </View>
            
            <View style={styles.itemsContainer}>
              {stage.items.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.itemValue}>{formatCurrency(item.value)}</Text>
                    <Text style={styles.itemDate}>{item.date}</Text>
                  </View>
                  <ChevronRight size={16} color={colors.gray[400]} />
                </TouchableOpacity>
              ))}
              
              {/* Quick Action Button */}
              <TouchableOpacity 
                style={[
                  styles.quickActionButton,
                  { borderColor: stage.color }
                ]}
                onPress={() => handleAddItem(stage.stage)}
              >
                <Text style={[styles.quickActionText, { color: stage.color }]}>
                  {getQuickActionText(stage.stage)}
                </Text>
                <ArrowRight size={16} color={stage.color} />
              </TouchableOpacity>
            </View>
            
            {/* Stage Connector - only show between stages */}
            {index < stages.length - 1 && (
              <View style={styles.stageConnector}>
                <ArrowRight size={20} color={colors.gray[400]} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');
const stageWidth = Math.min(width * 0.75, 280); // Responsive stage width

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
  },
  pipelineMetrics: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  metricItem: {
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
  },
  progressContainer: {
    height: 8,
    marginBottom: theme.spacing.md,
    paddingHorizontal: 2,
  },
  progressTrack: {
    height: '100%',
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
  stagesContainer: {
    paddingBottom: theme.spacing.sm,
  },
  stageColumn: {
    width: stageWidth,
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  stageNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  stageIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[800],
  },
  stageCount: {
    fontSize: 12,
    color: colors.gray[600],
  },
  stageMetrics: {
    alignItems: 'flex-end',
  },
  stageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
  },
  stageTimeMetric: {
    fontSize: 11,
    color: colors.gray[500],
  },
  itemsContainer: {
    gap: theme.spacing.xs,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.xs,
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: theme.spacing.xs,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[800],
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 11,
    color: colors.gray[500],
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: theme.spacing.xs,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: theme.spacing.xs,
  },
  stageConnector: {
    position: 'absolute',
    right: -22,
    top: '50%',
    marginTop: -10,
    zIndex: 10,
  },
});