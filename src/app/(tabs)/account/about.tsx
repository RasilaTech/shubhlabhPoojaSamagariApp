import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Adjust paths for your theme hooks and constants
import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

// Assuming you have an AboutUsText constant defined
import { AboutUsText } from "@/constants/Constant";

export default function UserAboutScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const handleGoBack = () => {
    router.back();
  };

  // Create a theme-aware style object for RenderHtml
  const renderHtmlBaseStyle = {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    // Add other base text styles here if needed
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: colors.background, // Apply background color from theme
        },
      ]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.cardBackground, shadowColor: colors.text },
        ]}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.headerTitle, { color: colors.text }]}
        >
          About us
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RenderHtml
          contentWidth={width}
          source={{ html: AboutUsText }}
          baseStyle={renderHtmlBaseStyle} // Apply theme-aware style
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  headingText: {
    // This style is not used in the JSX, but kept for reference
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
