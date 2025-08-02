import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { OrderDetailMainCardProps } from "@/services/orders/orderApi.type";

const PaymentSummaryCard = ({ orderDetails }: OrderDetailMainCardProps) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

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

  couponDiscount = Math.min(totalPrice, couponDiscount);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>
          Payment Details
        </Text>
        {orderDetails.payment_details.method && (
          <Text style={[styles.methodText, { color: colors.textSecondary }]}>
            Method:
            <Text style={[styles.methodValue, { color: colors.text }]}>
              {orderDetails.payment_details.method.charAt(0).toUpperCase() +
                orderDetails.payment_details.method.slice(1)}
            </Text>
          </Text>
        )}
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Item Total
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ₹{formatCurrency(subTotal)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Discount
          </Text>
          <Text
            style={[
              styles.summaryValue,
              styles.discountValue,
              { color: colors.success },
            ]}
          >
            - ₹{formatCurrency(discount)}
          </Text>
        </View>

        {couponDiscount > 0 && (
          <>
            <View
              style={[styles.dashedSeparator, { borderColor: colors.border }]}
            />
            <View style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Promo Code Discount
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  styles.discountValue,
                  { color: colors.success },
                ]}
              >
                - ₹{formatCurrency(couponDiscount)}
              </Text>
            </View>
          </>
        )}
        <View
          style={[styles.dashedSeparator, { borderColor: colors.border }]}
        />

        {orderDetails.order_charges.map(({ name, amount }, idx) => (
          <View key={idx} style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              {name}
            </Text>
            {amount === 0 ? (
              <Text
                style={[
                  styles.summaryValue,
                  styles.freeValue,
                  { color: colors.success },
                ]}
              >
                FREE
              </Text>
            ) : (
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ₹{formatCurrency(amount)}
              </Text>
            )}
          </View>
        ))}

        <View
          style={[styles.dashedSeparator, { borderColor: colors.border }]}
        />

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            ₹{formatCurrency(orderDetails.payment_details.amount)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    borderRadius: 12,
    overflow: "hidden",
    paddingBottom: 16,
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
  methodText: {
    fontSize: 16,
  },
  methodValue: {
    fontWeight: "500",
  },
  detailsContainer: {
    flexDirection: "column",
    width: "100%",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "300",
    letterSpacing: -0.35,
  },
  summaryValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.35,
    flexShrink: 1,
    textAlign: "right",
  },
  discountValue: {
    // Color handled by style array
  },
  freeValue: {
    // Color handled by style array
    fontWeight: "500",
  },
  dashedSeparator: {
    marginVertical: 8,
    borderTopWidth: 1,
    borderStyle: "dashed",
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
  },
  totalValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: -0.35,
  },
});

export default PaymentSummaryCard;
