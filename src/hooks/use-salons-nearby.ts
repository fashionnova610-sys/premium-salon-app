import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useLocationStore } from '../stores/location-store';

export function useSalonsNearby(radiusKm: number = 20) {
  const { latitude, longitude } = useLocationStore();

  return useQuery({
    queryKey: ['salons-nearby', latitude, longitude, radiusKm],
    queryFn: async () => {
      // If we don't have GPS coordinate permission yet, don't execute the RPC!
      if (latitude === null || longitude === null) {
        return [];
      }

      const { data, error } = await supabase
        .rpc('get_nearby_salons', {
          lat: latitude,
          long: longitude,
          radius_meters: radiusKm * 1000,
        });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    // Only run the query once we have a valid map anchor
    enabled: latitude !== null && longitude !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
