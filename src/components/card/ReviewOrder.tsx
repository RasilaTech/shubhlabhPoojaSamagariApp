// src/components/card/ReviewOrder.tsx
import { useRemoveCartItemMutation } from "@/services/cart/cartAPI"; // Adjust path
import { router } from "expo-router"; // For navigation
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CartItem } from "@/services/cart/cartApi.type";
import AddToCartCounter from "../button/AddToCartCounter";
import CurrentlyUnavailable from "./CurrentlyUnavailable"; // Adjust path

export interface ReviewOrderProps {
  cartData: CartItem[];
}

const ReviewOrder = ({ cartData }: ReviewOrderProps) => {
  const [removeCartItem] = useRemoveCartItemMutation();

  const handleRemoveItem = async (productVariantId: string) => {
    await removeCartItem(productVariantId);
  };

  const soldOutItems = cartData.filter(
    (item: CartItem) => item.variant.out_of_stock
  );
  const availableItems = cartData.filter(
    (item: CartItem) => !item.variant.out_of_stock
  );

  const handleProductPress = (productId: string) => {
    // Assuming product details screen is /products/[id]
    router.push({ pathname: "/product/[id]", params: { id: productId } });
  };

  const renderAvailableItem = ({ item }: { item: CartItem }) => (
    <View key={item.product_variant_id} style={styles.availableItemRow}>
      <TouchableOpacity
        onPress={() => handleProductPress(item.variant.product_id)}
        style={styles.availableItemLeftContent}
      >
        <Image
          source={{ uri: item.variant.images[0] }}
          alt="Product"
          style={styles.availableProductImage}
          resizeMode="cover"
        />
        <View style={styles.availableProductInfo}>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.availableProductName}
          >
            {item.variant.name}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.availableProductLabel}
          >
            {item.variant.name} {/* Assuming variant.name is also the label */}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.availableItemRightContent}>
        <View style={styles.counterWrapper}>
          <View style={styles.counterOverride}>
            <AddToCartCounter productVariant={item.variant} />
          </View>
        </View>
        <View style={styles.availablePriceDetails}>
          <Text style={styles.availableMrpPrice}>
            ₹
            {new Intl.NumberFormat("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(item.quantity * item.variant.mrp)}
          </Text>
          <Text style={styles.availableSalePrice}>
            ₹
            {new Intl.NumberFormat("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(item.quantity * item.variant.price)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {availableItems.length > 0 && (
        <View style={styles.availableItemsCard}>
          <FlatList
            data={availableItems}
            renderItem={renderAvailableItem}
            keyExtractor={(item) => item.product_variant_id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            contentContainerStyle={styles.flatListContentPadding}
          />
        </View>
      )}
      {soldOutItems.length > 0 && (
        <CurrentlyUnavailable
          cartData={soldOutItems}
          handleRemoveItem={handleRemoveItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
  },
  availableItemsCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: "white",
  },
  flatListContentPadding: {
    padding: 12,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 8,
  },
  availableItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 8, // Increased padding for better spacing
    minHeight: 65, // Increased minimum height
  },
  availableItemLeftContent: {
    flexDirection: "row",
    flex: 1, // Take available space
    minWidth: 0, // Allow shrinking
    maxWidth: "60%", // Reduced max width to give more space to right content
    gap: 12,
    alignItems: "center",
  },
  availableProductImage: {
    aspectRatio: 1,
    width: 50,
    borderRadius: 8,
    resizeMode: "cover",
  },
  availableProductInfo: {
    flexDirection: "column",
    flex: 1, // Take remaining space after image
    minWidth: 0, // Essential for text truncation
  },
  availableProductName: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "500",
    letterSpacing: -0.33,
    color: "rgba(2, 6, 12, 0.75)",
  },
  availableProductLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    color: "rgba(2, 6, 12, 0.45)",
  },
  availableItemRightContent: {
    flexDirection: "row", // Counter and price side by side
    alignItems: "center", // Align vertically in center
    justifyContent: "flex-end", // Push to right
    gap: 10, // Reduced gap slightly
    flexShrink: 0, // Don't shrink
    minWidth: 135, // Increased minimum width to accommodate larger counter
  },
  counterWrapper: {
    width: 85, // Fixed width for counter
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  counterOverride: {
    width: 85, // Force the counter to respect this width
    height: 32, // Fixed height to match counter design
  },
  availablePriceDetails: {
    flexDirection: "column",
    alignItems: "flex-end",
    minWidth: 45, // Ensure price section has minimum width
  },
  availableMrpPrice: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600",
    letterSpacing: -0.25,
    color: "rgba(2, 6, 12, 0.45)",
    textDecorationLine: "line-through",
  },
  availableSalePrice: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.25,
    color: "rgba(2, 6, 12, 0.74)",
  },
});

export default ReviewOrder;
