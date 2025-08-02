import { CheckCircle, Truck } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { OrderDetail } from "@/services/orders/orderApi.type";
import { router } from "expo-router";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

const OrderCard = ({ order }: { order: OrderDetail }) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const noOfItems = order.order_items.length;

  // FIX: This function now returns theme-aware colors
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
      case "accepted":
        return { color: colors.accent, backgroundColor: colors.background };
      case "processing":
        return { color: "#2563eb", backgroundColor: "#eff6ff" }; // Example of a non-theme-aware color if you want to keep it
      case "packed":
        return { color: "#4f46e5", backgroundColor: "#eef2ff" };
      case "shipped":
        return { color: "#9333ea", backgroundColor: "#f3e8ff" };
      case "out_for_delivery":
        return { color: "#0ea5e9", backgroundColor: "#f0f9ff" };
      case "delivered":
        return { color: colors.success, backgroundColor: colors.background };
      case "cancelled":
      case "rejected":
        return {
          color: colors.destructive,
          backgroundColor: colors.background,
        };
      case "returned":
      case "refunded":
        return {
          color: colors.textSecondary,
          backgroundColor: colors.background,
        };
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {/* Header Item 1: Ordered On */}
        <View style={styles.headerColumn}>
          <Text style={[styles.orderedOnText, { color: colors.textSecondary }]}>
            {`Ordered on ${new Date(order.createdAt).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
              }
            )}`}
          </Text>
        </View>

        {/* Header Item 2: Order ID */}
        <View style={styles.headerColumnRight}>
          <Text style={[styles.orderIdText, { color: colors.textSecondary }]}>
            Order ID:
            <Text style={[styles.orderIdValue, { color: colors.text }]}>
              {order.order_number + 1000}
            </Text>
          </Text>
        </View>

        {/* Header Item 3: Status */}
        <View style={styles.headerColumnStatus}>
          <View style={[styles.statusBadge, getStatusStyles(order.status)]}>
            <Text
              style={[styles.statusText, getStatusStyles(order.status)]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {order.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Header Item 4: Delivery Status */}
        <View style={styles.headerColumnRight}>
          {order.delivered_at && (
            <View style={styles.deliveryInfo}>
              <CheckCircle size={16} color={colors.success} />
              <Text
                style={[styles.deliveryText, { color: colors.textSecondary }]}
              >
                {"Delivered on "}
                <Text style={[styles.deliveryDate, { color: colors.text }]}>
                  {new Date(order.delivered_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </Text>
              </Text>
            </View>
          )}

          {!order.delivered_at && order.expected_delivery_date && (
            <View style={styles.deliveryInfo}>
              <Truck size={16} color={colors.accent} />
              <Text
                style={[styles.deliveryText, { color: colors.textSecondary }]}
              >
                {"Expected by "}
                <Text style={[styles.deliveryDate, { color: colors.text }]}>
                  {new Date(order.expected_delivery_date).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                    }
                  )}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.itemSummary}>
          <Text style={{ color: colors.textSecondary }}>
            {noOfItems} item{noOfItems > 1 && "(s)"}
          </Text>
          <Text style={[styles.amountText, { color: colors.textSecondary }]}>
            {order.payment_details.amount.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </Text>
        </View>
        <View style={styles.productImagesAndButton}>
          <View style={styles.productImagesContainer}>
            {order.order_items.slice(0, 4).map((item, index) => (
              <View
                style={[
                  styles.productImageWrapper,
                  { borderColor: colors.border },
                ]}
                key={index}
              >
                <Image
                  source={{ uri: item.product_variant.images[0] }}
                  style={styles.productImage}
                />
              </View>
            ))}
            {noOfItems > 3 && (
              <View
                style={[
                  styles.moreItemsContainer,
                  { borderColor: colors.border },
                ]}
              >
                <Text style={[styles.moreItemsText, { color: colors.text }]}>
                  + {noOfItems - 4}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/orders/[id]",
                params: { id: order.id },
              });
            }}
            style={[
              styles.trackOrderButton,
              { backgroundColor: colors.accent },
            ]}
          >
            <Text style={styles.trackOrderButtonText}>Track Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerColumn: {
    width: "50%",
    paddingRight: 5,
  },
  headerColumnStatus: {
    width: "50%",
    paddingRight: 5,
    alignItems: "flex-start",
  },
  headerColumnRight: {
    width: "50%",
    alignItems: "flex-end",
    paddingLeft: 5,
  },
  orderedOnText: {
    fontSize: 14,
  },
  orderIdText: {
    fontSize: 14,
  },
  orderIdValue: {
    fontWeight: "600",
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: -0.35,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  deliveryText: {
    fontSize: 14,
  },
  deliveryDate: {
    fontWeight: "500",
  },
  content: {
    flexDirection: "column",
    gap: 8,
    padding: 12,
  },
  itemSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "600",
  },
  productImagesAndButton: {
    flexDirection: "column",
    gap: 16,
  },
  productImagesContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  productImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    borderWidth: 1,
    padding: 4,
  },
  productImage: {
    height: 36,
    width: 36,
    borderRadius: 8,
    resizeMode: "cover",
  },
  moreItemsContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    borderWidth: 1,
    padding: 4,
  },
  moreItemsText: {
    width: 36,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  trackOrderButton: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  trackOrderButtonText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "500",
    letterSpacing: -0.45,
    color: "#ffffffeb",
  },
});

export default OrderCard;
