import { useNavigation } from "@react-navigation/native";
import { CheckCircle, Truck } from "lucide-react-native"; // Assuming lucide-react-native for icons
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Define the OrderDetail type based on your provided structure
import type { OrderDetail } from "@/services/orders/orderApi.type"; // Adjust this path if needed

const OrderCard = ({ order }: { order: OrderDetail }) => {
  const navigation = useNavigation();

  const noOfItems = order.order_items.length;

  // Helper function to get actual style objects from statusColors
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
      case "accepted":
        return { color: "#fbbf24", backgroundColor: "#fffbeb" }; // amber-600, amber-100
      case "processing":
        return { color: "#2563eb", backgroundColor: "#eff6ff" }; // blue-600, blue-100
      case "packed":
        return { color: "#4f46e5", backgroundColor: "#eef2ff" }; // indigo-600, indigo-100
      case "shipped":
        return { color: "#9333ea", backgroundColor: "#f3e8ff" }; // purple-600, purple-100
      case "out_for_delivery":
        return { color: "#0ea5e9", backgroundColor: "#f0f9ff" }; // sky-600, sky-100
      case "delivered":
        return { color: "#15803d", backgroundColor: "#f0fdf4" }; // green-700, green-100
      case "cancelled":
      case "rejected":
        return { color: "#b91c1c", backgroundColor: "#fef2f2" }; // red-700, red-100
      case "returned":
      case "refunded":
        return { color: "#475569", backgroundColor: "#f8fafc" }; // slate-600, slate-100
      default:
        return {};
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerItem}>
          <Text style={styles.orderedOnText}>
            Ordered on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })}
          </Text>
        </View>
        <View style={styles.headerItemRight}>
          <Text style={styles.orderIdText}>
            Order ID:{" "}
            <Text style={styles.orderIdValue}>{order.order_number + 1000}</Text>
          </Text>
        </View>
        <View
          style={[
            styles.headerItem,
            styles.statusContainer,
            getStatusStyles(order.status),
          ]}
        >
          <Text style={[styles.statusText, getStatusStyles(order.status)]}>
            {order.status.toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerItemRight}>
          {order.delivered_at && (
            <View style={styles.deliveryInfo}>
              <CheckCircle size={16} color="#22c55e" />
              <Text style={styles.deliveryText}>
                Delivered on{" "}
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
                Expected by{" "}
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
              // Assuming you have a route named 'OrderDetails' for individual order tracking
             // navigation.navigate("OrderDetails", { orderId: order.id });
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
    borderColor: "#E9E9EB", // Approximation for border
    backgroundColor: "#fff",
    marginBottom: 10, // Added for spacing between cards
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
  headerItem: {
    width: "50%",
    // For smaller screens, width: 'auto' on sm:
  },
  headerItemRight: {
    width: "50%",
    alignItems: "flex-end",
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
  statusContainer: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 1,
    marginTop: 4,
    alignSelf: "flex-start", // Important for w-fit behavior
  },
  statusText: {
    fontSize: 14,
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
    color: "#4b5563", // gray-600
  },
  deliveryDate: {
    fontWeight: "500",
    color: "#1f2937", // gray-800
  },
  content: {
    flexDirection: "column",
    gap: 8,
    padding: 12,
  },
  itemSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    objectFit: "cover", // In React Native, this is 'cover', 'contain', 'stretch', 'repeat', 'center'
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
