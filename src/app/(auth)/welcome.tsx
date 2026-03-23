import { View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#131313]">
      <StatusBar barStyle="light-content" />
      
      {/* Background Image with Gradient/Overlay */}
      <View className="absolute top-0 left-0 right-0 h-3/4">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop' }} 
          className="w-full h-full opacity-50"
          resizeMode="cover"
        />
        {/* Soft gradient into the solid bottom via overlay */}
        <View className="absolute inset-0 bg-[#131313]/60" />
      </View>

      <SafeAreaView className="flex-1 justify-end pb-8">
        <View className="px-6 pb-6 pt-10 border-t border-white/5 bg-[#131313] rounded-t-[40px] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          <View className="mb-8">
            <Text className="text-5xl font-extrabold text-white mb-2 tracking-tighter">
              Aura<Text className="text-[#FFBF00]">Noir</Text>
            </Text>
            <Text className="text-gray-400 text-lg leading-relaxed font-medium">
              Premium salon experiences, curated exclusively for you. Elevate your style.
            </Text>
          </View>

          <View className="space-y-4">
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/register')}
              className="bg-[#FFBF00] py-4 rounded-2xl items-center shadow-lg active:opacity-80"
              style={{ elevation: 5, shadowColor: '#FFBF00', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
            >
              <Text className="text-[#131313] font-bold text-[17px] tracking-wider">GET STARTED</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(auth)/login')}
              className="bg-transparent py-4 rounded-2xl items-center border border-white/10 active:bg-white/5 mt-4"
            >
              <Text className="text-white font-semibold text-[17px] tracking-wider">LOG IN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
