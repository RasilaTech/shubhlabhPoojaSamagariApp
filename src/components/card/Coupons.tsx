import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { Coupon } from "@/services/coupon/couponApi.type";
import { ChevronRight, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Adjust paths for your SVG assets
const priceTagSvg = require("../../../assets/images/priceTag.png");
const percentageIcon = require("../../../assets/images/percentoff.png");
const flatIcon = require("../../../assets/images/flatoff.png");

export interface CouponsProps {
  couponsData: Coupon[];
  itemsTotal: number;
  discount: number;
  handleCouponChange: (coupon: Coupon | null) => void;
  selectedCoupon: Coupon | null;
}

const Coupons = ({
  couponsData,
  itemsTotal,
  discount,
  selectedCoupon,
  handleCouponChange,
}: CouponsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalAmount = itemsTotal - discount;

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const filterCoupons = couponsData.filter(
    (coupon) => !selectedCoupon || coupon.id !== selectedCoupon.id
  );

  const calculatePromoDiscountPreview = (coupon: Coupon): number => {
    let promoDiscount = 0;
    const currentSubtotal = itemsTotal - discount;

    if (coupon.discount_type === "percentage") {
      promoDiscount = (currentSubtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_value) {
        promoDiscount = Math.min(promoDiscount, coupon.max_discount_value);
      }
      if (coupon.min_discount_value) {
        promoDiscount = Math.max(promoDiscount, coupon.min_discount_value);
      }
    } else if (coupon.discount_type === "fixed") {
      promoDiscount = coupon.discount_value;
    }
    return Math.min(promoDiscount, currentSubtotal);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
    >
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
        SAVING CORNER
      </Text>

      <View style={styles.applyCouponRow}>
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.applyCouponButton}
        >
          <View style={styles.applyCouponLeft}>
            <View
              style={[styles.iconWrapper, { backgroundColor: colors.accent }]}
            >
              <Image source={priceTagSvg} style={styles.iconImage} />
            </View>
            <Text
              style={[styles.applyCouponText, { color: colors.textSecondary }]}
            >
              Apply Coupon
            </Text>
          </View>
          <ChevronRight
            size={20}
            color={colors.textSecondary}
            style={isExpanded ? styles.rotate90 : styles.rotate0}
          />
        </TouchableOpacity>

        {selectedCoupon && (
          <View
            style={[
              styles.selectedCouponContainer,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.selectedCouponText,
                { color: colors.textSecondary },
              ]}
            >
              {"Coupon Code: "}
              <Text style={[styles.selectedCouponCode, { color: colors.text }]}>
                {selectedCoupon.offer_code}
              </Text>
            </Text>
            <View style={styles.selectedCouponRight}>
              <Text
                style={[
                  styles.selectedCouponDiscount,
                  { color: colors.textSecondary },
                ]}
              >
                {selectedCoupon.discount_type === "percentage"
                  ? `${selectedCoupon.discount_value}% off`
                  : `₹${new Intl.NumberFormat("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(selectedCoupon.discount_value)} off`}
              </Text>
              <TouchableOpacity
                onPress={() => handleCouponChange(null)}
                style={styles.removeCouponButton}
              >
                <Trash2 size={16} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View
          style={[
            styles.couponListContainer,
            { backgroundColor: colors.background },
            isExpanded ? styles.couponListExpanded : styles.couponListCollapsed,
          ]}
        >
          {filterCoupons.length === 0 ? (
            <View style={styles.noCouponsMessage}>
              <Text
                style={[styles.noCouponsText, { color: colors.textSecondary }]}
              >
                No{selectedCoupon ? " more " : " "}coupons available.
              </Text>
            </View>
          ) : (
            filterCoupons.map((coupon) => (
              <View
                key={coupon.id}
                style={[
                  styles.couponItem,
                  { backgroundColor: colors.cardBackground },
                ]}
              >
                <View style={styles.couponItemHeader}>
                  <View style={styles.couponItemLeft}>
                    <Image
                      source={
                        coupon.discount_type === "percentage"
                          ? percentageIcon
                          : flatIcon
                      }
                      style={[
                        styles.couponIcon,
                        { backgroundColor: colors.accent },
                      ]}
                    />
                    <Text
                      style={[
                        styles.couponCodeText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {coupon.offer_code}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCouponChange(coupon)}
                    disabled={totalAmount < coupon.min_order_value}
                    style={[
                      styles.applyButton,
                      totalAmount < coupon.min_order_value &&
                        styles.applyButtonDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.applyButtonText,
                        { color: colors.accent },
                        totalAmount < coupon.min_order_value &&
                          styles.applyButtonTextDisabled,
                      ]}
                    >
                      APPLY
                    </Text>
                  </TouchableOpacity>
                </View>
                {totalAmount < coupon.min_order_value && (
                  <Text
                    style={[
                      styles.minOrderWarning,
                      { color: colors.destructive },
                    ]}
                  >
                    Add items worth ₹{coupon.min_order_value} or more to avail{" "}
                    this offer.
                  </Text>
                )}
                <View
                  style={[
                    styles.couponSeparator,
                    { borderColor: colors.border },
                  ]}
                />
                <Text
                  style={[styles.couponDescription, { color: colors.text }]}
                >
                  {coupon.description}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 4,
    flexDirection: "column",
    gap: 16,
    borderRadius: 8,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  applyCouponRow: {
    flexDirection: "column",
  },
  applyCouponButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  applyCouponLeft: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconWrapper: {
    flexDirection: "row",
    aspectRatio: 1,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    padding: 3,
  },
  iconImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  applyCouponText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.35,
  },
  applyButtonTextDisabled: {
    // FIX: The missing style
    color: "#e2e2e7",
  },
  rotate90: {
    transform: [{ rotate: "90deg" }],
  },
  rotate0: {
    transform: [{ rotate: "0deg" }],
  },
  selectedCouponContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedCouponText: {
    fontSize: 14,
    fontWeight: "400",
  },
  selectedCouponCode: {
    fontWeight: "600",
  },
  selectedCouponRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectedCouponDiscount: {
    fontSize: 14,
    fontWeight: "600",
  },
  removeCouponButton: {},
  couponListContainer: {
    flexDirection: "column",
    gap: 12,
    borderRadius: 8,
  },
  couponListExpanded: {
    maxHeight: 320,
    marginTop: 16,
    padding: 12,
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  couponListCollapsed: {
    maxHeight: 0,
    opacity: 0,
    transform: [{ scale: 0.95 }],
    overflow: "hidden",
    marginTop: 0,
    padding: 0,
  },
  noCouponsMessage: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  noCouponsText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.35,
  },
  couponItem: {
    flexDirection: "column",
    gap: 16,
    borderRadius: 8,
    padding: 16,
  },
  couponItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  couponItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  couponIcon: {
    width: 23,
    aspectRatio: 1,
    borderRadius: 8,
    padding: 3,
    resizeMode: "contain",
  },
  couponCodeText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: -0.45,
  },
  applyButton: {},
  applyButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: -0.35,
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  minOrderWarning: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.35,
  },
  couponSeparator: {
    borderTopWidth: 1,
    borderStyle: "dashed",
  },
  couponDescription: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: 0.35,
  },
});

export default Coupons;
