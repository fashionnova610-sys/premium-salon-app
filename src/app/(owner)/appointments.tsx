import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OwnerAppointmentsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#131313] justify-center items-center">
      <Text className="text-[#FFBF00] text-3xl font-extrabold tracking-tighter mb-2">OwnerAppointments</Text>
      <Text className="text-gray-400 font-medium">Coming soon</Text>
    </SafeAreaView>
  );
}
