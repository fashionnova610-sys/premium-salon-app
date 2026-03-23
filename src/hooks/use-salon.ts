import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useSalon(salonId: string) {
  return useQuery({
    queryKey: ['salon', salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salons')
        .select('*, profiles!salons_owner_id_fkey(full_name, phone)')
        .eq('id', salonId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!salonId,
  });
}
