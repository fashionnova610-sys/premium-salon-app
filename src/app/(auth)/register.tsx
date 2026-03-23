import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Database } from '../../types/supabase';

type Role = Database['public']['Enums']['user_role'];

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister() {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    });

    setLoading(false);

    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else {
      Alert.alert('Success', 'Account created successfully! Please log in.', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') }
      ]);
    }
  }

  // Define role options for the pills
  const roles: { id: Role; label: string; icon: any }[] = [
    { id: 'customer', label: 'Customer', icon: 'person-outline' },
    { id: 'owner', label: 'Salon Owner', icon: 'business-outline' },
    { id: 'job_seeker', label: 'Talent', icon: 'briefcase-outline' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#131313]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-4 left-0 h-10 w-10 bg-white/5 rounded-full items-center justify-center border border-white/10 z-10"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <View className="mb-8 mt-16">
            <Text className="text-4xl font-extrabold text-white tracking-tight mb-2">Create Account</Text>
            <Text className="text-gray-400 text-base font-medium">Join Aura Noir today.</Text>
          </View>

          {/* Role Selection */}
          <View className="mb-6">
            <Text className="text-[#FFBF00] font-semibold mb-3 ml-1 text-sm uppercase tracking-wider">I am a...</Text>
            <View className="flex-row justify-between space-x-2">
              {roles.map((r) => {
                const isSelected = role === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setRole(r.id)}
                    className={`flex-1 flex-col items-center justify-center py-4 rounded-2xl border ${isSelected ? 'bg-[#FFBF00]/10 border-[#FFBF00]' : 'bg-white/5 border-white/10'}`}
                  >
                    <Ionicons name={r.icon} size={24} color={isSelected ? '#FFBF00' : '#9CA3AF'} className="mb-2" />
                    <Text className={`text-sm font-semibold mt-1 ${isSelected ? 'text-[#FFBF00]' : 'text-gray-400'}`}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="space-y-4">
            <View>
              <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#9CA3AF" className="mr-3" />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name (Ex. Jane Doe)"
                  placeholderTextColor="#6B7280"
                  autoCapitalize="words"
                  className="flex-1 text-white text-base ml-3"
                />
              </View>
            </View>

            <View className="mt-4">
              <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex-row items-center">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" className="mr-3" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email Address"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 text-white text-base ml-3"
                />
              </View>
            </View>

            <View className="mt-4">
              <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex-row items-center">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" className="mr-3" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a strong password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-white text-base ml-3"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleRegister}
              disabled={loading}
              className={`bg-[#FFBF00] py-4 rounded-2xl items-center shadow-lg mt-8 ${loading ? 'opacity-70' : 'active:opacity-80'}`}
              style={{ elevation: 5, shadowColor: '#FFBF00', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
            >
              {loading ? (
                <ActivityIndicator color="#131313" />
              ) : (
                <Text className="text-[#131313] font-bold text-[17px] tracking-wider">SIGN UP</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-[#FFBF00] font-bold">Log In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
