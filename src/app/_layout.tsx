import { useCheckAuthOnLaunch } from "@/hooks/useCheckAuthOnLaunch";
import { useGetInitialLocation } from "@/hooks/useGetInitialLocation";
import { useGetAppConfigurationsQuery } from "@/services/configuration/configurationApi";
import { store } from "@/store/store";
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { ThemeProvider, useTheme } from "../hooks/useTheme"; // <--- Import new ThemeProvider and useTheme

SplashScreen.preventAutoHideAsync();

// This component now handles all app-level logic and renders the main UI
function AppWrapper() {
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
  useCheckAuthOnLaunch();

  const { isLoading: isAppConfigLoading, isError: isAppConfigError } =
    useGetAppConfigurationsQuery();

  const { theme, isReady: isThemeReady } = useTheme(); // Get theme state from our hook

  useEffect(() => {
    const hideSplash = async () => {
      // Hide splash screen when fonts, configs, and theme are ready
      if (fontsLoaded && !isAppConfigLoading && isThemeReady) {
        await SplashScreen.hideAsync();
      }
    };
    hideSplash();
  }, [fontsLoaded, isAppConfigLoading, isThemeReady]);

  if (!fontsLoaded || isAppConfigLoading || !isThemeReady) {
    return null; // Don't render anything until ready
  }

  if (isAppConfigError) {
    console.error("Failed to load app configurations:", isAppConfigError);
  }

  // Use the theme from our hook to set the Navigation ThemeProvider
  const navigationTheme =
    theme === "dark"
      ? { ...NavDarkTheme, colors: { ...NavDarkTheme.colors, text: "#fff" } }
      : {
          ...NavDefaultTheme,
          colors: { ...NavDefaultTheme.colors, text: "#000" },
        };

  return (
    <NavThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="products" options={{ headerShown: false }} />
        <Stack.Screen name="address" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppWrapper />
      </ThemeProvider>
    </Provider>
  );
}
