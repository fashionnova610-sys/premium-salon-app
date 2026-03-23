import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Check your inbox', 'We have sent you a password reset link.');
      router.back();
    }
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
          <Text className="text-4xl font-extrabold text-white tracking-tight mb-2">Reset Password</Text>
          <Text className="text-gray-400 text-base font-medium">Enter your email to receive a reset link.</Text>
        </View>

        <View className="space-y-6">
          <View>
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

          <TouchableOpacity 
            onPress={handleReset}
            disabled={loading}
            className={`bg-[#FFBF00] py-4 rounded-2xl items-center shadow-lg mt-8 ${loading ? 'opacity-70' : 'active:opacity-80'}`}
            style={{ elevation: 5, shadowColor: '#FFBF00', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
          >
            {loading ? (
              <ActivityIndicator color="#131313" />
            ) : (
              <Text className="text-[#131313] font-bold text-[17px] tracking-wider">SEND LINK</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
