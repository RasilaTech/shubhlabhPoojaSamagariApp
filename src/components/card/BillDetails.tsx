// src/components/card/BillDetails.tsx
import { Coupon } from "@/services/coupon/couponApi.type";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
// Adjust path

// Assuming guardIcon.svg is placed in assets/images/guardIcon.png or .jpg after conversion
// For SVG directly, you'd need react-native-svg-transformer
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
  const gstCharges: number = 0; // Hardcoded as 0 in original
  let promoCodeDiscount = 0;

  // const configState = useAppSelector(selectConfiguration);
  const deliveryCharges: number = 0;

  // Recalculate promoCodeDiscount as per the original logic
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

    if (
      selectedCoupon.max_discount_value &&
      promoCodeDiscount > selectedCoupon.max_discount_value
    ) {
      promoCodeDiscount = selectedCoupon.max_discount_value;
    }
  }

  if (promoCodeDiscount > itemsTotal - discount) {
    promoCodeDiscount = itemsTotal - discount;
  }

  const totalAmount =
    itemsTotal - discount - promoCodeDiscount + deliveryCharges + gstCharges;

  // Helper for formatting currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill Details</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Item Total</Text>
          <Text style={styles.value}>₹{formatCurrency(itemsTotal)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Discount</Text>
          <Text style={[styles.value, styles.discountValue]}>
            - ₹{formatCurrency(discount)}
          </Text>
        </View>

        {selectedCoupon && (
          <View style={styles.row}>
            <Text style={styles.label}>Promo Code Discount</Text>
            <Text style={[styles.value, styles.discountValue]}>
              - ₹{formatCurrency(promoCodeDiscount)}
            </Text>
          </View>
        )}

        <View style={styles.dashedSeparator} />

        <View style={styles.row}>
          <Text style={styles.label}>Delivery Partner Fee</Text>
          {deliveryCharges === 0 ? (
            <Text style={[styles.value, styles.freeValue]}>FREE</Text>
          ) : (
            <Text style={styles.value}>₹{formatCurrency(deliveryCharges)}</Text>
          )}
        </View>

        <View style={styles.dashedSeparator} />

        {/* GST and Charges section (commented out in original) */}
        {/* <View style={styles.row}>
          <Text style={styles.label}>GST and Charges</Text>
          {gstCharges === 0 ? (
            <Text style={[styles.value, styles.freeValue]}>FREE</Text>
          ) : (
            <Text style={styles.value}>₹{formatCurrency(gstCharges)}</Text>
          )}
        </View>
        <View style={styles.dashedSeparator} /> */}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>To Pay</Text>
          <Text style={styles.totalValue}>₹{formatCurrency(totalAmount)}</Text>
        </View>
        <View style={styles.guardInfoContainer}>
          <View style={styles.guardIconWrapper}>
            <Image
              source={guartIcon}
              alt="Guard Icon"
              style={styles.guardIcon}
            />
          </View>
          <Text style={styles.guardText}>
            Trusted, authentic, safe, easy returns
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column", // flex flex-col
    gap: 12, // gap-3
  },
  title: {
    marginLeft: 4, // ml-1
    fontSize: 16, // text-[16px]
    fontWeight: "600", // font-semibold
    letterSpacing: -0.4, // -tracking-[0.4px]
    color: "#02060cbf",
    // whitespace-nowrap - handled by flexShrink on other elements if needed
  },
  card: {
    // shadow-cart-card conversion
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 4, // mb-1
    flexDirection: "column", // flex w-full flex-col
    gap: 8, // gap-2
    borderRadius: 8, // rounded-lg
    backgroundColor: "white", // bg-white
    padding: 16, // p-4
  },
  row: {
    flexDirection: "row", // flex
    alignItems: "center", // items-center
    justifyContent: "space-between", // justify-between
  },
  label: {
    // line-clamp-1 - not directly applicable, rely on flexShrink/ellipsizeMode for parents if needed
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-4.5
    fontWeight: "300", // font-extralight
    letterSpacing: -0.35, // -tracking-[0.35px]
    color: "rgba(2, 6, 12, 0.6)", // text-[#02060c99]
  },
  value: {
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-4.5
    fontWeight: "400", // font-normal
    letterSpacing: -0.35, // -tracking-[0.35px]
    color: "rgba(2, 6, 12, 0.75)", // text-[#02060cbf]
    // whitespace-nowrap - handled by flexShrink/ellipsizeMode for parents if needed
  },
  discountValue: {
    color: "#1ba672", // text-[#1ba672]
  },
  freeValue: {
    color: "#1ba672", // text-[#1ba672]
    fontWeight: "400", // font-normal
  },
  dashedSeparator: {
    marginVertical: 8, // my-2
    borderTopWidth: 1, // border-t
    borderStyle: "dashed", // border-dashed
    borderColor: "rgba(2, 6, 12, 0.15)", // border-[#02060c26]
  },
  totalRow: {
    flexDirection: "row", // flex
    alignItems: "center", // items-center
    justifyContent: "space-between", // justify-between
  },
  totalLabel: {
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-4.5
    fontWeight: "600", // font-semibold
    letterSpacing: -0.35, // -tracking-[0.35px]
    color: "rgba(2, 6, 12, 0.92)", // text-[#02060ceb]
  },
  totalValue: {
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-4.5
    fontWeight: "600", // font-semibold
    letterSpacing: -0.35, // -tracking-[0.35px]
    color: "rgba(2, 6, 12, 0.92)", // text-[#02060ceb]
  },
  guardInfoContainer: {
    // -mx-4 -mb-4 - handled by padding on card and margin here
    flexDirection: "row", // flex
    justifyContent: "center", // justify-center
    gap: 8, // gap-2
    borderBottomLeftRadius: 8, // rounded-b-lg (partially, relies on container radius)
    borderBottomRightRadius: 8,
    backgroundColor: "rgba(27, 166, 114, 0.75)", // bg-[#1ba672bf]
    paddingHorizontal: 8, // px-2
    paddingVertical: 6, // py-1.5
    // Note: To truly extend -mx-4 -mb-4, you might need absolute positioning or negative margins.
    // This example uses padding within the card.
    marginHorizontal: -16, // Negative margin to align with card edges
    marginBottom: -16, // Negative margin to align with card bottom edge
    marginTop: 16, // Ensure space from previous content
  },
  guardIconWrapper: {
    flexDirection: "row",
    aspectRatio: 1, // aspect-square
    width: 20, // w-[20px]
    alignItems: "center", // items-center
    justifyContent: "center", // justify-center
    padding: 3, // p-[1px]
  },
  guardIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  guardText: {
    // line-clamp-1
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-4.5
    fontWeight: "400", // font-normal
    letterSpacing: -0.35, // -tracking-[0.35px]
    color: "rgba(255, 255, 255, 0.92)", // text-[#ffffffeb]
  },
});

export default BillDetails;
