import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import type { OrderDetailMainCardProps } from "@/services/orders/orderApi.type";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export const OrderItemSummaryCard = ({ orderDetails }: OrderDetailMainCardProps) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const totalItemsCount = orderDetails.order_items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>
          Shipment Details
        </Text>
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>
          Total Items: {totalItemsCount}
        </Text>
      </View>
      <View style={styles.itemsContainer}>
        {orderDetails.order_items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.itemRow,
              index < orderDetails.order_items.length - 1 && [
                styles.itemSeparator,
                { borderBottomColor: colors.border },
              ],
            ]}
          >
            <View style={styles.itemLeftContent}>
              <Image
                source={{ uri: item.product_variant.images[0] }}
                alt={item.product_variant.name}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemTextContent}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.product_variant.name}
                </Text>
                <Text
                  style={[
                    styles.itemDisplayLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.product_variant.display_label}
                </Text>
              </View>
            </View>

            <View style={styles.itemRightContent}>
              <View style={styles.itemPriceRow}>
                <Text
                  style={[styles.itemMrpPrice, { color: colors.textSecondary }]}
                >
                  ₹{(item.quantity * item.mrp).toLocaleString("en-IN")}
                </Text>
                <Text style={[styles.itemSalePrice, { color: colors.text }]}>
                  ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                </Text>
              </View>
              <Text
                style={[
                  styles.itemQuantityText,
                  { color: colors.textSecondary },
                ]}
              >
                qty: {item.quantity} x ₹{item.price.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 16,
  },
  itemsContainer: {
    flexDirection: "column",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemSeparator: {
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  itemLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  itemImage: {
    height: 48,
    width: 48,
    flexShrink: 0,
    borderRadius: 6,
    resizeMode: "cover",
  },
  itemTextContent: {
    flexDirection: "column",
    flexShrink: 1,
  },
  itemName: {
    fontWeight: "600",
  },
  itemDisplayLabel: {
    fontSize: 14,
  },
  itemRightContent: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  itemPriceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  itemMrpPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  itemSalePrice: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemQuantityText: {
    fontSize: 12,
  },
});
