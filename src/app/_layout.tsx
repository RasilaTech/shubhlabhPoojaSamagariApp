import { useGetInitialLocation } from "@/hooks/useGetInitialLocation";
import { store } from "@/store/store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { useColorScheme } from "../hooks/useColorScheme.web";

function LocationInitializer() {
  useGetInitialLocation(); // Call the hook here
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
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

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Provider store={store}>
      <LocationInitializer />
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product" options={{ headerShown: false }} />
          <Stack.Screen name="address" options={{ headerShown: false }} />

          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}
