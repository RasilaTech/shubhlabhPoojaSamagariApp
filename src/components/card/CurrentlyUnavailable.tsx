// src/components/card/CurrentlyUnavailable.tsx
import { CartItem } from "@/services/cart/cartApi.type";
import { router } from "expo-router"; // For navigation
import { Trash2 } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface CurrentlyUnavailableProps {
  cartData: CartItem[];
  handleRemoveItem: (productVariantId: string) => void;
}

const CurrentlyUnavailable = ({
  cartData,
  handleRemoveItem,
}: CurrentlyUnavailableProps) => {
  const handleProductPress = (productId: string) => {
    router.push({ pathname: "/product/[id]", params: { id: productId } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Currently unavailable</Text>
        <View style={styles.separator}></View>
      </View>
      <View style={styles.itemsList}>
        {cartData.map((item: CartItem) => (
          <View key={item.product_variant_id} style={styles.itemRow}>
            <TouchableOpacity
              onPress={() => handleProductPress(item.variant.product_id)}
              style={styles.itemLeftContent}
            >
              <Image
                source={{ uri: item.variant.images[0] }}
                alt="Product"
                style={styles.productImage}
                resizeMode="contain"
              />
              <View style={styles.productInfo}>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={styles.productName}
                >
                  {item.variant.name}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.productLabel}
                >
                  {item.variant.name}{" "}
                  {/* Assuming variant.name is also the label */}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.itemRightContent}>
              <Text style={styles.soldOutBadge}>Sold out</Text>
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.product_variant_id)}
              >
                <Trash2 size={16} color="rgba(2, 6, 12, 0.45)" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // shadow-cart-card conversion
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 4, // mb-1
    flexDirection: "column", // flex w-full flex-col
    gap: 12, // gap-3
    borderRadius: 8, // rounded-lg
    backgroundColor: "white", // bg-white
    padding: 12, // p-3
  },
  header: {
    flexDirection: "column", // flex flex-col
    gap: 12, // gap-3
  },
  headerText: {
    fontSize: 16, // text-[16px]
    lineHeight: 21, // leading-[21px]
    fontWeight: "600", // font-semibold
    letterSpacing: -0.4, // tracking-[-0.4px]
    color: "#FA3C5A", // text-[#FA3C5A]
  },
  separator: {
    borderBottomWidth: 1, // border-b
    borderBottomColor: "rgba(2, 6, 12, 0.15)", // border-dashed border-[#02060c26]
    borderStyle: "dashed",
    width: "100%", // w-full
  },
  itemsList: {
    flexDirection: "column", // flex flex-col
    gap: 16, // gap-4
  },
  itemRow: {
    flexDirection: "row", // flex
    alignItems: "center", // items-center
    justifyContent: "space-between", // justify-between
    gap: 12, // gap-3
  },
  itemLeftContent: {
    flexDirection: "row", // flex
    gap: 12, // gap-3
    // min-w-0 - flex behavior handles this
    alignItems: "center", // Align image and text vertically
    flex: 1, // Allow this section to take space
  },
  productImage: {
    aspectRatio: 1, // aspect-square
    width: 50, // w-[50px]
    borderRadius: 8, // rounded-lg
    opacity: 0.7, // opacity-70
    resizeMode: "contain",
  },
  productInfo: {
    flexDirection: "column",
    // w-full min-w-20 - flex behavior handles this
    flex: 1, // Allow text to take remaining space
  },
  productName: {
    // line-clamp-2 - handled by numberOfLines
    fontSize: 13, // text-[13px]
    lineHeight: 17, // leading-[17px]
    fontWeight: "500", // font-medium
    letterSpacing: -0.33, // -tracking-[0.33px]
    color: "rgba(2, 6, 12, 0.75)", // text-[#02060cbf]
    opacity: 0.7, // opacity-70
    // break-words text-ellipsis - handled by ellipsizeMode/numberOfLines
  },
  productLabel: {
    // line-clamp-1 - handled by numberOfLines
    fontSize: 12, // text-[12px]
    lineHeight: 16, // leading-[16px]
    fontWeight: "400", // font-normal
    // whitespace-nowrap - handled by flexShrink/ellipsizeMode for parents
    color: "rgba(2, 6, 12, 0.45)", // text-[#02060c73]
    opacity: 0.7, // opacity-70
  },
  itemRightContent: {
    flexDirection: "row", // flex
    alignItems: "center", // items-center
    gap: 8, // gap-2
    // flex-col items-end - for Trash2, handled below
  },
  soldOutBadge: {
    // border-[#02060c26 ] - adjusted to a hex code
    borderColor: "rgba(2, 6, 12, 0.15)",
    borderWidth: 1,
    // shadow-sold-out-button - not directly converted, rely on default shadow
    borderRadius: 8, // rounded-[8px]
    paddingHorizontal: 10, // px-2.5
    paddingVertical: 6, // py-1.5
    fontSize: 12, // text-[12px]
    lineHeight: 16, // leading-[16px]
    letterSpacing: -0.3, // tracking-[-0.3px]
    color: "rgba(2, 6, 12, 0.45)", // text-[#02060c73]
  },
});

export default CurrentlyUnavailable;
