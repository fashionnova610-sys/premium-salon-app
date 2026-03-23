import { create } from 'zustand';
import * as Location from 'expo-location';

type LocationState = {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  isLoading: boolean;
  errorMsg: string | null;
  requestLocation: () => Promise<void>;
  setLocation: (lat: number, lng: number) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  address: null,
  isLoading: false,
  errorMsg: null,
  
  setLocation: (lat, lng) => set({ latitude: lat, longitude: lng }),

  requestLocation: async () => {
    set({ isLoading: true, errorMsg: null });
    
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({ errorMsg: 'Permission to access location was denied', isLoading: false });
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      
      // Attempt to reverse geocode the coordinates for a readable city/street
      let reverseCode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      let readableAddress = null;
      if (reverseCode.length > 0) {
        const place = reverseCode[0];
        readableAddress = [place.city, place.region].filter(Boolean).join(', ');
      }

      set({ 
        latitude: location.coords.latitude, 
        longitude: location.coords.longitude,
        address: readableAddress || 'Current Location',
        isLoading: false 
      });

    } catch (error: any) {
      set({ errorMsg: error.message || 'Failed to fetch location', isLoading: false });
    }
  }
}));
