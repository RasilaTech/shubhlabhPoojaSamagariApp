import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

const SoldOutBadge: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.border, backgroundColor: colors.cardBackground },
      ]}
    >
      <Text style={[styles.text, { color: colors.destructive }]}>Sold Out</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: "auto",
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: -0.35,
    textAlign: "center",
  },
});

export default SoldOutBadge;
