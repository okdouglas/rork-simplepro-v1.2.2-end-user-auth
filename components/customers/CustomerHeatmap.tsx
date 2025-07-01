import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { ClientLocation } from '@/types';
import { MapPin } from 'lucide-react-native';

interface CustomerHeatmapProps {
  clientLocations: ClientLocation[];
  onClientPress?: (clientId: string) => void;
}

export const CustomerHeatmap: React.FC<CustomerHeatmapProps> = ({
  clientLocations,
  onClientPress
}) => {
  const width = Dimensions.get('window').width - 32; // Full width minus padding
  
  // Group locations by city for better visualization
  const locationsByCity: Record<string, ClientLocation[]> = {};
  clientLocations.forEach(location => {
    const city = location.city || 'Unknown';
    if (!locationsByCity[city]) {
      locationsByCity[city] = [];
    }
    locationsByCity[city].push(location);
  });
  
  // Create a simplified map visualization for web
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Locations</Text>
      
      {/* Simple map visualization */}
      <View style={[styles.mapContainer, { width }]}>
        {clientLocations.length > 0 ? (
          <View style={styles.webMapContainer}>
            {/* Map visualization */}
            <View style={styles.mapVisualization}>
              {clientLocations.map((client, index) => {
                // Generate positions based on index for more consistent layout
                // This creates a grid-like pattern rather than random positions
                const row = Math.floor(index / 5);
                const col = index % 5;
                const left = `${10 + (col * 20)}%`;
                const top = `${10 + (row * 20)}%`;
                
                return (
                  <TouchableOpacity 
                    key={client.id || index} 
                    style={[
                      styles.customerMarker,
                      { left, top }
                    ]}
                    onPress={() => onClientPress?.(client.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.markerDot,
                      client.customerType === 'commercial' ? styles.commercialMarker : styles.residentialMarker
                    ]} />
                    <Text style={styles.markerLabel} numberOfLines={1}>{client.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* City breakdown */}
            <ScrollView style={styles.cityBreakdown}>
              <Text style={styles.cityBreakdownTitle}>Locations by City</Text>
              {Object.entries(locationsByCity).map(([city, locations]) => (
                <View key={city} style={styles.cityItem}>
                  <MapPin size={14} color={colors.primary} />
                  <Text style={styles.cityName}>{city}</Text>
                  <Text style={styles.cityCount}>{locations.length}</Text>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.residentialMarker]} />
                <Text style={styles.legendText}>Residential</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.commercialMarker]} />
                <Text style={styles.legendText}>Commercial</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyMapState}>
            <Text style={styles.emptyMapText}>No customer locations to display</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.md,
  },
  mapContainer: {
    height: 300,
  },
  webMapContainer: {
    position: 'relative',
    height: '100%',
    backgroundColor: colors.gray[100],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    overflow: 'hidden',
    flexDirection: 'row',
  },
  mapVisualization: {
    flex: 2,
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: colors.gray[300],
  },
  cityBreakdown: {
    flex: 1,
    backgroundColor: colors.white,
    padding: theme.spacing.sm,
  },
  cityBreakdownTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  cityName: {
    fontSize: 12,
    color: colors.gray[800],
    marginLeft: 4,
    flex: 1,
  },
  cityCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  customerMarker: {
    position: 'absolute',
    alignItems: 'center',
    width: 80,
    zIndex: 10,
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.white,
    ...theme.shadows.xs,
  },
  residentialMarker: {
    backgroundColor: colors.blue[500],
  },
  commercialMarker: {
    backgroundColor: colors.secondary,
  },
  markerLabel: {
    fontSize: 10,
    color: colors.gray[800],
    backgroundColor: colors.white,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    maxWidth: 80,
    textAlign: 'center',
    overflow: 'hidden',
    ...theme.shadows.xs,
  },
  mapLegend: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.borderRadius.md,
    padding: 6,
    ...theme.shadows.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
    borderWidth: 1,
    borderColor: colors.white,
  },
  legendText: {
    fontSize: 10,
    color: colors.gray[700],
  },
  emptyMapState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMapText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
});

export default CustomerHeatmap;