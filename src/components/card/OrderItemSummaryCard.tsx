// src/components/card/OrderItemSummaryCard.tsx
import { OrderDetailMainCardProps } from "@/services/orders/orderApi.type";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const OrderItemSummaryCard = ({ orderDetails }: OrderDetailMainCardProps) => {
  const totalItemsCount = orderDetails.order_items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Shipment Details</Text>
        <Text style={styles.headerText}>Total Items: {totalItemsCount}</Text>
      </View>
      <View style={styles.itemsContainer}>
        {orderDetails.order_items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.itemRow,
              index < orderDetails.order_items.length - 1 &&
                styles.itemSeparator, // Add separator for all but the last item
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
                <Text style={styles.itemName}>{item.product_variant.name}</Text>
                <Text style={styles.itemDisplayLabel}>
                  {item.product_variant.display_label}
                </Text>
              </View>
            </View>

            <View style={styles.itemRightContent}>
              <View style={styles.itemPriceRow}>
                <Text style={styles.itemMrpPrice}>
                  ₹{(item.quantity * item.mrp).toLocaleString("en-IN")}
                </Text>
                <Text style={styles.itemSalePrice}>
                  ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                </Text>
              </View>
              <Text style={styles.itemQuantityText}>
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
    backgroundColor: "#fff",
    overflow: "hidden", // Ensures content respects rounded corners
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E9E9EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 16,
    color: "#02060c73",
  },
  itemsContainer: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 12, // Apply to actual container if not using separate border
    borderBottomRightRadius: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8, // py-2
    backgroundColor: "#fff",
    // No hover effect in RN
  },
  itemSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0", // slate-200
  },
  itemLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16, // gap-4
    flex: 1, // Allow text content to take space
  },
  itemImage: {
    height: 48, // h-12
    width: 48, // w-12
    flexShrink: 0,
    borderRadius: 6, // rounded-md
    resizeMode: "cover",
  },
  itemTextContent: {
    flexDirection: "column",
    flexShrink: 1, // Allow text to wrap if long
  },
  itemName: {
    fontWeight: "600",
    color: "#1e293b", // slate-800
  },
  itemDisplayLabel: {
    fontSize: 14,
    color: "#64748b", // slate-500
  },
  itemRightContent: {
    flexDirection: "column",
    alignItems: "flex-end", // text-right
  },
  itemPriceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8, // gap-2
  },
  itemMrpPrice: {
    fontSize: 12,
    color: "#475569", // slate-600
    textDecorationLine: "line-through",
  },
  itemSalePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a", // slate-900
  },
  itemQuantityText: {
    fontSize: 12,
    color: "#64748b", // slate-500
  },
});

export default OrderItemSummaryCard;
