import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { User, Search, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { useCustomerStore } from '@/store/customerStore';
import { Customer } from '@/types';

interface CustomerSelectorProps {
  selectedCustomerId: string;
  onSelectCustomer: (customerId: string) => void;
}

export default function CustomerSelector({ selectedCustomerId, onSelectCustomer }: CustomerSelectorProps) {
  const { customers, searchCustomers } = useCustomerStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  const filteredCustomers = searchQuery 
    ? searchCustomers(searchQuery)
    : customers;
  
  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer.id);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        {selectedCustomer ? (
          <View style={styles.selectedCustomer}>
            <View style={styles.customerInitials}>
              <Text style={styles.initialsText}>
                {selectedCustomer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{selectedCustomer.name}</Text>
              <Text style={styles.customerDetail}>{selectedCustomer.phone}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <User size={20} color={colors.gray[500]} />
            <Text style={styles.placeholderText}>Select a customer</Text>
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
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}
              >
                <X size={24} color={colors.gray[700]} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search size={20} color={colors.gray[500]} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search customers..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>

            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.customerItem,
                    item.id === selectedCustomerId && styles.selectedItem
                  ]}
                  onPress={() => handleSelectCustomer(item)}
                >
                  <View style={styles.customerInitials}>
                    <Text style={styles.initialsText}>
                      {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{item.name}</Text>
                    <Text style={styles.customerDetail}>{item.phone}</Text>
                    <Text style={styles.customerDetail} numberOfLines={1}>{item.address}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No customers found</Text>
                </View>
              }
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
  selector: {
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
  selectedCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  initialsText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[800],
  },
  customerDetail: {
    fontSize: 14,
    color: colors.gray[600],
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    padding: theme.spacing.sm,
    fontSize: 16,
    color: colors.gray[800],
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  selectedItem: {
    backgroundColor: colors.gray[100],
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray[500],
  },
});