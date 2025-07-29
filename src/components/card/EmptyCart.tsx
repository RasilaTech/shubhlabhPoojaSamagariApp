// src/components/common/EmptyCart.tsx
import { router } from "expo-router"; // For navigation
import { ChevronLeft } from "lucide-react-native"; // Lucide icon
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const emptyCartImage = require("../../../assets/images/emptyCart.png"); // Adjust path and extension

const EmptyCart: React.FC = () => {
  const handleGoBack = () => {
    router.back();
  };

  const handleBrowseProducts = () => {
    router.push("/"); // Navigate to your home/products Browse screen
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#02060cbf" />
        </TouchableOpacity>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>
          Your Cart
        </Text>
      </View>

      {/* Empty Cart Content */}
      <View style={styles.content}>
        <Image
          source={emptyCartImage}
          alt="Empty Cart"
          style={styles.emptyCartImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyCartTitle}>Your cart is getting lonely</Text>
        <Text style={styles.emptyCartMessage}>
          Fill it up with all things good!
        </Text>
        <TouchableOpacity
          onPress={handleBrowseProducts}
          style={styles.browseButton}
        >
          <Text style={styles.browseButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5", // Ensure a background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12, // py-3
    paddingHorizontal: 8, // px-2
    backgroundColor: "white", // bg-white
    borderBottomWidth: 1, // border-b
    borderBottomColor: "#e0e0e0", // border-e-black (approx, assuming a light border)
    // sticky top-0 z-10 - handled by being outside ScrollView and its container
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    paddingRight: 8, // gap-2
  },
  headerTitle: {
    flex: 1, // line-clamp-1 (text will truncate if flex-1 and numberOfLines)
    fontSize: 18, // text-lg
    lineHeight: 21, // leading-[21px]
    fontWeight: "600", // font-semibold
    letterSpacing: -0.4, // -tracking-[0.4px]
    color: "rgba(2, 6, 12, 0.75)", // text-[#02060cbf]
  },
  content: {
    flex: 1, // flex-1
    flexDirection: "column", // flex-col
    alignItems: "center", // items-center
    justifyContent: "center", // justify-center
    paddingHorizontal: 16, // px-4
    textAlign: "center", // text-center - not directly applicable to View, applies to Text
  },
  emptyCartImage: {
    marginBottom: 24, // mb-6
    width: 128, // w-32
    height: 128, // Add height to aspect-ratio if original image has intrinsic ratio
    // md:w-48 - if you need responsive images, use Dimensions API
    resizeMode: "contain",
  },
  emptyCartTitle: {
    marginBottom: 4, // mb-1
    fontSize: 18, // text-lg
    fontWeight: "600", // font-semibold
    color: "#212121", // text-gray-800
  },
  emptyCartMessage: {
    marginBottom: 24, // mb-6
    fontSize: 14, // text-sm
    color: "#4b5563", // text-gray-600
  },
  browseButton: {
    // Button variant="outline" - custom styling
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
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
    color: "#333",
  },
});

export default EmptyCart;
