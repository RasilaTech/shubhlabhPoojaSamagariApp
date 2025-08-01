import { useGetInitialLocation } from "@/hooks/useGetInitialLocation";
import { useGetAppConfigurationsQuery } from "@/services/configuration/configurationApi";
import { store } from "@/store/store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { useColorScheme } from "../hooks/useColorScheme.web";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// This new component will contain all the app-level hooks
function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    outfit: require("../../assets/fonts/Outfit-Regular.ttf"),
    "outfit-bold": require("../../assets/fonts/Outfit-Bold.ttf"),
    "outfit-medium": require("../../assets/fonts/Outfit-Medium.ttf"),
    "outfit-semibold": require("../../assets/fonts/Outfit-SemiBold.ttf"),
    "outfit-light": require("../../assets/fonts/Outfit-Light.ttf"),
    "outfit-extra-light": require("../../assets/fonts/Outfit-ExtraLight.ttf"),
    "outfit-black": require("../../assets/fonts/Outfit-Black.ttf"),
    "outfit-extra-bold": require("../../assets/fonts/Outfit-ExtraBold.ttf"),
    "outfit-thin": require("../../assets/fonts/Outfit-Thin.ttf"),
  });

  useGetInitialLocation();

  const { isLoading: isAppConfigLoading, isError: isAppConfigError } =
    useGetAppConfigurationsQuery();

  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded && !isAppConfigLoading) {
        await SplashScreen.hideAsync();
      }
    };
    hideSplash();
  }, [fontsLoaded, isAppConfigLoading]);

  // Wait for all initial loading to complete
  if (!fontsLoaded || isAppConfigLoading) {
    return null;
  }

  if (isAppConfigError) {
    // You can show a global error screen here
    console.error("Failed to load app configurations:", isAppConfigError);
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product" options={{ headerShown: false }} />
        <Stack.Screen name="address" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutContent />
    </Provider>
  );
}
