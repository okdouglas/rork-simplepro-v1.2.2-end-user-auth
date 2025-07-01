import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, FlatList } from 'react-native';
import { FileText, X, Check, Circle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { QuoteItem } from '@/types';
import { useQuoteTemplates } from '@/store/quoteTemplateStore';

interface QuoteTemplateSelectorProps {
  serviceCategory: string;
  onApplyTemplate: (items: QuoteItem[], templateName: string) => void;
}

export default function QuoteTemplateSelector({ serviceCategory, onApplyTemplate }: QuoteTemplateSelectorProps) {
  const { templates } = useQuoteTemplates();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  const filteredTemplates = serviceCategory 
    ? templates.filter(t => t.category === serviceCategory)
    : templates;

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleApplyTemplate = () => {
    if (selectedTemplateId) {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      if (selectedTemplate) {
        onApplyTemplate(selectedTemplate.items, selectedTemplate.name);
        setModalVisible(false);
        setSelectedTemplateId(null);
      }
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTemplateId(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
        disabled={!serviceCategory}
      >
        <FileText size={20} color={serviceCategory ? colors.primary : colors.gray[400]} />
        <Text 
          style={[
            styles.selectorText,
            !serviceCategory && styles.disabledText
          ]}
        >
          {serviceCategory ? 'Select a template' : 'Select a service category first'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Template</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <X size={24} color={colors.gray[700]} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredTemplates}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.templateItem,
                    selectedTemplateId === item.id && styles.selectedTemplateItem
                  ]}
                  onPress={() => handleSelectTemplate(item.id)}
                >
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{item.name}</Text>
                    <Text style={styles.templateDescription}>{item.description}</Text>
                    <Text style={styles.templateItemCount}>
                      {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                  <View style={styles.checkboxContainer}>
                    {selectedTemplateId === item.id ? (
                      <Check size={20} color={colors.primary} />
                    ) : (
                      <Circle size={20} color={colors.gray[400]} />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No templates available for this service category
                  </Text>
                </View>
              }
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[
                  styles.applyButton,
                  !selectedTemplateId && styles.applyButtonDisabled
                ]}
                onPress={handleApplyTemplate}
                disabled={!selectedTemplateId}
              >
                <Text style={styles.applyButtonText}>Apply Template</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: colors.white,
  },
  selectorText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: colors.gray[800],
  },
  disabledText: {
    color: colors.gray[400],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.md,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  selectedTemplateItem: {
    backgroundColor: colors.gray[100],
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[800],
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 4,
  },
  templateItemCount: {
    fontSize: 12,
    color: colors.gray[500],
  },
  checkboxContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
  },
  modalFooter: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});