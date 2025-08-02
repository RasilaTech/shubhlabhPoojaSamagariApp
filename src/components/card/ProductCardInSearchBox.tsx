import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import type { Product } from "@/services/product/productApi.type";

interface ProductCardInSearchBoxProps {
  product: Product;
  onPress?: () => void;
}

const ProductCardInSearchBox = ({
  product,
  onPress,
}: ProductCardInSearchBoxProps) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const defaultVariantIndex = Math.max(
    0,
    product.product_variants.findIndex((variant) => variant.default_variant)
  );
  const defaultProductVariant = product.product_variants[defaultVariantIndex];

  const handlePress = () => {
    if (onPress) {
      onPress();
    }

    router.push({
      pathname: "/product/[id]",
      params: { id: product.id },
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: defaultProductVariant.images[0] }}
        alt="Product"
        style={[styles.image, { backgroundColor: colors.background }]}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: colors.text }]} numberOfLines={1}>
          {defaultProductVariant.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCardInSearchBox;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 6,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 8,
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontFamily: "outfit-medium",
  },
});
