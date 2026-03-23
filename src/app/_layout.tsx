import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../providers/auth-provider';
import { QueryProvider } from '../providers/query-provider';
import '../global.css'; // NativeWind v4 requires this

// Prevent the splash screen from auto-hiding before auth resolves
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { session, profile, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session) {
      // If the user is not signed in and they aren't in the auth flow already.
      if (!inAuthGroup) {
        // Redirect to the welcome screen
        router.replace('/(auth)/welcome');
      }
    } else if (session && profile) {
      // If the user is signed in, redirect them based on role
      // But only if they are trying to access the auth group or root app load
      if (inAuthGroup || segments.length === 0) {
        if (profile.role === 'owner') {
          router.replace('/(owner)/dashboard');
        } else {
          // Both customers and job_seekers use the main customer flow initially
          router.replace('/(customer)/home');
        }
      }
    }
  }, [session, profile, isLoading, segments]);

  useEffect(() => {
    if (!isLoading) {
      // Auth state has resolved, hide the splash screen
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </QueryProvider>
  );
}
