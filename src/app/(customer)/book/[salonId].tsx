import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { addDays, format, parse, addMinutes, isSameDay } from 'date-fns';

import { useSalonServices } from '../../../hooks/use-salon-services';
import { useSalonEmployees } from '../../../hooks/use-salon-employees';
import { useBookingSlots } from '../../../hooks/use-booking-slots';
import { useCreateAppointment } from '../../../hooks/use-appointment-mutations';
import { TimeSlotPicker } from '../../../components/TimeSlotPicker';

export default function BookingScreen() {
  const { salonId } = useLocalSearchParams<{ salonId: string }>();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { data: services, isLoading: loadingServices } = useSalonServices(salonId);
  const { data: employees, isLoading: loadingEmployees } = useSalonEmployees(salonId);
  const { data: slots, isLoading: loadingSlots } = useBookingSlots(salonId, selectedEmployee?.id || null, selectedDate);
  
  const createAppointment = useCreateAppointment();

  // Next 14 days calendar strip
  const dates = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));
  }, []);

  const handleBook = () => {
    if (!selectedService || !selectedTime) return;
    
    const start = parse(selectedTime, 'HH:mm', selectedDate);
    const end = addMinutes(start, selectedService.duration);
    
    createAppointment.mutate({
      salonId,
      serviceId: selectedService.id,
      employeeId: selectedEmployee?.id || null,
      appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
      startTime: format(start, 'HH:mm:ss'),
      endTime: format(end, 'HH:mm:ss'),
    }, {
      onSuccess: () => {
        Alert.alert("Appointment Confirmed!", "Your booking was successfully secured.", [
          { text: "Awesome", onPress: () => router.replace('/(customer)/bookings') }
        ]);
      }
    });
  };

  const renderStepIndicator = () => (
    <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5 bg-[#131313] z-10">
      <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} className="p-2 -ml-2">
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text className="text-white font-bold text-lg tracking-wide">
        {step === 1 ? 'Select Service' : step === 2 ? 'Select Professional' : step === 3 ? 'Choose Time' : 'Confirm'}
      </Text>
      <View className="flex-row space-x-1">
        {[1, 2, 3, 4].map(i => (
          <View key={i} className={\`h-2 w-2 rounded-full \${step >= i ? 'bg-[#FFBF00]' : 'bg-white/20'}\`} />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#131313]">
      {renderStepIndicator()}
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* STEP 1: SERVICE */}
        {step === 1 && (
          <View className="p-6">
            <Text className="text-2xl font-extrabold text-white mb-6">What would you like to do?</Text>
            {loadingServices ? <ActivityIndicator size="large" color="#FFBF00" /> : services?.map((service: any) => (
              <TouchableOpacity
                key={service.id}
                onPress={() => setSelectedService(service)}
                className={\`p-4 rounded-2xl mb-4 border \${selectedService?.id === service.id ? 'border-[#FFBF00] bg-[#FFBF00]/10' : 'border-white/10 bg-white/5'}\`}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-white font-bold text-lg">{service.name}</Text>
                  <Text className="text-[#FFBF00] font-bold">{service.price} XAF</Text>
                </View>
                <Text className="text-gray-400 text-sm">{service.duration} mins • {service.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 2: EMPLOYEE */}
        {step === 2 && (
          <View className="p-6">
            <Text className="text-2xl font-extrabold text-white mb-2">Who do you prefer?</Text>
            <Text className="text-gray-400 mb-6">You can select a specific professional or skip.</Text>
            
            <TouchableOpacity
              onPress={() => setSelectedEmployee(null)}
              className={\`p-4 rounded-2xl mb-4 border flex-row items-center \${!selectedEmployee ? 'border-[#FFBF00] bg-[#FFBF00]/10' : 'border-white/10 bg-white/5'}\`}
            >
              <View className="h-12 w-12 rounded-full bg-white/10 items-center justify-center mr-4">
                <Ionicons name="people" size={24} color="white" />
              </View>
              <Text className="text-white font-bold text-lg">Anyone Available</Text>
            </TouchableOpacity>

            {loadingEmployees ? <ActivityIndicator size="large" color="#FFBF00" /> : employees?.map((emp: any) => (
              <TouchableOpacity
                key={emp.id}
                onPress={() => setSelectedEmployee(emp)}
                className={\`p-4 rounded-2xl mb-4 border flex-row items-center \${selectedEmployee?.id === emp.id ? 'border-[#FFBF00] bg-[#FFBF00]/10' : 'border-white/10 bg-white/5'}\`}
              >
                {emp.profiles?.avatar_url ? (
                  <Image source={{ uri: emp.profiles.avatar_url }} className="h-12 w-12 rounded-full mr-4 bg-white/10" />
                ) : (
                  <View className="h-12 w-12 rounded-full bg-white/10 items-center justify-center mr-4">
                    <Text className="text-white font-bold">{emp.profiles?.full_name?.charAt(0) || 'P'}</Text>
                  </View>
                )}
                <Text className="text-white font-bold text-lg">{emp.profiles?.full_name || 'Professional'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 3: DATE & TIME */}
        {step === 3 && (
          <View className="pt-6">
            <Text className="text-2xl font-extrabold text-white px-6 mb-6">When works best?</Text>
            
            {/* Horizontal Calendar Strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }} className="mb-6">
              {dates.map((d, i) => {
                const isSelected = isSameDay(d, selectedDate);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { setSelectedDate(d); setSelectedTime(null); }}
                    className={\`h-20 w-16 rounded-2xl items-center justify-center mr-3 border \${isSelected ? 'bg-[#FFBF00] border-[#FFBF00]' : 'bg-white/5 border-white/10'}\`}
                  >
                    <Text className={\`text-xs font-medium uppercase mb-1 \${isSelected ? 'text-[#131313]' : 'text-gray-400'}\`}>
                      {format(d, 'EEE')}
                    </Text>
                    <Text className={\`text-xl font-bold \${isSelected ? 'text-[#131313]' : 'text-white'}\`}>
                      {format(d, 'd')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="border-t border-white/5 pt-6 bg-black/20 pb-8">
              <Text className="text-gray-400 font-semibold px-6 mb-2">AVAILABLE SLOTS</Text>
              {loadingSlots ? (
                <ActivityIndicator color="#FFBF00" className="mt-8" />
              ) : (
                <TimeSlotPicker 
                  slots={slots || []} 
                  selectedTime={selectedTime} 
                  onSelectTime={setSelectedTime} 
                />
              )}
            </View>
          </View>
        )}

        {/* STEP 4: CONFIRMATION */}
        {step === 4 && (
          <View className="p-6">
            <View className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden mb-6">
              <View className="absolute top-0 right-0 p-4 opacity-5">
                <Ionicons name="calendar" size={120} color="white" />
              </View>
              
              <Text className="text-[#FFBF00] font-bold tracking-widest text-xs mb-6 uppercase">Booking Summary</Text>
              
              <View className="mb-4">
                <Text className="text-gray-400 text-sm mb-1">Service</Text>
                <Text className="text-white text-xl font-bold">{selectedService?.name}</Text>
                <Text className="text-white/60">{selectedService?.price} XAF • {selectedService?.duration} mins</Text>
              </View>

              <View className="mb-4">
                <Text className="text-gray-400 text-sm mb-1">Professional</Text>
                <Text className="text-white text-lg">{selectedEmployee ? selectedEmployee.profiles?.full_name : 'Anyone Available'}</Text>
              </View>

              <View>
                <Text className="text-gray-400 text-sm mb-1">Date & Time</Text>
                <Text className="text-white text-lg font-bold">
                  {format(selectedDate, 'EEEE, MMMM do')}
                </Text>
                <Text className="text-[#FFBF00] text-lg font-bold mt-1">
                  At {selectedTime}
                </Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* FIXED BOTTOM ACTION BAR */}
      <View className="absolute bottom-0 w-full p-6 bg-[#131313] border-t border-white/10 pt-4">
        <TouchableOpacity 
          disabled={
            (step === 1 && !selectedService) || 
            (step === 3 && !selectedTime) ||
            createAppointment.isPending
          }
          onPress={() => step < 4 ? setStep(step + 1) : handleBook()}
          className={\`py-4 rounded-xl items-center \${
            ((step === 1 && !selectedService) || (step === 3 && !selectedTime)) 
              ? 'bg-white/10' 
              : 'bg-[#FFBF00]'
          }\`}
        >
          {createAppointment.isPending ? (
             <ActivityIndicator color="#131313" />
          ) : (
             <Text className={\`font-extrabold text-lg \${((step === 1 && !selectedService) || (step === 3 && !selectedTime)) ? 'text-gray-500' : 'text-[#131313]'}\`}>
               {step === 4 ? 'Confirm Booking' : 'Continue'}
             </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
