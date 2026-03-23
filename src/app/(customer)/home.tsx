import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useLocationStore } from '../../stores/location-store';
import { useSalonsNearby } from '../../hooks/use-salons-nearby';
import { SalonCard } from '../../components/SalonCard';
import { SalonMapMarker } from '../../components/SalonMapMarker';
import { Ionicons } from '@expo/vector-icons';

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#131313" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#9CA3AF" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#131313" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#131313" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#1c1c1c" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#252525" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#252525" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#FFBF00" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#1f1f1f" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

export default function CustomerHome() {
  const { latitude, longitude, address, isLoading: isLocLoading, requestLocation } = useLocationStore();
  const { data: salons, isLoading: isSalonsLoading } = useSalonsNearby(50); // 50km radius for Cameroon testing

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);

  // Variables for BottomSheet
  const snapPoints = useMemo(() => ['15%', '50%', '90%'], []);

  useEffect(() => {
    requestLocation();
  }, []);

  const handleMarkerPress = useCallback((salon: any) => {
    setSelectedSalonId(salon.id);
    mapRef.current?.animateCamera({
      center: { latitude: salon.lat, longitude: salon.lng },
      pitch: 0,
      heading: 0,
      zoom: 15,
    }, { duration: 500 });

    bottomSheetRef.current?.snapToIndex(1); // Snap to 50% to show card
  }, []);

  if (isLocLoading && !latitude) {
    return (
      <View className="flex-1 bg-[#131313] justify-center items-center">
        <ActivityIndicator size="large" color="#FFBF00" />
        <Text className="text-[#FFBF00] mt-4 font-bold tracking-wider">Acquiring GPS lock...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#131313]">
      <View className="absolute top-14 left-6 right-6 z-10 flex-row justify-between items-center pointer-events-none">
        <View className="bg-[#131313]/90 shadow-lg shadow-black/50 px-4 py-3 rounded-2xl flex-row items-center border border-white/10 pointer-events-auto">
          <Ionicons name="navigate-circle" size={24} color="#FFBF00" className="mr-3" />
          <View>
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Your Location</Text>
            <Text className="text-white font-bold tracking-tight">{address || 'Searching...'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-[#131313]/90 shadow-lg shadow-black/50 w-12 h-12 rounded-full items-center justify-center border border-white/10 pointer-events-auto active:opacity-70"
          onPress={requestLocation}
        >
          <Ionicons name="locate" size={20} color="#FFBF00" />
        </TouchableOpacity>
      </View>

      <MapView 
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: latitude || 4.0511, // Douala Fallback
          longitude: longitude || 9.7679,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
      >
        {salons?.map((salon: any) => (
          <SalonMapMarker 
            key={salon.id}
            salon={salon}
            isSelected={selectedSalonId === salon.id}
            onPress={() => handleMarkerPress(salon)}
          />
        ))}
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: '#131313', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}
        handleIndicatorStyle={{ backgroundColor: '#FFBF00', width: 40 }}
      >
        <View className="px-6 py-2">
          <Text className="text-white font-extrabold text-3xl tracking-tighter mb-4">
            Discover <Text className="text-[#FFBF00]">Salons</Text>
          </Text>
        </View>

        {isSalonsLoading ? (
          <ActivityIndicator color="#FFBF00" className="mt-8" />
        ) : (
          <BottomSheetFlatList
            data={salons}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => <SalonCard salon={item} />}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="mt-8 items-center">
                <Ionicons name="sad-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-400 font-medium mt-4 text-center">No Premium salons found near you.</Text>
              </View>
            )}
            extraData={selectedSalonId}
          />
        )}
      </BottomSheet>
    </View>
  );
}
