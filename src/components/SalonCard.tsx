import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Database } from '../types/supabase';

type Salon = Database['public']['Tables']['salons']['Row'];

interface SalonCardProps {
  salon: Salon & { dist_meters?: number };
}

export function SalonCard({ salon }: SalonCardProps) {
  const router = useRouter();

  const distanceText = salon.dist_meters 
    ? salon.dist_meters < 1000 
      ? `${Math.round(salon.dist_meters)}m away`
      : `${(salon.dist_meters / 1000).toFixed(1)}km away`
    : 'Distance unknown';

  return (
    <TouchableOpacity 
      onPress={() => router.push(`/salon/${salon.id}`)}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-4 shadow-lg active:opacity-80"
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: salon.cover_image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop' }}
        className="w-full h-40 bg-zinc-800"
        resizeMode="cover"
      />
      
      <View className="px-5 py-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-xl font-bold text-white flex-1 mr-2 tracking-tight" numberOfLines={1}>
            {salon.name}
          </Text>
          <View className="flex-row items-center bg-[#FFBF00]/10 px-2 py-1 rounded-full border border-[#FFBF00]/30">
            <Ionicons name="star" size={14} color="#FFBF00" />
            <Text className="text-[#FFBF00] font-bold text-xs ml-1">{salon.rating?.toFixed(1) || 'NEW'}</Text>
          </View>
        </View>
        
        <View className="flex-row items-center mb-1">
          <Ionicons name="location-outline" size={14} color="#9CA3AF" className="mr-1" />
          <Text className="text-gray-400 text-sm font-medium" numberOfLines={1}>{salon.address}</Text>
        </View>

        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-[#FFBF00] font-semibold text-sm tracking-wide">
            {distanceText}
          </Text>
          
          <TouchableOpacity className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
