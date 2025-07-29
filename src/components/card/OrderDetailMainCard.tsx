// src/components/card/OrderDetailMainCard.tsx
import { BadgeCheck, BadgeX, Download, LifeBuoy } from "lucide-react-native"; // Assuming lucide-react-native
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Adjust paths for RTK Query hook and types
import { useDownloadInvoiceMutation } from "@/services/orders/orderApi";

// Import your custom dialog components
import { OrderDetailMainCardProps } from "@/services/orders/orderApi.type";
import CancelOrderDialog from "../dialog/CancelOrderDialog";
import NeedHelpInfoDialog from "../dialog/NeedHelpInfoDialog";

const OrderDetailMainCard = ({ orderDetails }: OrderDetailMainCardProps) => {
  const firstItemName = orderDetails.order_items[0].product_variant.name;
  const noOfItems = orderDetails.order_items.length;
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false); // State for custom dialog visibility
  const [needHelpDialogVisible, setNeedHelpDialogVisible] = useState(false);

  const statusTextMap: { [key: string]: string } = {
    pending: "Order Placed",
    accepted: "Order Accepted",
    processing: "Processing",
    packed: "Packed",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    rejected: "Rejected by Seller",
    returned: "Returned",
    refunded: "Refunded",
  };

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

  const [downloadInvoice] = useDownloadInvoiceMutation();

  const handleCloseCancelDialog = () => {
    setCancelDialogVisible(false);
  };

  const handleDownloadInvoice = async () => {
    try {
      await downloadInvoice(orderDetails.id).unwrap(); // Use unwrap() to handle promise result
      Alert.alert("Success", "Invoice download initiated.");
      // In a real app, you'd handle the file download or opening here
    } catch (error) {
      console.error("Failed to download invoice:", error);
      Alert.alert("Error", "Failed to download invoice.");
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.orderIdText}>
          Order ID: {orderDetails.order_number + 1000}
        </Text>
        <View
          style={[styles.statusBadge, getStatusStyles(orderDetails.status)]}
        >
          <Text
            style={[styles.statusText, getStatusStyles(orderDetails.status)]}
          >
            {orderDetails.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.summarySection}>
        <View style={styles.productImagesAndInfo}>
          <View style={styles.productImageStack}>
            {orderDetails.order_items.slice(0, 3).map((item, index) => (
              <Image
                key={index}
                source={{ uri: item.product_variant.images[0] }}
                alt={item.product_variant.name}
                style={[styles.productImage, { zIndex: 3 - index }]}
                resizeMode="cover"
              />
            ))}
            {noOfItems > 3 && (
              <View style={styles.moreItemsBadge}>
                <Text style={styles.moreItemsText}>+{noOfItems - 3}</Text>
              </View>
            )}
          </View>
          <View style={styles.productTextInfo}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.firstItemName}
            >
              {firstItemName}
            </Text>
            <Text style={styles.numberOfItems}>
              {noOfItems} {noOfItems > 1 ? "items" : "item"}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.totalPrice}>
            ₹{orderDetails.payment_details.amount.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      <View style={styles.historySection}>
        <View style={styles.timeline}>
          {orderDetails.order_histories.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyDateTime}>
                <Text style={styles.historyDate}>
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                  })}
                </Text>
                <Text style={styles.historyTime}>
                  {new Date(item.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </Text>
              </View>

              <View style={styles.historyIconContainer}>
                {[
                  "pending",
                  "accepted",
                  "processing",
                  "packed",
                  "shipped",
                  "out_for_delivery",
                  "delivered",
                ].includes(item.status) ? (
                  <BadgeCheck size={20} color="white" fill="green" />
                ) : (
                  <BadgeX size={20} color="white" fill="red" />
                )}

                {/* Vertical line connector */}
                {index < orderDetails.order_histories.length - 1 && (
                  <View style={styles.connectorLine}></View>
                )}
              </View>
              <View style={styles.historyStatusTextContainer}>
                <Text style={styles.historyStatusText}>
                  {statusTextMap[item.status]}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actionButtonsContainer}>
        {orderDetails.status === "delivered" && (
          <TouchableOpacity
            onPress={handleDownloadInvoice}
            style={[styles.actionButton, styles.invoiceButton]}
          >
            <Download size={16} color="#2563eb" />
            <Text style={styles.invoiceButtonText}>Invoice</Text>
          </TouchableOpacity>
        )}

        {orderDetails.status === "pending" && (
          <TouchableOpacity
            onPress={() => setCancelDialogVisible(true)}
            style={[styles.actionButton, styles.cancelButton]}
          >
            <BadgeX size={16} color="#dc2626" />
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        {/* This triggers the Alert for Need Help */}
        <TouchableOpacity
          onPress={() => setNeedHelpDialogVisible(true)}
          style={[styles.actionButton, styles.needHelpButton]}
        >
          <LifeBuoy size={16} color="#fff" />
          <Text style={styles.needHelpButtonText}>Need Help?</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional rendering for custom dialogs */}
      {cancelDialogVisible && (
        <CancelOrderDialog
          orderId={orderDetails.id}
          handleCloseCancelDialog={handleCloseCancelDialog}
        />
      )}
      {needHelpDialogVisible && (
        <NeedHelpInfoDialog
          isVisible={needHelpDialogVisible}
          onClose={() => {
            setNeedHelpDialogVisible(false);
          }}
        /> // No props needed for this example, or pass dismiss handler
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden", // Ensures content stays within rounded corners
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
  orderIdText: {
    fontSize: 16,
    color: "#02060c73",
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.35,
  },

  summarySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9E9EB",
    backgroundColor: "#fff",
    padding: 16,
  },
  productImagesAndInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexShrink: 1, // Allow this section to shrink
  },
  productImageStack: {
    flexDirection: "row",
    // To create overlapping effect, use negative margin or absolute positioning
    // Negative margin is simpler for a fixed number of items
    marginLeft: 11 * 2, // Compensate for negative margin of first item
  },
  productImage: {
    height: 44,
    width: 44,
    borderRadius: 22, // Half of height/width for full circle
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#fff", // White border for separation
    marginLeft: -11, // Negative margin for overlap
  },
  moreItemsBadge: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: "#f1f5f9", // slate-100
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -11, // Overlap
    borderWidth: 1,
    borderColor: "#fff",
  },
  moreItemsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569", // slate-600
  },
  productTextInfo: {
    flexDirection: "column",
    flexShrink: 1,
  },
  firstItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b", // slate-800
  },
  numberOfItems: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b", // slate-500
  },
  priceContainer: {
    alignItems: "flex-end", // Align price to the right
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a", // slate-900
  },

  historySection: {
    borderBottomWidth: 1,
    borderBottomColor: "#E9E9EB",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  timeline: {
    flexDirection: "column",
    gap: 20, // Space between history items
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start", // Align items to the top if text wraps
    gap: 16, // Space between time, icon, and status text
  },
  historyDateTime: {
    alignItems: "flex-end", // Align time to the right
    minWidth: 50, // Ensure enough space for time/date
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151", // gray-800
  },
  historyTime: {
    fontSize: 12,
    color: "#6b7280", // gray-500
  },
  historyIconContainer: {
    position: "relative",
    flexDirection: "column",
    alignItems: "center",
    width: 20, // Match icon size
  },
  connectorLine: {
    position: "absolute",
    top: 20, // Below the icon
    bottom: -20, // Extend downwards, adjust based on gap
    width: 2,
    backgroundColor: "green", // green-700
    zIndex: -1, // Behind the icon
  },
  historyStatusTextContainer: {
    flex: 1, // Take remaining space
    paddingTop: 2, // Align with text after icon
  },
  historyStatusText: {
    fontWeight: "500",
    color: "#374151", // gray-800
  },

  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    flex: 1, // Distribute space evenly
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  invoiceButton: {
    borderColor: "#2563eb", // blue-600
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  invoiceButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#2563eb", // blue-700
  },
  cancelButton: {
    borderColor: "#dc2626", // red-600
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#dc2626", // red-700
  },
  needHelpButton: {
    backgroundColor: "#1aa672",
  },
  needHelpButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
});

export default OrderDetailMainCard;
