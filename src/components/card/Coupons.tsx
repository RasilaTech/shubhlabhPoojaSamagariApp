// src/components/card/Coupons.tsx
import { Coupon } from "@/services/coupon/couponApi.type";
import { ChevronRight, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Adjust paths for your SVG assets (assuming they are converted to PNG/JPG or handled by react-native-svg-transformer)
const priceTagSvg = require("../../../assets/images/priceTag.png"); // Adjust path and extension
const percentageIcon = require("../../../assets/images/percentoff.png"); // Adjust path and extension
const flatIcon = require("../../../assets/images/flatoff.png"); // Adjust path and extension

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
  const totalAmount = itemsTotal - discount; // Amount before promo discount

  const filterCoupons = couponsData.filter(
    (coupon) => !selectedCoupon || coupon.id !== selectedCoupon.id // Filter out already selected coupon
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
    return Math.min(promoDiscount, currentSubtotal); // Discount cannot exceed subtotal
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>SAVING CORNER</Text>

      <View style={styles.applyCouponRow}>
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.applyCouponButton}
        >
          <View style={styles.applyCouponLeft}>
            <View style={styles.iconWrapper}>
              <Image source={priceTagSvg} style={styles.iconImage} />
            </View>
            <Text style={styles.applyCouponText}>Apply Coupon</Text>
          </View>
          <ChevronRight
            size={20}
            color="#02060c73"
            style={isExpanded ? styles.rotate90 : styles.rotate0}
          />
        </TouchableOpacity>

        {selectedCoupon && (
          <View style={styles.selectedCouponContainer}>
            <Text style={styles.selectedCouponText}>
              {"Coupon Code: "}
              <Text style={styles.selectedCouponCode}>
                {selectedCoupon.offer_code}
              </Text>
            </Text>
            <View style={styles.selectedCouponRight}>
              <Text style={styles.selectedCouponDiscount}>
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
                <Trash2 size={16} color="#FF5200" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View
          style={[
            styles.couponListContainer,
            isExpanded ? styles.couponListExpanded : styles.couponListCollapsed,
          ]}
        >
          {filterCoupons.length === 0 ? (
            <View style={styles.noCouponsMessage}>
              <Text style={styles.noCouponsText}>
                No{selectedCoupon ? " more " : " "}coupons available.
              </Text>
            </View>
          ) : (
            filterCoupons.map((coupon) => (
              <View key={coupon.id} style={styles.couponItem}>
                <View style={styles.couponItemHeader}>
                  <View style={styles.couponItemLeft}>
                    <Image
                      source={
                        coupon.discount_type === "percentage"
                          ? percentageIcon
                          : flatIcon
                      }
                      style={styles.couponIcon}
                    />
                    <Text style={styles.couponCodeText}>
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
                        //TODO
                        // totalAmount < coupon.min_order_value &&
                        //   styles.applyButtonTextDisabled,
                      ]}
                    >
                      APPLY
                    </Text>
                  </TouchableOpacity>
                </View>
                {totalAmount < coupon.min_order_value && (
                  <Text style={styles.minOrderWarning}>
                    Add items worth ₹{coupon.min_order_value} or more to avail{" "}
                    this offer.
                  </Text>
                )}
                <View style={styles.couponSeparator} />
                <Text style={styles.couponDescription}>
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
    // shadow-cart-card conversion
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 4, // mb-1
    flexDirection: "column", // flex w-full flex-col
    gap: 16, // gap-4
    borderRadius: 8, // rounded-lg
    backgroundColor: "white", // bg-white
    padding: 16, // p-4
  },
  sectionHeader: {
    fontSize: 12, // text-[12px]
    lineHeight: 16, // leading-4
    fontWeight: "600", // font-semibold
    letterSpacing: 1.5, // tracking-[1.5px]
    color: "rgba(2, 6, 12, 0.45)", // text-[#02060c73]
  },
  applyCouponRow: {
    flexDirection: "column", // flex flex-col
  },
  applyCouponButton: {
    flexDirection: "row", // flex
    alignItems: "center", // items-center
    justifyContent: "space-between", // justify-between
    // cursor-pointer - not applicable
  },
  applyCouponLeft: {
    flexDirection: "row", // flex
    gap: 12, // gap-3
    alignItems: "center",
  },
  iconWrapper: {
    flexDirection: "row",
    aspectRatio: 1, // aspect-square
    width: 20, // w-[20px]
    alignItems: "center", // items-center
    justifyContent: "center", // justify-center
    borderRadius: 4, // rounded-sm
    backgroundColor: "#fbbf24", // bg-amber-400
    padding: 3, // p-[3px]
  },
  iconImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  applyCouponText: {
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-4.5
    fontWeight: "400", // font-normal
    letterSpacing: -0.35, // -tracking-[0.35px]
    color: "rgba(2, 6, 12, 0.75)", // text-[#02060cbf]
  },
  rotate90: {
    transform: [{ rotate: "90deg" }],
  },
  rotate0: {
    transform: [{ rotate: "0deg" }],
  },
  selectedCouponContainer: {
    // animate-coupon-appear - not directly applicable, will appear/disappear instantly
    marginTop: 16, // mt-4
    flexDirection: "row", // flex
    alignItems: "center", // items-center
    justifyContent: "space-between", // justify-between
    borderRadius: 8, // rounded-lg
    borderWidth: 1, // border
    borderColor: "#e2e8f0", // border-[#f0f0f5] (slate-200 equivalent)
    backgroundColor: "#f1f5f9", // bg-[#f0f0f5] (slate-100 equivalent)
    paddingHorizontal: 12, // px-3
    paddingVertical: 8, // py-2
    // transition-all duration-200 ease-in-out - handled by appearance/disappearance
  },
  selectedCouponText: {
    fontSize: 14, // text-sm
    fontWeight: "400", // font-normal
    color: "rgba(2, 6, 12, 0.45)", // text-[#02060c73]
  },
  selectedCouponCode: {
    fontWeight: "600", // font-semibold
  },
  selectedCouponRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // gap-3
  },
  selectedCouponDiscount: {
    fontSize: 14, // text-sm
    fontWeight: "600", // font-semibold
    color: "rgba(2, 6, 12, 0.45)", // text-[#02060c73]
  },
  removeCouponButton: {
    // cursor-pointer - not applicable
  },
  couponListContainer: {
    flexDirection: "column", // flex flex-col
    gap: 12, // gap-3
    borderRadius: 8, // rounded-lg
    backgroundColor: "#f1f5f9", // bg-[#f0f0f5]
    // overflow-y-auto - handled by ScrollView if this list gets very long
  },
  couponListExpanded: {
    maxHeight: 320, // max-h-80 (approx)
    marginTop: 16, // mt-4
    padding: 12, // p-3
    opacity: 1, // opacity-100
    transform: [{ scale: 1 }], // scale-100
    // transition-all duration-300 ease-in-out - not directly applicable for direct style changes
  },
  couponListCollapsed: {
    maxHeight: 0, // max-h-0
    opacity: 0, // opacity-0
    transform: [{ scale: 0.95 }], // scale-95
    overflow: "hidden", // Hide content when collapsed
    marginTop: 0,
    padding: 0,
  },
  noCouponsMessage: {
    flexDirection: "column", // flex flex-col
    alignItems: "center", // items-center
    justifyContent: "center", // justify-center
  },
  noCouponsText: {
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-4.5
    fontWeight: "400", // font-normal
    letterSpacing: -0.35, // -tracking-[0.35px]
    color: "rgba(2, 6, 12, 0.45)", // text-[#02060c73]
  },
  couponItem: {
    flexDirection: "column", // flex flex-col
    gap: 16, // gap-4
    borderRadius: 8, // rounded-lg
    backgroundColor: "white", // bg-white
    padding: 16, // p-4
  },
  couponItemHeader: {
    flexDirection: "row", // flex
    justifyContent: "space-between", // justify-between
    alignItems: "center",
  },
  couponItemLeft: {
    flexDirection: "row", // flex
    alignItems: "center", // items-center
    gap: 8, // gap-2
  },
  couponIcon: {
    width: 23, // w-[23px]
    aspectRatio: 1, // aspect-square
    borderRadius: 8, // rounded-[8px]
    backgroundColor: "#FF5200", // bg-[#FF5200]
    padding: 3, // p-[3px]
    resizeMode: "contain",
  },
  couponCodeText: {
    fontSize: 18, // text-lg
    lineHeight: 22, // leading-5.5 (approx)
    fontWeight: "400", // font-normal
    letterSpacing: -0.45, // tracking-[-0.45px]
    color: "rgba(2, 6, 12, 0.75)", // text-[#02060cbf]
  },
  applyButton: {
    // cursor-pointer - not applicable
  },
  applyButtonText: {
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-4.5
    fontWeight: "600", // font-semibold
    letterSpacing: -0.35, // tracking-[-0.35px]
    color: "#FF5200", // text-[#FF5200]
  },
  applyButtonDisabled: {
    // color: "#e2e2e7"
    opacity: 0.5, // Reduced opacity for disabled visual
  },
  minOrderWarning: {
    // line-clamp-2 - handled by numberOfLines on parent Text component if needed
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-4.5
    fontWeight: "400", // font-normal
    letterSpacing: -0.35, // -tracking-[0.35px]
    color: "#fa3c5a", // text-[#fa3c5a]
  },
  couponSeparator: {
    borderTopWidth: 1, // border-t
    borderStyle: "dashed", // border-dashed
    borderColor: "rgba(2, 6, 12, 0.15)", // border-[rgba(2,6,12,0.15)]
  },
  couponDescription: {
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-4.5
    fontWeight: "400", // font-normal
    letterSpacing: 0.35, // tracking-[0.35px]
    color: "rgba(2, 6, 12, 0.92)", // text-[#02060ceb]
  },
});

export default Coupons;
