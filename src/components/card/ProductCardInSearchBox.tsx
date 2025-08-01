import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Product } from "@/services/product/productApi.type";
import { router } from "expo-router";

interface ProductCardInSearchBoxProps {
  product: Product;
}

const ProductCardInSearchBox = ({ product }: ProductCardInSearchBoxProps) => {
  const defaultVariantIndex = Math.max(
    0,
    product.product_variants.findIndex((variant) => variant.default_variant)
  );
  const defaultProductVariant = product.product_variants[defaultVariantIndex];

  const handlePress = () => {
    router.push({
      pathname: "/product/[id]",
      params: { id: product.id },
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image
        source={{ uri: defaultProductVariant.images[0] }}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.text} numberOfLines={1}>
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
    backgroundColor: "#F3F4F6",
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontFamily: "outfit-medium",
    color: "#1F2937",
  },
});
