// src/components/card/PaymentSummaryCard.tsx
import { OrderDetailMainCardProps } from "@/services/orders/orderApi.type";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const PaymentSummaryCard = ({ orderDetails }: OrderDetailMainCardProps) => {
  const subTotal = orderDetails.order_items.reduce((acc, cv) => {
    return acc + cv.mrp * cv.quantity;
  }, 0);
  const totalPrice = orderDetails.order_items.reduce((acc, cv) => {
    return acc + cv.price * cv.quantity;
  }, 0);

  const discount = subTotal - totalPrice;

  let couponDiscount = orderDetails.order_coupons.reduce((acc, cv) => {
    return acc + cv.discount_amount;
  }, 0);

  // Ensure couponDiscount doesn't exceed the total price after item discounts
  couponDiscount = Math.min(totalPrice, couponDiscount);

  // Helper for formatting currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Payment Details</Text>
        {orderDetails.payment_details.method && (
          <Text style={styles.methodText}>
            Method:
            <Text style={styles.methodValue}>
              {orderDetails.payment_details.method.charAt(0).toUpperCase() +
                orderDetails.payment_details.method.slice(1)}
            </Text>
          </Text>
        )}
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Item Total</Text>
          <Text style={styles.summaryValue}>₹{formatCurrency(subTotal)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <Text style={[styles.summaryValue, styles.discountValue]}>
            - ₹{formatCurrency(discount)}
          </Text>
        </View>

        {couponDiscount > 0 && (
          <>
            <View style={styles.dashedSeparator} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Promo Code Discount</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                - ₹{formatCurrency(couponDiscount)}
              </Text>
            </View>
          </>
        )}
        <View style={styles.dashedSeparator} />

        {orderDetails.order_charges.map(({ name, amount }, idx) => (
          <View key={idx} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{name}</Text>
            {amount === 0 ? (
              <Text style={[styles.summaryValue, styles.freeValue]}>FREE</Text>
            ) : (
              <Text style={styles.summaryValue}>₹{formatCurrency(amount)}</Text>
            )}
          </View>
        ))}

        <View style={styles.dashedSeparator} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ₹{formatCurrency(orderDetails.payment_details.amount)}
          </Text>
        </View>
        {/* The commented out div for "Trusted, authentic..." is excluded as it's not converted */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    paddingBottom: 16, // pb-4
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
  methodText: {
    fontSize: 16,
    color: "#02060c73",
  },
  methodValue: {
    fontWeight: "500",
    color: "#000",
  },
  detailsContainer: {
    flexDirection: "column",
    width: "100%",
    gap: 8, // gap-2
    backgroundColor: "#fff",
    paddingHorizontal: 16, // px-4
    paddingTop: 12, // pt-3
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 14,
    lineHeight: 18, // leading-4.5
    fontWeight: "300", // font-extralight
    letterSpacing: -0.35,
    color: "#02060c99", // text-[#02060c99]
  },
  summaryValue: {
    fontSize: 14,
    lineHeight: 18, // leading-4.5
    fontWeight: "400", // font-normal
    letterSpacing: -0.35,
    color: "#02060cbf", // text-[#02060cbf]
    flexShrink: 1, // Allow text to shrink if long
    textAlign: "right", // Ensure text aligns right
  },
  discountValue: {
    color: "#1ba672", // text-[#1ba672]
  },
  freeValue: {
    color: "#1ba672", // text-[#1ba672]
    fontWeight: "500", // font-normal
  },
  dashedSeparator: {
    marginVertical: 8, // my-2
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#02060c26", // border-[#02060c26]
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: -0.35,
    color: "#02060ceb",
  },
  totalValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: -0.35,
    color: "#02060ceb",
  },
});

export default PaymentSummaryCard;
