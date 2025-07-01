import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { FileText, Send, CheckCircle, Calendar, Briefcase } from 'lucide-react-native';
import { QuoteStatus } from '@/types';

interface QuoteStatusProgressProps {
  status: QuoteStatus;
  size?: 'sm' | 'md' | 'lg';
}

const QuoteStatusProgress: React.FC<QuoteStatusProgressProps> = ({ 
  status,
  size = 'md'
}) => {
  // Define the workflow steps
  const steps = [
    { id: 'draft', label: 'Draft', icon: FileText },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar },
    { id: 'converted', label: 'Converted', icon: Briefcase },
  ];
  
  // Map status to step index
  const getStepIndex = (status: QuoteStatus): number => {
    switch (status) {
      case 'draft': return 0;
      case 'sent': return 1;
      case 'approved': return 2;
      case 'scheduled': return 3;
      case 'converted': return 4;
      case 'rejected': return 1; // Rejected is a terminal state at the "sent" step
      case 'expired': return 1; // Expired is a terminal state at the "sent" step
      default: return 0;
    }
  };
  
  const currentStepIndex = getStepIndex(status);
  
  // Determine if the workflow is in a terminal state (rejected or expired)
  const isTerminalState = status === 'rejected' || status === 'expired';
  
  // Get size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          iconSize: 14,
          stepSize: 24,
          lineHeight: 2,
          fontSize: 10,
        };
      case 'lg':
        return {
          iconSize: 20,
          stepSize: 36,
          lineHeight: 3,
          fontSize: 14,
        };
      default: // md
        return {
          iconSize: 16,
          stepSize: 30,
          lineHeight: 2,
          fontSize: 12,
        };
    }
  };
  
  const sizeStyles = getSizeStyles();
  
  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index <= currentStepIndex && !isTerminalState;
          const isCurrentStep = index === currentStepIndex;
          
          // For rejected or expired status, make the "sent" step red
          const isErrorStep = (status === 'rejected' || status === 'expired') && index === 1;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <View 
                style={[
                  styles.stepCircle, 
                  { 
                    width: sizeStyles.stepSize, 
                    height: sizeStyles.stepSize,
                    backgroundColor: isErrorStep 
                      ? colors.danger 
                      : isActive 
                        ? colors.primary 
                        : colors.gray[200]
                  }
                ]}
              >
                <StepIcon 
                  size={sizeStyles.iconSize} 
                  color={isActive ? colors.white : colors.gray[500]} 
                />
              </View>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <View 
                  style={[
                    styles.progressLine, 
                    { 
                      height: sizeStyles.lineHeight,
                      backgroundColor: index < currentStepIndex && !isTerminalState 
                        ? colors.primary 
                        : colors.gray[200]
                    }
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
      
      {/* Step labels */}
      <View style={styles.labelsContainer}>
        {steps.map((step, index) => (
          <Text 
            key={`label-${step.id}`}
            style={[
              styles.stepLabel, 
              { 
                fontSize: sizeStyles.fontSize,
                color: index <= currentStepIndex && !isTerminalState 
                  ? colors.gray[800] 
                  : colors.gray[500],
                fontWeight: index === currentStepIndex ? '600' : '400'
              }
            ]}
          >
            {step.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  stepCircle: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.gray[200],
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  stepLabel: {
    textAlign: 'center',
    color: colors.gray[700],
  },
});

export default QuoteStatusProgress;