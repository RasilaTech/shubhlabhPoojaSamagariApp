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
import CurrentlyUnavailable from "./CurrentlyUnavailable"; // Adjust path

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import AddToCartCounter from "../button/AddToCartCounter";

export interface ReviewOrderProps {
  cartData: CartItem[];
}

const ReviewOrder = ({ cartData }: ReviewOrderProps) => {
  const [removeCartItem] = useRemoveCartItemMutation();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

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
            style={[styles.availableProductName, { color: colors.text }]}
          >
            {item.variant.name}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.availableProductLabel,
              { color: colors.textSecondary },
            ]}
          >
            {item.variant.name}
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
          <Text
            style={[styles.availableMrpPrice, { color: colors.textSecondary }]}
          >
            ₹
            {new Intl.NumberFormat("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(item.quantity * item.variant.mrp)}
          </Text>
          <Text style={[styles.availableSalePrice, { color: colors.text }]}>
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
        <View
          style={[
            styles.availableItemsCard,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <FlatList
            data={availableItems}
            renderItem={renderAvailableItem}
            keyExtractor={(item) => item.product_variant_id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View
                style={[
                  styles.itemSeparator,
                  { backgroundColor: colors.border },
                ]}
              />
            )}
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
  },
  flatListContentPadding: {
    padding: 12,
  },
  itemSeparator: {
    height: 1,
    marginVertical: 8,
  },
  availableItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 8,
    minHeight: 65,
  },
  availableItemLeftContent: {
    flexDirection: "row",
    flex: 1,
    minWidth: 0,
    maxWidth: "60%",
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
    flex: 1,
    minWidth: 0,
  },
  availableProductName: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "500",
    letterSpacing: -0.33,
  },
  availableProductLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: -0.2,
  },
  availableItemRightContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    flexShrink: 0,
    flexGrow: 0,
    minWidth: 135,
  },
  counterWrapper: {
    width: 85,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  counterOverride: {
    width: 85,
    height: 32,
  },
  availablePriceDetails: {
    flexDirection: "column",
    alignItems: "flex-end",
    minWidth: 45,
  },
  availableMrpPrice: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600",
    letterSpacing: -0.25,
    textDecorationLine: "line-through",
  },
  availableSalePrice: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.25,
  },
});

export default ReviewOrder