import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } 
    // If successful, onAuthStateChange in AuthProvider will trigger redirection
  }

  return (
    <SafeAreaView className="flex-1 bg-[#131313]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-12 left-6 h-10 w-10 bg-white/5 rounded-full items-center justify-center border border-white/10 z-10"
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>

        <View className="mb-10 mt-16">
          <Text className="text-4xl font-extrabold text-white tracking-tight mb-2">Welcome Back</Text>
          <Text className="text-gray-400 text-base font-medium">Log in to continue your journey.</Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-[#FFBF00] font-semibold mb-2 ml-1 text-sm uppercase tracking-wider">Email</Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex-row items-center">
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" className="mr-3" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Ex. you@domain.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-white text-base ml-3"
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-[#FFBF00] font-semibold mb-2 ml-1 text-sm uppercase tracking-wider">Password</Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex-row items-center">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" className="mr-3" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                className="flex-1 text-white text-base ml-3"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity className="self-end mt-2">
            <Text className="text-gray-400 font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            className={`bg-[#FFBF00] py-4 rounded-2xl items-center shadow-lg mt-8 ${loading ? 'opacity-70' : 'active:opacity-80'}`}
            style={{ elevation: 5, shadowColor: '#FFBF00', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
          >
            {loading ? (
              <ActivityIndicator color="#131313" />
            ) : (
              <Text className="text-[#131313] font-bold text-[17px] tracking-wider">LOG IN</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-12">
          <Text className="text-gray-400">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-[#FFBF00] font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
