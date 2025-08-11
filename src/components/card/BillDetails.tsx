import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { useGetAppConfigurationsQuery } from "@/services/configuration/configurationApi";
import type { Coupon } from "@/services/coupon/couponApi.type";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

// Assuming guardIcon.png is placed in assets/images/
const guartIcon = require("../../../assets/images/guardIcon.png"); // Adjust path and extension

export interface BillDetailProps {
  itemsTotal: number;
  discount: number;
  selectedCoupon: Coupon | null;
}

const BillDetails = ({
  itemsTotal,
  discount,
  selectedCoupon,
}: BillDetailProps) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const {
    isLoading: isAppConfigLoading,
    data: appConfigData,
    isError: isAppConfigError,
  } = useGetAppConfigurationsQuery();

  const gstCharges: number = 0;
  const deliveryCharges: number = appConfigData?.data.delivery_charge ?? 0; // The original code has this hardcoded to 0 for some reason, even though there's a `configState`
  let promoCodeDiscount = 0;

  if (selectedCoupon) {
    if (selectedCoupon.discount_type === "percentage") {
      promoCodeDiscount =
        ((itemsTotal - discount) * selectedCoupon.discount_value) / 100;
      if (selectedCoupon.max_discount_value) {
        promoCodeDiscount = Math.min(
          promoCodeDiscount,
          selectedCoupon.max_discount_value
        );
      }
      if (selectedCoupon.min_discount_value) {
        promoCodeDiscount = Math.max(
          promoCodeDiscount,
          selectedCoupon.min_discount_value
        );
      }
    } else if (selectedCoupon.discount_type === "fixed") {
      promoCodeDiscount = selectedCoupon.discount_value;
    }
    promoCodeDiscount = Math.min(promoCodeDiscount, itemsTotal - discount);
  }

  const totalAmount =
    itemsTotal - discount - promoCodeDiscount + deliveryCharges + gstCharges;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Bill Details</Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.cardBackground, shadowColor: colors.text },
        ]}
      >
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Item Total
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            ₹{formatCurrency(itemsTotal)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Discount
          </Text>
          <Text
            style={[
              styles.value,
              styles.discountValue,
              { color: colors.success },
            ]}
          >
            - ₹{formatCurrency(discount)}
          </Text>
        </View>

        {selectedCoupon && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Promo Code Discount
            </Text>
            <Text
              style={[
                styles.value,
                styles.discountValue,
                { color: colors.success },
              ]}
            >
              - ₹{formatCurrency(promoCodeDiscount)}
            </Text>
          </View>
        )}

        <View
          style={[styles.dashedSeparator, { borderColor: colors.border }]}
        />

        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Delivery Partner Fee
          </Text>
          {deliveryCharges === 0 ? (
            <Text
              style={[
                styles.value,
                styles.freeValue,
                { color: colors.success },
              ]}
            >
              FREE
            </Text>
          ) : (
            <Text style={[styles.value, { color: colors.text }]}>
              ₹{formatCurrency(deliveryCharges)}
            </Text>
          )}
        </View>

        <View
          style={[styles.dashedSeparator, { borderColor: colors.border }]}
        />

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>
            To Pay
          </Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            ₹{formatCurrency(totalAmount)}
          </Text>
        </View>
        <View
          style={[
            styles.guardInfoContainer,
            { backgroundColor: colors.success },
          ]}
        >
          <View style={styles.guardIconWrapper}>
            <Image
              source={guartIcon}
              alt="Guard Icon"
              style={[styles.guardIcon, { tintColor: colors.cardBackground }]} // Use tintColor for monochrome SVGs/PNGs
            />
          </View>
          <Text style={[styles.guardText, { color: colors.cardBackground }]}>
            Trusted, authentic, safe, easy returns
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
  },
  title: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 4,
    flexDirection: "column",
    gap: 8,
    borderRadius: 8,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "300",
    letterSpacing: -0.35,
  },
  value: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.35,
    flexShrink: 1,
    textAlign: "right",
  },
  discountValue: {},
  freeValue: {
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
  guardInfoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: -16,
    marginBottom: -16,
    marginTop: 16,
  },
  guardIconWrapper: {
    flexDirection: "row",
    aspectRatio: 1,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  guardIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  guardText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.35,
  },
});

export default BillDetails;
