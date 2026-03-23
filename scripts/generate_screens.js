const fs = require('fs');
const path = require('path');

const generateFile = (filePath, name) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, `import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ${name}Screen() {
  return (
    <SafeAreaView className="flex-1 bg-[#131313] justify-center items-center">
      <Text className="text-[#FFBF00] text-3xl font-extrabold tracking-tighter mb-2">${name}</Text>
      <Text className="text-gray-400 font-medium">Coming soon</Text>
    </SafeAreaView>
  );
}
`);
}

generateFile('src/app/(customer)/home.tsx', 'CustomerHome');
generateFile('src/app/(customer)/search.tsx', 'CustomerSearch');
generateFile('src/app/(customer)/bookings.tsx', 'CustomerBookings');
generateFile('src/app/(customer)/profile.tsx', 'CustomerProfile');

generateFile('src/app/(owner)/dashboard.tsx', 'OwnerDashboard');
generateFile('src/app/(owner)/salon.tsx', 'OwnerSalon');
generateFile('src/app/(owner)/appointments.tsx', 'OwnerAppointments');
generateFile('src/app/(owner)/portfolio.tsx', 'OwnerPortfolio');
generateFile('src/app/(owner)/settings.tsx', 'OwnerSettings');

console.log('Successfully generated placeholder screens.');
