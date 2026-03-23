import React from 'react';
import { View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Database } from '../types/supabase';

type Salon = Database['public']['Tables']['salons']['Row'];

interface SalonMapMarkerProps {
  salon: Salon;
  onPress: () => void;
  isSelected?: boolean;
}

export function SalonMapMarker({ salon, onPress, isSelected = false }: SalonMapMarkerProps) {
  // PostGIS point syntax is POINT(long lat)
  // We need to extract them. In our DB, location is a geography(Point, 4326)
  // Actually, wait, PostGIS returns geography as a Hex string to PostgREST unless we use ST_X / ST_Y in a view or function.
  // BUT the RPC 'get_nearby_salons' returns lat and lng directly in the typed output!
  // Assuming our generated type for get_nearby_salons RPC includes lat/lng as columns if we SELECT them.
  // Let's assert they exist on this object since we will map over the RPC result.
  const markerSalon = salon as any; 
  const lat = markerSalon.lat;
  const lng = markerSalon.lng;

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      onPress={(e) => {
        e.stopPropagation();
        onPress();
      }}
      tracksViewChanges={false} // Performance optimization
    >
      <View 
        className={\`items-center justify-center rounded-full \${
          isSelected 
            ? 'bg-[#FFBF00] w-12 h-12 border-2 border-[#131313]' 
            : 'bg-[#131313] w-10 h-10 border-2 border-[#FFBF00]'
        } shadow-lg shadow-black/50\`}
      >
        <Ionicons 
          name={isSelected ? "storefront" : "storefront-outline"} 
          size={isSelected ? 24 : 18} 
          color={isSelected ? "#131313" : "#FFBF00"} 
        />
      </View>
    </Marker>
  );
}
