import { Product } from "@/services/product/productApi.type";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddToCartCounter from "../button/AddToCartCounter";
import SoldOutBadge from "../button/SoldButton";
import TriggerProductVariantBottomSheet from "../button/TriggerProductVariantBottomSheet";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

interface ProductItemProps {
  product: Product;
}

const ProductItem2 = ({ product }: ProductItemProps) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const defaultVariantIndex = Math.max(
    0,
    product.product_variants.findIndex((variant) => variant.default_variant)
  );
  const defaultProductVariant = product.product_variants[defaultVariantIndex];

  if (!defaultProductVariant) {
    console.warn(
      `ProductItem: No default variant found for product ID ${product.id}`
    );
    return null;
  }

  const discountPercentage = Math.round(
    ((defaultProductVariant.mrp - defaultProductVariant.price) /
      defaultProductVariant.mrp) *
      100
  );
  const isOutOfStock =
    product.product_variants.length === 1
      ? product.product_variants[0].out_of_stock
      : product.product_variants.every((variant) => variant.out_of_stock);

  const handlePressProduct = () => {
    router.push({
      pathname: "/product/[id]",
      params: { id: product.id },
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePressProduct}
      style={[
        styles.container,
        isOutOfStock && { opacity: 0.5 },
        { backgroundColor: colors.cardBackground, shadowColor: colors.text },
      ]}
    >
      <View style={[styles.imageContainer, { borderColor: colors.border }]}>
        {discountPercentage > 0 && (
          <ImageBackground
            style={styles.imageOverlay}
            imageStyle={styles.imageOverlay_image}
            source={require("../../../assets/images/offer_tag.png")}
            resizeMode="stretch"
          >
            <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
          </ImageBackground>
        )}
        <Image
          source={{ uri: defaultProductVariant.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.detailsContainer}>
        <Text
          style={[styles.productName, { color: colors.text }]}
          numberOfLines={2}
        >
          {defaultProductVariant.name}
        </Text>
        <View>
          <Text
            style={[styles.productLabel, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {defaultProductVariant.display_label}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.productPrice, { color: colors.text }]}>
              {defaultProductVariant.price.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </Text>
            {discountPercentage > 0 && (
              <Text
                style={[styles.productMrp, { color: colors.textSecondary }]}
              >
                {defaultProductVariant.mrp.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}
              </Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.counterOverride}>
        {isOutOfStock ? (
          <SoldOutBadge />
        ) : product.product_variants.length > 1 ? (
          <TriggerProductVariantBottomSheet product={product} />
        ) : (
          <AddToCartCounter productVariant={defaultProductVariant} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProductItem2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
    marginBottom: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
    elevation: 8,
    position: "relative",
    minHeight: 200,
  },
  imageContainer: {
    position: "relative",
    borderWidth: 1,
    borderRadius: 12,
    width: "100%",
  },
  imageOverlay: {
    position: "absolute",
    zIndex: 1,
    top: 0,
    left: 0,
    width: 30,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  counterOverride: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
    height: 32,
  },
  imageOverlay_image: {
    width: 30,
    height: 32,
    borderTopLeftRadius: 12,
  },
  image: {
    borderRadius: 12,
    width: "100%",
    aspectRatio: 1 / 1,
  },
  discountText: {
    color: "white",
    fontSize: 10,
    letterSpacing: -0.25,
    textAlign: "center",
    fontFamily: "outfit-semibold",
  },
  detailsContainer: {
    flex: 1,
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 38,
  },
  productName: {
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: -0.35,
    fontFamily: "outfit-semibold",
    flexWrap: "wrap",
  },
  productLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.3,
    fontFamily: "outfit-regular",
  },
  priceContainer: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 2,
  },
  productPrice: {
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: -0.35,
    fontFamily: "outfit-semibold",
  },
  productMrp: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.3,
    fontFamily: "outfit-extra-light",
    textDecorationLine: "line-through",
  },
});
