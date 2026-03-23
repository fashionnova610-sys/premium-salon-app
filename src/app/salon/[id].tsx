import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSalon } from '../../hooks/use-salon';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SalonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: salon, isLoading } = useSalon(id);
  const [activeTab, setActiveTab] = useState<'info' | 'portfolio' | 'reviews'>('info');

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#131313] justify-center items-center">
        <ActivityIndicator size="large" color="#FFBF00" />
      </View>
    );
  }

  if (!salon) {
    return (
      <View className="flex-1 bg-[#131313] justify-center items-center">
        <Text className="text-white">Salon not found.</Text>
      </View>
    );
  }

  const openWhatsApp = () => {
    // Attempt to grab salon phone or fallback to owner's phone
    const phone = salon.phone || (salon.profiles as any)?.phone;
    if (phone) {
      Linking.openURL(\`whatsapp://send?phone=\${phone}\`).catch(() => {
        alert('Make sure WhatsApp is installed on your device');
      });
    } else {
      alert('No phone number provided for this salon');
    }
  };

  return (
    <View className="flex-1 bg-[#131313]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View className="w-full h-72 relative">
          <Image 
            source={{ uri: salon.cover_image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop' }} 
            className="w-full h-full opacity-80"
          />
          <View className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
          
          <SafeAreaView className="absolute top-0 left-0 right-0 px-4 pt-2 flex-row justify-between">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity className="w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md">
              <Ionicons name="heart-outline" size={24} color="white" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Header Info */}
        <View className="px-6 -mt-6">
          <Text className="text-4xl font-extrabold text-white tracking-tighter mb-2">{salon.name}</Text>
          <View className="flex-row items-center mb-3">
            <Ionicons name="location" size={16} color="#9CA3AF" />
            <Text className="text-gray-400 ml-1 font-medium">{salon.address}</Text>
          </View>
          
          <View className="flex-row space-x-3 mb-6">
            <View className="bg-[#FFBF00]/10 px-3 py-1.5 rounded-lg flex-row items-center border border-[#FFBF00]/20">
              <Ionicons name="star" size={16} color="#FFBF00" />
              <Text className="text-[#FFBF00] font-bold ml-1">{salon.rating?.toFixed(1) || 'NEW'}</Text>
            </View>
            <TouchableOpacity 
              onPress={openWhatsApp}
              className="bg-[#25D366]/10 px-3 py-1.5 rounded-lg flex-row items-center border border-[#25D366]/20"
            >
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
              <Text className="text-[#25D366] font-bold ml-1">Message</Text>
            </TouchableOpacity>
          </View>

          {/* Custom Tabs */}
          <View className="flex-row border-b border-white/10 mb-6">
            {(['info', 'portfolio', 'reviews'] as const).map((tab) => (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={\`pb-3 px-4 \${activeTab === tab ? 'border-b-2 border-[#FFBF00]' : ''}\`}
              >
                <Text className={\`font-bold capitalize tracking-wide \${activeTab === tab ? 'text-[#FFBF00]' : 'text-gray-500'}\`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <View className="pb-32">
              <Text className="text-white font-bold text-xl mb-3">About</Text>
              <Text className="text-gray-400 leading-relaxed mb-8">
                {salon.description || 'Welcome to our premium salon. We offer top-tier services tailored to elevate your personal style.'}
              </Text>
              
              <Text className="text-white font-bold text-xl mb-3">Working Hours</Text>
              <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <Text className="text-gray-400">Loading hours...</Text>
                {/* We can fetch and populate working_hours table here later */}
              </View>
            </View>
          )}

          {activeTab === 'portfolio' && (
            <View className="pb-32 items-center mt-8">
              <Ionicons name="images-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4">Portfolio coming soon</Text>
            </View>
          )}

          {activeTab === 'reviews' && (
            <View className="pb-32 items-center mt-8">
              <Ionicons name="star-half-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4">Reviews coming soon</Text>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#131313]/90 pt-4 pb-8 px-6 border-t border-white/10">
        <TouchableOpacity 
          className="bg-[#FFBF00] py-4 rounded-2xl items-center shadow-lg"
        >
          <Text className="text-[#131313] font-bold text-[17px] tracking-wider">BOOK APPOINTMENT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
