import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router"; // For navigation
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const AddMoreItems: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const handleAddMoreItems = () => {
    console.log("Add more items clicked");
    router.replace("/");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
    >
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {"Missed Something? "}
        <Text
          onPress={handleAddMoreItems}
          style={[styles.linkText, { color: colors.accent }]}
        >
          Add more items
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 8,
    padding: 16,
  },
  text: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
    letterSpacing: -0.33,
  },
  linkText: {
    fontWeight: "600", // Ensure link text is bold
    // cursor-pointer - not applicable in RN
  },
});

export default AddMoreItems;
