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
        className={`items-center justify-center rounded-full ${
          isSelected 
            ? 'bg-[#FFBF00] w-12 h-12 border-2 border-[#131313]' 
            : 'bg-[#131313] w-10 h-10 border-2 border-[#FFBF00]'
        } shadow-lg shadow-black/50`}
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
