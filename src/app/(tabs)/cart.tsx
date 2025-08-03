import { AddressBottomSheet } from "@/components/bottomsheet/AddressBottomSheet";
import PaymentBottomSheet from "@/components/bottomsheet/PaymentBottomSheet";
import AddMoreItems from "@/components/card/AddMoreItems";
import AddressCard from "@/components/card/AddressCard";
import BillDetails from "@/components/card/BillDetails";
import Coupons from "@/components/card/Coupons";
import ReviewOrder from "@/components/card/ReviewOrder";
import { ConfirmationDialog } from "@/components/dialog/ConfirmationDialog";
import EmptyCart from "@/components/empty/EmptyCart";
import OrderErrorScreen from "@/components/error/OrderErrorScree";
import OrderDetailSkeleton from "@/components/skeletons/OrderSkeleton";
import { UserAddressPayload } from "@/services/address/addressApi.type";
import { useGetUserAddressListQuery } from "@/services/address/AddresssAPI";
import {
  useClearCartMutation,
  useGetCartItemsQuery,
} from "@/services/cart/cartAPI";
import { CartItem } from "@/services/cart/cartApi.type";
import { useGetAppConfigurationsQuery } from "@/services/configuration/configurationApi";
import { useGetCouponsQuery } from "@/services/coupon/couponAPI";
import { useCreateOrderMutation } from "@/services/orders/orderApi";
import { CreateOrders } from "@/services/orders/orderApi.type";
import { useAppSelector } from "@/store/hook";
import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { ChevronLeft, EllipsisVertical } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Coupon } from "@/services/coupon/couponApi.type";

export default function Cart() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const {
    isLoading: isAppConfigLoading,
    data: appConfigData,
    isError: isAppConfigError,
  } = useGetAppConfigurationsQuery();

  const minOrderValue = appConfigData?.data.min_order_amount ?? 0;
  const deliveryCharge = appConfigData?.data.delivery_charge ?? 0;

  const {
    data: cartData = { data: [] },
    isLoading,
    isError,
  } = useGetCartItemsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [createOrder, { isLoading: orderPlacingLoading }] =
    useCreateOrderMutation();

  const { data: addressData = { data: [] } } = useGetUserAddressListQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );
  const defaultAddress = addressData.data.find((address) => address.is_default);

  const { data: couponsData = { data: [] } } = useGetCouponsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [clearCart, { isLoading: clearCartLoading }] = useClearCartMutation();

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [openPaymentSheet, setOpenPaymentSheet] = useState<boolean>(false);

  const [selectedAddress, setSelectedAddress] =
    useState<UserAddressPayload | null>(null);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);

  const availableItems = cartData.data.filter(
    (item) => !item.variant.out_of_stock
  );

  const { itemsTotal, discount } = availableItems.reduce(
    (acc, item: CartItem) => {
      const { mrp, price } = item.variant;
      const quantity = item.quantity;

      acc.itemsTotal += mrp * quantity;
      acc.discount += (mrp - price) * quantity;

      return acc;
    },
    { itemsTotal: 0, discount: 0 }
  );

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
    itemsTotal - discount - promoCodeDiscount + deliveryCharge;

  useEffect(() => {
    if (
      selectedCoupon &&
      itemsTotal - discount < selectedCoupon.min_order_value
    ) {
      setSelectedCoupon(null);
      Alert.alert(
        "Coupon Removed",
        `"${selectedCoupon.offer_code}" removed as minimum order value not met.`
      );
    }
  }, [itemsTotal, discount, selectedCoupon]);

  const [showClearCartDialog, setShowClearCartDialog] = useState(false);

  const handleCouponChange = (coupon: Coupon | null) => {
    setSelectedCoupon(coupon);
  };

  const handleAddressChange = (address: UserAddressPayload) => {
    setSelectedAddress(address);
    setIsAddressDrawerOpen(false);
  };

  const handleAddressDrawerOpen = () => {
    setIsAddressDrawerOpen(true);
  };

  const placeOrder = async (method: string) => {
    if (!cartData || !cartData.data) {
      Alert.alert("Error", "Cart data not available.");
      return;
    }
    const finalAddress = selectedAddress || defaultAddress;
    if (!finalAddress) {
      Alert.alert("Address Missing", "Please select an address to proceed.");
      handleAddressDrawerOpen();
      return;
    }
    if (itemsTotal - discount < minOrderValue) {
      Alert.alert("Minimum Order", `Minimum order value is ₹${minOrderValue}`);
      return;
    }

    const orderItems = availableItems.map(
      ({ quantity, product_variant_id }) => ({
        quantity,
        product_variant_id,
      })
    );

    const orderPayload: CreateOrders = {
      items: orderItems,
      charges: [
        {
          type: "delivery",
          name: "Delivery Charges",
          amount: deliveryCharge,
        },
      ],
      address_id: finalAddress.id,
      offer_codes: selectedCoupon ? [selectedCoupon.offer_code] : [],
      method: method,
    };

    try {
      const result = await createOrder(orderPayload).unwrap();
      console.log("Order creation result:", result);
    } catch (error: any) {
      console.error("Order creation failed:", error);
      Alert.alert(
        "Order Failed",
        error?.data?.message || "Order creation failed. Please try again."
      );
    }
  };

  if (isLoading || isAppConfigLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity onPress={router.back} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Your Cart</Text>
        </View>
        <OrderDetailSkeleton />
      </View>
    );
  }

  if (isError || isAppConfigError) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity onPress={router.back} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Your Cart</Text>
        </View>
        <OrderErrorScreen />
      </View>
    );
  }

  if (cartData.data.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: colors.background,
          },
        ]}
      >
        <EmptyCart />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity onPress={router.back} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.text }]}>
          Your Cart
        </Text>
        <TouchableOpacity
          onPress={() => setShowClearCartDialog(true)}
          style={styles.clearCartButton}
        >
          <EllipsisVertical size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainContentLayout}>
          <View style={styles.leftColumn}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Review Your Order</Text>
            <ReviewOrder cartData={cartData.data} />
            <AddMoreItems />
            <Coupons
              couponsData={couponsData.data}
              itemsTotal={itemsTotal}
              discount={discount}
              selectedCoupon={selectedCoupon}
              handleCouponChange={handleCouponChange}
            />
            <AddressCard
              selectedAddress={selectedAddress || defaultAddress}
              handleAdressDrawerOpen={handleAddressDrawerOpen}
            />
          </View>
          <View style={styles.rightColumn}>
            <BillDetails
              itemsTotal={itemsTotal}
              discount={discount}
              selectedCoupon={selectedCoupon}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomFixedArea, { backgroundColor: colors.cardBackground }]}>
        {selectedAddress || defaultAddress ? (
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: colors.accent }]}
            onPress={() => setOpenPaymentSheet(true)}
            disabled={orderPlacingLoading}
          >
            {orderPlacingLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.payButtonText}>
                {"Pay "}
                {`₹ ${new Intl.NumberFormat("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(totalAmount)}`}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.payButton, styles.selectAddressButton, { backgroundColor: colors.accent }]}
            onPress={handleAddressDrawerOpen}
          >
            <Text style={styles.payButtonText}>Select Address</Text>
          </TouchableOpacity>
        )}
      </View>

      <ConfirmationDialog
        open={showClearCartDialog}
        onOpenChange={setShowClearCartDialog}
        headingText="Clear your cart?"
        bodyText="Would you like to remove all items from your cart?"
        confirmationButtonText={clearCartLoading ? "Clearing..." : "Clear Cart"}
        cancelButtonText="Cancel"
        onConfirm={async () => {
          await clearCart();
          // FIX: Close dialog after clearing cart
          setShowClearCartDialog(false);
        }}
        isConfirming={clearCartLoading}
      />

      <AddressBottomSheet
        isVisible={isAddressDrawerOpen}
        onClose={() => setIsAddressDrawerOpen(false)}
        addresses={addressData.data || []}
        handleAddressChange={handleAddressChange}
      />

      <PaymentBottomSheet
        isVisible={openPaymentSheet}
        onClose={() => setOpenPaymentSheet(false)}
        onSelectPaymentMethod={(method) => {
          placeOrder(method);
          setOpenPaymentSheet(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom:10
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    paddingRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  clearCartButton: {
    paddingLeft: 8,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  mainContentLayout: {
    flexDirection: "column",
    gap: 16,
    justifyContent: "space-between",
  },
  leftColumn: {
    flex: 6,
    flexDirection: "column",
    gap: 12,
  },
  sectionHeading: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  rightColumn: {
    flex: 4,
    flexDirection: "column",
    gap: 12,
  },
  bottomFixedArea: {
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 50,
  },
  payButton: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonText: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "500",
    color: "white",
    letterSpacing: -0.45,
  },
  selectAddressButton: {},
});