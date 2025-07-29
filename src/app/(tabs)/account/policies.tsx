// app/(tabs)/account/profile.tsx
import { PoliciesText } from "@/constants/Constant";
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

export default function UserPoliciesScreen() {
  // Default export
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const handleGoBack = () => {
    router.back();
  };
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#02060cbf" />
        </TouchableOpacity>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>
          Policies
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RenderHtml
          contentWidth={width}
          source={{ html: PoliciesText }} // Fix: Wrap string in object with html property
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
    backgroundColor: "#fff",
  },
  headingText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a202c",
    marginTop: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    shadowColor: "#000", // shadow-cart-card (approx)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4, // Android shadow
  },
  backButton: {
    paddingRight: 10, // gap-2 from original
  },
  headerTitle: {
    flex: 1, // Allow title to take remaining space
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: "#02060cbf",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32, // Extra bottom padding
  },
});
