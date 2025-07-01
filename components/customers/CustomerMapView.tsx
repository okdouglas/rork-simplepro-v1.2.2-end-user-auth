import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import CustomerHeatmap from './CustomerHeatmap';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { ClientLocation } from '@/types';

// Platform-specific map component type
type MapViewComponent = any;
type MarkerComponent = any;
type RegionComponent = any;

interface CustomerMapViewProps {
  clientLocations: ClientLocation[];
  onClientPress: (clientId: string) => void;
}

export default function CustomerMapView({
  clientLocations,
  onClientPress
}: CustomerMapViewProps) {
  const [MapView, setMapView] = useState<MapViewComponent | null>(null);
  const [Marker, setMarker] = useState<MarkerComponent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useWebFallback, setUseWebFallback] = useState(false);
  const [mapRegion, setMapRegion] = useState<RegionComponent | null>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const loadMapComponents = async () => {
      try {
        // Check if we're on web platform
        if (Platform.OS === 'web') {
          setUseWebFallback(true);
          setIsLoading(false);
          return;
        }

        // Dynamic import for native platforms only
        // Wrap in try-catch to handle potential errors
        try {
          const mapModule = await import('react-native-maps');
          setMapView(() => mapModule.default);
          setMarker(() => mapModule.Marker);
        } catch (error) {
          console.warn('Failed to load react-native-maps, falling back to web view:', error);
          setUseWebFallback(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.warn('Error in map component initialization:', error);
        setUseWebFallback(true);
        setIsLoading(false);
      }
    };

    loadMapComponents();
    
    // Calculate initial map dimensions
    const { width } = Dimensions.get('window');
    const containerWidth = width - (theme.spacing.md * 2); // Account for horizontal margins
    setMapDimensions({ width: containerWidth, height: 300 });
    
    // Calculate map region from client locations
    calculateMapRegion();
    
    // Add event listener for dimension changes
    const dimensionsListener = Dimensions.addEventListener('change', () => {
      const { width } = Dimensions.get('window');
      const containerWidth = width - (theme.spacing.md * 2);
      setMapDimensions({ width: containerWidth, height: 300 });
    });
    
    return () => {
      // Clean up dimension listener
      dimensionsListener.remove();
    };
  }, [clientLocations]);

  // Calculate map region from client locations
  const calculateMapRegion = () => {
    const validLocations = clientLocations.filter(c => c.coordinates);
    if (validLocations.length === 0) {
      // Default to Oklahoma City area
      setMapRegion({
        latitude: 35.4676,
        longitude: -97.5164,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
      return;
    }

    const latitudes = validLocations.map(c => c.coordinates!.latitude);
    const longitudes = validLocations.map(c => c.coordinates!.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    // Add padding to ensure markers aren't at the edge
    const latPadding = (maxLat - minLat) * 0.2;
    const lngPadding = (maxLng - minLng) * 0.2;
    
    setMapRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.02), // Ensure minimum zoom
      longitudeDelta: Math.max((maxLng - minLng) * 1.4, 0.02), // Ensure minimum zoom
    });
  };

  // Handle container layout to ensure proper sizing
  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setMapDimensions({ width, height });
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Web fallback - use heatmap or web-compatible map
  if (useWebFallback || Platform.OS === 'web') {
    return (
      <CustomerHeatmap 
        clientLocations={clientLocations}
        onClientPress={onClientPress}
      />
    );
  }

  // Native map view for mobile platforms
  if (!MapView || !Marker || !mapRegion) {
    return (
      <CustomerHeatmap 
        clientLocations={clientLocations}
        onClientPress={onClientPress}
      />
    );
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <MapView
        style={[styles.map, { width: mapDimensions.width, height: mapDimensions.height }]}
        initialRegion={mapRegion}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapPadding={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        {/* Customer Locations */}
        {clientLocations
          .filter(client => client.coordinates)
          .map(client => (
            <Marker
              key={client.id}
              coordinate={client.coordinates!}
              title={client.name}
              description={client.address}
              pinColor={colors.blue[500]}
              onPress={() => onClientPress(client.id)}
              tracksViewChanges={false} // Performance optimization
            />
          ))
        }
      </MapView>
      
      {/* Map overlay with customer count */}
      <View style={styles.mapOverlay}>
        <Text style={styles.mapOverlayText}>
          {clientLocations.filter(c => c.coordinates).length} customer locations
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    height: 300,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  map: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    color: colors.gray[600],
    fontSize: 16,
  },
  mapOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.xs,
  },
  mapOverlayText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[800],
  },
});