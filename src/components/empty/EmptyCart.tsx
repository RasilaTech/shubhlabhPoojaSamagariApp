import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

const emptyCartImage = require("../../../assets/images/emptyCart.png");

const EmptyCart: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const handleGoBack = () => {
    router.back();
  };

  const handleBrowseProducts = () => {
    router.push("/");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.cardBackground,
            borderBottomColor: colors.border,
          },
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
          Your Cart
        </Text>
      </View>

      <View style={styles.content}>
        <Image
          source={emptyCartImage}
          alt="Empty Cart"
          style={styles.emptyCartImage}
          resizeMode="contain"
        />
        <Text style={[styles.emptyCartTitle, { color: colors.text }]}>
          Your cart is getting lonely
        </Text>
        <Text
          style={[styles.emptyCartMessage, { color: colors.textSecondary }]}
        >
          Fill it up with all things good!
        </Text>
        <TouchableOpacity
          onPress={handleBrowseProducts}
          style={[
            styles.browseButton,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.browseButtonText, { color: colors.text }]}>
            Browse Products
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    paddingRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  content: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  emptyCartImage: {
    marginBottom: 24,
    width: 128,
    height: 128,
    resizeMode: "contain",
  },
  emptyCartTitle: {
    marginBottom: 4,
    fontSize: 18,
    fontWeight: "600",
  },
  emptyCartMessage: {
    marginBottom: 24,
    fontSize: 14,
  },
  browseButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
export default EmptyCart;
