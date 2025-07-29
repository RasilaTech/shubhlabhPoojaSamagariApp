import { useNavigation } from "@react-navigation/native";
import { CheckCircle, Truck } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { OrderDetail } from "@/services/orders/orderApi.type";
import { router } from "expo-router";

const OrderCard = ({ order }: { order: OrderDetail }) => {
  const navigation = useNavigation();

  const noOfItems = order.order_items.length;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
      case "accepted":
        return { color: "#fbbf24", backgroundColor: "#fffbeb" };
      case "processing":
        return { color: "#2563eb", backgroundColor: "#eff6ff" };
      case "packed":
        return { color: "#4f46e5", backgroundColor: "#eef2ff" };
      case "shipped":
        return { color: "#9333ea", backgroundColor: "#f3e8ff" };
      case "out_for_delivery":
        return { color: "#0ea5e9", backgroundColor: "#f0f9ff" };
      case "delivered":
        return { color: "#15803d", backgroundColor: "#f0fdf4" };
      case "cancelled":
      case "rejected":
        return { color: "#b91c1c", backgroundColor: "#fef2f2" };
      case "returned":
      case "refunded":
        return { color: "#475569", backgroundColor: "#f8fafc" };
      default:
        return {};
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {/* Header Item 1: Ordered On */}
        <View style={styles.headerColumn}>
          <Text style={styles.orderedOnText}>
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
          <Text style={styles.orderIdText}>
            Order ID:
            <Text style={styles.orderIdValue}>{order.order_number + 1000}</Text>
          </Text>
        </View>

        {/* Header Item 3: Status - FIXED HERE */}
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
              <CheckCircle size={16} color="#22c55e" />
              <Text style={styles.deliveryText}>
                {"Delivered on "}
                <Text style={styles.deliveryDate}>
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
              <Truck size={16} color="#3b82f6" />
              <Text style={styles.deliveryText}>
                {"Expected by "}
                <Text style={styles.deliveryDate}>
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
          <Text>
            {noOfItems} item{noOfItems > 1 && "(s)"}
          </Text>
          <Text style={styles.amountText}>
            {order.payment_details.amount.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </Text>
        </View>
        <View style={styles.productImagesAndButton}>
          <View style={styles.productImagesContainer}>
            {order.order_items.slice(0, 4).map((item, index) => (
              <View style={styles.productImageWrapper} key={index}>
                <Image
                  source={{ uri: item.product_variant.images[0] }}
                  style={styles.productImage}
                />
              </View>
            ))}
            {noOfItems > 3 && (
              <View style={styles.moreItemsContainer}>
                <Text style={styles.moreItemsText}>+ {noOfItems - 4}</Text>
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
            style={styles.trackOrderButton}
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
    borderColor: "#E9E9EB",
    backgroundColor: "#fff",
    marginBottom: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E9E9EB",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerColumn: {
    width: "50%",
    paddingRight: 5,
  },
  // NEW STYLE FOR STATUS COLUMN - allows badge to shrink to content
  headerColumnStatus: {
    width: "50%",
    paddingRight: 5,
    alignItems: "flex-start", // Align badge to the left
  },
  headerColumnRight: {
    width: "50%",
    alignItems: "flex-end",
    paddingLeft: 5,
  },
  orderedOnText: {
    fontSize: 14,
    color: "#02060ca6",
  },
  orderIdText: {
    fontSize: 14,
    color: "#02060c73",
  },
  orderIdValue: {
    fontWeight: "600",
  },
  // UPDATED STATUS BADGE - now shrinks to content width
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8, // Increased padding for better appearance
    paddingVertical: 4, // Increased padding for better appearance
    marginTop: 4,
    alignSelf: "flex-start", // This makes the badge shrink to content width
  },
  statusText: {
    fontSize: 12, // Slightly smaller font for better badge proportions
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
    color: "#4b5563",
  },
  deliveryDate: {
    fontWeight: "500",
    color: "#1f2937",
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
    color: "#02060c73",
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
    borderColor: "#d4d4d4",
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
    borderColor: "#d4d4d4",
    padding: 4,
  },
  moreItemsText: {
    width: 36,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#121414",
  },
  trackOrderButton: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#ff5100e2",
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
