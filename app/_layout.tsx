import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/colors";
import { Image, StyleSheet, View, Text, Platform } from "react-native";
import { LOGO_URL } from "@/constants/logo";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { useAuthStore } from "@/store/authStore";

// Fix for debugging overlay registry error
if (Platform.OS !== 'web') {
  // Safely handle potential debugging registry issues
  const ReactNative = require('react-native');
  if (ReactNative.DevSettings) {
    // Ensure DevSettings is properly initialized
    try {
      ReactNative.DevSettings.reload = ReactNative.DevSettings.reload || (() => console.log('Reload not available'));
    } catch (e) {
      console.warn('Failed to setup DevSettings:', e);
    }
  }
}

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "auth/welcome",
};

// Create a client
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: colors.card,
            height: Platform.OS === 'ios' ? 64 : 56,
          },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
            color: colors.text,
            fontSize: Platform.OS === 'ios' ? 18 : 16,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerTitle: ({ children }) => {
            // Only show logo with title for authenticated users
            if (!isAuthenticated) {
              return (
                <Text style={[styles.headerText, { color: colors.text }]}>
                  {children || 'SimplePro'}
                </Text>
              );
            }

            return (
              <View style={styles.headerTitleContainer}>
                <Image source={{ uri: LOGO_URL }} style={styles.logo} />
                {children ? (
                  <>
                    <View style={[styles.titleSeparator, { backgroundColor: colors.gray[300] }]} />
                    <Text style={[styles.headerText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                      {children}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.headerText, { color: colors.text }]}>SimplePro</Text>
                )}
              </View>
            );
          },
        }}
      >
        {/* Authentication screens */}
        <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: "Sign In" }} />
        <Stack.Screen name="auth/register" options={{ title: "Create Account" }} />
        <Stack.Screen name="auth/verify-email" options={{ title: "Verify Email" }} />
        <Stack.Screen name="auth/reset-password" options={{ title: "Reset Password" }} />
        
        {/* Onboarding screens */}
        <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/business-setup" options={{ title: "Business Setup" }} />
        <Stack.Screen name="onboarding/first-customer" options={{ title: "Add Your First Customer" }} />
        <Stack.Screen name="onboarding/first-quote" options={{ title: "Create Your First Quote" }} />
        <Stack.Screen name="onboarding/complete" options={{ headerShown: false }} />
        
        {/* Main app screens - only show if authenticated */}
        {isAuthenticated && user?.emailVerified && (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="jobs/[id]" options={{ title: "Job Details" }} />
            <Stack.Screen name="quotes/[id]" options={{ title: "Quote Details" }} />
            <Stack.Screen name="customers/[id]" options={{ title: "Customer Details" }} />
            <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
            <Stack.Screen name="settings" options={{ title: "Settings" }} />
            <Stack.Screen name="help" options={{ title: "Help & Support" }} />
            <Stack.Screen name="profile/billing" options={{ title: "Billing & Subscription" }} />
            <Stack.Screen name="profile/payment-methods" options={{ title: "Payment Methods" }} />
            <Stack.Screen name="profile/payment-methods/add" options={{ title: "Add Payment Method" }} />
            <Stack.Screen name="profile/billing/history" options={{ title: "Billing History" }} />
            <Stack.Screen name="profile/billing/upgrade" options={{ title: "Upgrade Plan" }} />
          </>
        )}
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '80%',
  },
  headerText: {
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  logo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  titleSeparator: {
    width: 1,
    height: 16,
    marginHorizontal: 8,
  },
});