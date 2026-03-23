import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSalonsNearby } from '../../hooks/use-salons-nearby';
import { SalonCard } from '../../components/SalonCard';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState<number>(20);

  const { data: salons, isLoading } = useSalonsNearby(radius);

  const filteredSalons = useMemo(() => {
    if (!salons) return [];
    if (!searchQuery.trim()) return salons;
    
    const query = searchQuery.toLowerCase();
    return salons.filter((s: any) => 
      s.name.toLowerCase().includes(query) || 
      (s.address && s.address.toLowerCase().includes(query))
    );
  }, [salons, searchQuery]);

  const radiusOptions = [5, 10, 20, 50];

  return (
    <SafeAreaView className="flex-1 bg-[#131313]">
      <View className="px-6 pt-6 pb-2">
        <Text className="text-4xl font-extrabold text-white tracking-tighter mb-4">
          Search <Text className="text-[#FFBF00]">Salons</Text>
        </Text>
        
        {/* Search Bar */}
        <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex-row items-center mb-6">
          <Ionicons name="search" size={20} color="#9CA3AF" className="mr-2" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or street..."
            placeholderTextColor="#6B7280"
            className="flex-1 text-white text-[15px] ml-2"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="ml-2">
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Radius Filter */}
        <Text className="text-[#FFBF00] font-semibold text-xs uppercase tracking-wider mb-3">Distance Radius</Text>
        <View className="flex-row justify-between mb-4">
          {radiusOptions.map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => setRadius(r)}
              className={\`flex-1 py-3 mx-1 items-center rounded-xl border \${radius === r ? 'bg-[#FFBF00]/10 border-[#FFBF00]' : 'bg-white/5 border-white/10'}\`}
            >
              <Text className={\`font-bold \${radius === r ? 'text-[#FFBF00]' : 'text-gray-400'}\`}>{r}km</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results List */}
      <View className="flex-1 px-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-400 font-medium">{filteredSalons.length} results found</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#FFBF00" className="mt-12" />
        ) : (
          <FlatList
            data={filteredSalons}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <SalonCard salon={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={() => (
              <View className="items-center justify-center mt-16">
                <Ionicons name="search-outline" size={64} color="#374151" />
                <Text className="text-gray-400 font-medium mt-4 text-center">No salons found matching your criteria.</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
