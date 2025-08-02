import { useDownloadInvoiceMutation } from "@/services/orders/orderApi";
import { BadgeCheck, BadgeX, Download, LifeBuoy } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { OrderDetailMainCardProps } from "@/services/orders/orderApi.type";
import CancelOrderDialog from "../dialog/CancelOrderDialog";
import NeedHelpInfoDialog from "../dialog/NeedHelpInfoDialog";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

export const OrderDetailMainCard = ({
  orderDetails,
}: OrderDetailMainCardProps) => {
  const firstItemName = orderDetails.order_items[0].product_variant.name;
  const noOfItems = orderDetails.order_items.length;
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [needHelpDialogVisible, setNeedHelpDialogVisible] = useState(false);

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

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
    // FIX: Get colors from the theme
    switch (status) {
      case "pending":
      case "accepted":
        return { color: colors.accent, backgroundColor: "#fffbeb" };
      case "processing":
        return { color: "#2563eb", backgroundColor: "#eff6ff" };
      case "packed":
        return { color: "#4f46e5", backgroundColor: "#eef2ff" };
      case "shipped":
        return { color: "#9333ea", backgroundColor: "#f3e8ff" };
      case "out_for_delivery":
        return { color: "#0ea5e9", backgroundColor: "#f0f9ff" };
      case "delivered":
        return { color: colors.success, backgroundColor: "#f0fdf4" };
      case "cancelled":
      case "rejected":
        return { color: colors.destructive, backgroundColor: "#fef2f2" };
      case "returned":
      case "refunded":
        return { color: colors.textSecondary, backgroundColor: "#f8fafc" };
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
      await downloadInvoice(orderDetails.id).unwrap();
      Alert.alert("Success", "Invoice download initiated.");
    } catch (error) {
      console.error("Failed to download invoice:", error);
      Alert.alert("Error", "Failed to download invoice.");
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.orderIdText, { color: colors.textSecondary }]}>
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

      <View
        style={[
          styles.summarySection,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.cardBackground,
          },
        ]}
      >
        <View style={styles.productImagesAndInfo}>
          <View style={styles.productImageStack}>
            {orderDetails.order_items.slice(0, 3).map((item, index) => (
              <Image
                key={index}
                source={{ uri: item.product_variant.images[0] }}
                alt={item.product_variant.name}
                style={[
                  styles.productImage,
                  { zIndex: 3 - index, borderColor: colors.cardBackground },
                ]}
                resizeMode="cover"
              />
            ))}
            {noOfItems > 3 && (
              <View
                style={[
                  styles.moreItemsBadge,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.cardBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.moreItemsText,
                    { color: colors.textSecondary },
                  ]}
                >
                  +{noOfItems - 3}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.productTextInfo}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.firstItemName, { color: colors.text }]}
            >
              {firstItemName}
            </Text>
            <Text
              style={[styles.numberOfItems, { color: colors.textSecondary }]}
            >
              {noOfItems} {noOfItems > 1 ? "items" : "item"}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.totalPrice, { color: colors.text }]}>
            ₹{orderDetails.payment_details.amount.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      <View
        style={[styles.historySection, { borderBottomColor: colors.border }]}
      >
        <View style={styles.timeline}>
          {orderDetails.order_histories.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyDateTime}>
                <Text style={[styles.historyDate, { color: colors.text }]}>
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                  })}
                </Text>
                <Text
                  style={[styles.historyTime, { color: colors.textSecondary }]}
                >
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
                  <BadgeCheck size={20} color="white" fill={colors.success} />
                ) : (
                  <BadgeX size={20} color="white" fill={colors.destructive} />
                )}

                {index < orderDetails.order_histories.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      { backgroundColor: colors.success },
                    ]}
                  ></View>
                )}
              </View>
              <View style={styles.historyStatusTextContainer}>
                <Text
                  style={[styles.historyStatusText, { color: colors.text }]}
                >
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
            style={[
              styles.actionButton,
              styles.invoiceButton,
              {
                borderColor: "#2563eb",
                backgroundColor: colors.cardBackground,
              },
            ]}
          >
            <Download size={16} color={colors.text} />
            <Text style={[styles.invoiceButtonText, { color: colors.text }]}>
              Invoice
            </Text>
          </TouchableOpacity>
        )}

        {orderDetails.status === "pending" && (
          <TouchableOpacity
            onPress={() => setCancelDialogVisible(true)}
            style={[
              styles.actionButton,
              styles.cancelButton,
              {
                borderColor: colors.destructive,
                backgroundColor: colors.cardBackground,
              },
            ]}
          >
            <BadgeX size={16} color={colors.destructive} />
            <Text
              style={[styles.cancelButtonText, { color: colors.destructive }]}
            >
              Cancel Order
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setNeedHelpDialogVisible(true)}
          style={[
            styles.actionButton,
            styles.needHelpButton,
            { backgroundColor: colors.success },
          ]}
        >
          <LifeBuoy size={16} color="white" />
          <Text style={styles.needHelpButtonText}>Need Help?</Text>
        </TouchableOpacity>
      </View>

      {cancelDialogVisible && (
        <CancelOrderDialog
          orderId={orderDetails.id}
          handleCloseCancelDialog={handleCloseCancelDialog}
        />
      )}
      <NeedHelpInfoDialog
        isVisible={needHelpDialogVisible}
        onClose={() => setNeedHelpDialogVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
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
  orderIdText: {
    fontSize: 16,
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
    padding: 16,
  },
  productImagesAndInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexShrink: 1,
  },
  productImageStack: {
    flexDirection: "row",
    marginLeft: 11 * 2,
  },
  productImage: {
    height: 44,
    width: 44,
    borderRadius: 22,
    resizeMode: "cover",
    borderWidth: 1,
  },
  moreItemsBadge: {
    height: 44,
    width: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -11,
    borderWidth: 1,
  },
  moreItemsText: {
    fontSize: 14,
    fontWeight: "600",
  },
  productTextInfo: {
    flexDirection: "column",
    flexShrink: 1,
  },
  firstItemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  numberOfItems: {
    fontSize: 14,
    fontWeight: "500",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
  },

  historySection: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  timeline: {
    flexDirection: "column",
    gap: 20,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  historyDateTime: {
    alignItems: "flex-end",
    minWidth: 50,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "600",
  },
  historyTime: {
    fontSize: 12,
  },
  historyIconContainer: {
    position: "relative",
    flexDirection: "column",
    alignItems: "center",
    width: 20,
  },
  connectorLine: {
    position: "absolute",
    top: 20,
    bottom: -20,
    width: 2,
    zIndex: -1,
  },
  historyStatusTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  historyStatusText: {
    fontWeight: "500",
  },

  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    flex: 1,
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
    borderWidth: 1,
  },
  invoiceButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
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
