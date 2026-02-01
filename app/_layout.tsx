
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "auth/role-selection",
};

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboardingGroup = segments[0] === 'onboarding';

    console.log('Navigation check - User:', user?.email, 'Onboarding:', user?.onboardingComplete, 'Segments:', segments);

    if (!user) {
      // User not authenticated - redirect to auth
      if (!inAuthGroup) {
        console.log('Redirecting to role selection - no user');
        router.replace('/auth/role-selection');
      }
    } else if (!user.onboardingComplete) {
      // User authenticated but onboarding not complete
      if (!inOnboardingGroup) {
        console.log('Redirecting to onboarding - user not onboarded');
        if (user.role === 'client') {
          router.replace('/onboarding/client-name');
        } else {
          router.replace('/onboarding/provider-name');
        }
      }
    } else {
      // User authenticated and onboarded - redirect to appropriate dashboard
      if (inAuthGroup || inOnboardingGroup) {
        console.log('Redirecting to dashboard - user authenticated and onboarded');
        if (user.role === 'client') {
          router.replace('/(tabs)/(home)/');
        } else {
          router.replace('/(provider-tabs)/dashboard');
        }
      }
    }
  }, [user, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/role-selection" />
      <Stack.Screen name="auth/sign-in" />
      <Stack.Screen name="auth/otp-verification" />
      <Stack.Screen name="onboarding/client-name" />
      <Stack.Screen name="onboarding/client-preferences" />
      <Stack.Screen name="onboarding/provider-name" />
      <Stack.Screen name="onboarding/provider-address" />
      <Stack.Screen name="onboarding/provider-categories" />
      <Stack.Screen name="onboarding/provider-verification" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(provider-tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      console.warn("🔌 You are offline - changes will be saved locally");
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!loaded) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(0, 122, 255)",
      background: "rgb(242, 242, 247)",
      card: "rgb(255, 255, 255)",
      text: "rgb(0, 0, 0)",
      border: "rgb(216, 216, 220)",
      notification: "rgb(255, 59, 48)",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(10, 132, 255)",
      background: "rgb(1, 1, 1)",
      card: "rgb(28, 28, 30)",
      text: "rgb(255, 255, 255)",
      border: "rgb(44, 44, 46)",
      notification: "rgb(255, 69, 58)",
    },
  };

  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
      >
        <AuthProvider>
          <WidgetProvider>
            <GestureHandlerRootView>
              <RootLayoutNav />
              <SystemBars style={"auto"} />
            </GestureHandlerRootView>
          </WidgetProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
