import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { ShoppingBag, X, ExternalLink } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { suppliers } from '@/mocks/suppliers';

interface SupplierSelectorProps {
  selectedSupplier: string;
  onSelectSupplier: (supplierId: string) => void;
}

export default function SupplierSelector({ selectedSupplier, onSelectSupplier }: SupplierSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectedSupplierData = suppliers.find(s => s.id === selectedSupplier);

  const handleSelectSupplier = (supplierId: string) => {
    onSelectSupplier(supplierId);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        {selectedSupplierData ? (
          <View style={styles.selectedSupplier}>
            <Image 
              source={{ uri: selectedSupplierData.logoUrl }} 
              style={styles.supplierLogo} 
              resizeMode="contain"
            />
            <Text style={styles.supplierName}>{selectedSupplierData.name}</Text>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <ShoppingBag size={20} color={colors.gray[500]} />
            <Text style={styles.placeholderText}>Select a supplier for materials</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Supplier</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={colors.gray[700]} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={suppliers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.supplierItem,
                    item.id === selectedSupplier && styles.selectedItem
                  ]}
                  onPress={() => handleSelectSupplier(item.id)}
                >
                  <Image 
                    source={{ uri: item.logoUrl }} 
                    style={styles.supplierLogo} 
                    resizeMode="contain"
                  />
                  <View style={styles.supplierInfo}>
                    <Text style={styles.supplierName}>{item.name}</Text>
                    <Text style={styles.supplierDescription}>{item.description}</Text>
                    {item.integrationStatus === 'live' ? (
                      <View style={styles.liveTag}>
                        <Text style={styles.liveTagText}>Live Integration</Text>
                      </View>
                    ) : (
                      <Text style={styles.comingSoonText}>Integration Coming Soon</Text>
                    )}
                  </View>
                  <TouchableOpacity style={styles.externalLinkButton}>
                    <ExternalLink size={16} color={colors.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
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
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    backgroundColor: colors.white,
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xs,
  },
  placeholderText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: colors.gray[500],
  },
  selectedSupplier: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplierLogo: {
    width: 40,
    height: 40,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: colors.gray[100],
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[800],
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
    paddingBottom: theme.spacing.xl,
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
  supplierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  selectedItem: {
    backgroundColor: colors.gray[100],
  },
  supplierInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  supplierDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
  },
  liveTag: {
    backgroundColor: colors.secondary + '20', // 20% opacity
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  liveTagText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '500',
  },
  comingSoonText: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
  },
  externalLinkButton: {
    padding: theme.spacing.xs,
  },
});