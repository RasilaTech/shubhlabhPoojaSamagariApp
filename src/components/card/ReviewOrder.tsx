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
} from "react-native"; // Add FlatList

// You'll need to create or use a placeholder for AddToCartCounter
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
        {/* AddToCartCounter needs to be converted to RN */}
        <AddToCartCounter productVariant={item.variant} />
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
          <FlatList // Use FlatList for available items
            data={availableItems}
            renderItem={renderAvailableItem}
            keyExtractor={(item) => item.product_variant_id}
            scrollEnabled={false} // Disable FlatList scroll, parent ScrollView handles it
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />} // Add separator between items
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
    flexDirection: "column", // flex flex-col
    gap: 12, // gap-3
  },
  availableItemsCard: {
    // shadow-cart-card conversion
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 4, // mb-1
    flexDirection: "column", // flex w-full flex-col
    gap: 16, // gap-4 (This gap is now handled by FlatList ItemSeparator)
    borderRadius: 8, // rounded-lg
    backgroundColor: "white", // bg-white
    padding: 12, // p-3
  },
  itemSeparator: {
    height: 1,
    backgroundColor: "#e2e8f0", // Light gray separator
    marginVertical: 8, // Adjust spacing of separator
  },
  availableItemRow: {
    flexDirection: "row", // flex
    // cursor-pointer - not applicable
    alignItems: "center", // items-center
    justifyContent: "space-between", // justify-between
    gap: 12, // gap-3
    paddingVertical: 5, // Small vertical padding for items within the row
  },
  availableItemLeftContent: {
    flexDirection: "row", // flex
    minWidth: 0, // min-w-0
    gap: 12, // gap-3
    alignItems: "center",
    flex: 1, // Allow content to take space
  },
  availableProductImage: {
    aspectRatio: 1, // aspect-square
    width: 50, // w-[50px]
    borderRadius: 8, // rounded-lg
    resizeMode: "cover",
  },
  availableProductInfo: {
    flexDirection: "column", // flex flex-col
    flex: 1, // w-full min-w-0 - allows text to wrap
  },
  availableProductName: {
    // line-clamp-2 max-w-fit - handled by numberOfLines
    fontSize: 13, // text-[13px]
    lineHeight: 17, // leading-[17px]
    fontWeight: "500", // font-medium
    letterSpacing: -0.33, // -tracking-[0.33px]
    // break-words text-ellipsis - handled by ellipsizeMode/numberOfLines
    color: "rgba(2, 6, 12, 0.75)", // text-[#02060cbf]
  },
  availableProductLabel: {
    // line-clamp-1 max-w-fit - handled by numberOfLines
    fontSize: 12, // text-[12px]
    lineHeight: 16, // leading-[16px]
    fontWeight: "400", // font-normal
    // text-ellipsis whitespace-nowrap - handled by ellipsizeMode/numberOfLines
    color: "rgba(2, 6, 12, 0.45)", // text-[#02060c73]
  },
  availableItemRightContent: {
    flexDirection: "row", // flex
    alignItems: "center", // items-center
    gap: 8, // gap-2
  },
  availablePriceDetails: {
    flexDirection: "column", // flex flex-col
    // min-w-16 - rely on content width
    alignItems: "flex-end", // items-end
  },
  availableMrpPrice: {
    fontSize: 10, // text-[10px]
    lineHeight: 13, // leading-[13px]
    fontWeight: "600", // font-semibold
    letterSpacing: -0.25, // -tracking-[0.25px]
    color: "rgba(2, 6, 12, 0.45)", // text-[#02060c73]
    textDecorationLine: "line-through",
  },
  availableSalePrice: {
    fontSize: 14, // text-[14px]
    lineHeight: 18, // leading-[18px]
    fontWeight: "400", // font-normal
    letterSpacing: -0.25, // -tracking-[0.25px]
    color: "rgba(2, 6, 12, 0.74)", // text-[#02060cbd]
  },
});

export default ReviewOrder;
