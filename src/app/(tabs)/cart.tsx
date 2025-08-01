// app/(tabs)/cart.tsx
import { AddressBottomSheet } from "@/components/bottomsheet/AddressBottomSheet";
import PaymentBottomSheet from "@/components/bottomsheet/PaymentBottomSheet";
import AddMoreItems from "@/components/card/AddMoreItems";
import AddressCard from "@/components/card/AddressCard";
import BillDetails from "@/components/card/BillDetails";
import Coupons from "@/components/card/Coupons";
import ReviewOrder from "@/components/card/ReviewOrder";
import ConfirmationDialog from "@/components/dialog/ConfirmationDialog";
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
import { useGetCouponsQuery } from "@/services/coupon/couponAPI";
import { Coupon } from "@/services/coupon/couponApi.type";
import { useCreateOrderMutation } from "@/services/orders/orderApi";
import { CreateOrders } from "@/services/orders/orderApi.type";
import { useAppSelector } from "@/store/hook";
import { router } from "expo-router"; // For navigation
import { ChevronLeft, EllipsisVertical } from "lucide-react-native"; // Lucide icons
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

export default function Cart() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  //TODO:

  // const configState = useAppSelector(selectConfiguration);
  // const minOrderValue = configState.data?.data.min_order_amount ?? 0;
  // const deliveryCharge = configState.data?.data.delivery_charge ?? 0;
  const minOrderValue = 0;
  const deliveryCharge = 0;

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
    // skip: !isAuthenticated,
  });

  const [clearCart, { isLoading: clearCartLoading }] = useClearCartMutation();

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [openPaymentSheet, setOpenPaymentSheet] = useState<boolean>(false); // Renamed isOpenPaymentSheet for consistency

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

    // Ensure discount doesn't exceed the subtotal after item-level discounts
    promoCodeDiscount = Math.min(promoCodeDiscount, itemsTotal - discount);
  }

  const totalAmount =
    itemsTotal - discount - promoCodeDiscount + deliveryCharge;

  // Clear selected coupon if order value falls below min_order_value for the coupon
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

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={router.back} style={styles.backButton}>
            <ChevronLeft size={24} color="#02060cbf" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>
        <OrderDetailSkeleton /> {/* Display cart skeleton while loading */}
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={router.back} style={styles.backButton}>
            <ChevronLeft size={24} color="#02060cbf" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>
        <OrderErrorScreen /> {/* Display generic error screen */}
      </View>
    );
  }

  if (cartData.data.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <EmptyCart />;
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} style={styles.backButton}>
          <ChevronLeft size={24} color="#02060cbf" />
        </TouchableOpacity>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>
          Your Cart
        </Text>
        <TouchableOpacity
          onPress={() => setShowClearCartDialog(true)}
          style={styles.clearCartButton}
        >
          <EllipsisVertical size={24} color="#02060c73" />
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainContentLayout}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            <Text style={styles.sectionHeading}>Review Your Order</Text>
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
          {/* Right Column */}
          <View style={styles.rightColumn}>
            <BillDetails
              itemsTotal={itemsTotal}
              discount={discount}
              selectedCoupon={selectedCoupon}
            />
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Pay/Select Address Button */}
      <View style={styles.bottomFixedArea}>
        {selectedAddress || defaultAddress ? (
          <TouchableOpacity
            style={styles.payButton}
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
            style={[styles.payButton, styles.selectAddressButton]}
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
    backgroundColor: "#f0f0f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16, // px-2 was too small, adjusted to 16
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    // sticky top-0 z-10 - implicit as it's outside ScrollView
  },
  backButton: {
    paddingRight: 8, // gap-2
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: "#02060cbf",
  },
  clearCartButton: {
    paddingLeft: 8, // Adjust as needed
  },

  scrollContent: {
    flexGrow: 1, // Allows content to fill available space
    padding: 16, // p-4
    backgroundColor: "#f0f0f5",
  },
  mainContentLayout: {
    flexDirection: "column", // Default for mobile (sm:flex-row)
    gap: 16, // gap-4
    justifyContent: "space-between",
    // sm:flex-row - responsive logic if you want side-by-side on larger screens
    // For large screens: flexDirection: Dimensions.get('window').width > 600 ? 'row' : 'column'
  },
  leftColumn: {
    flex: 6, // flex-6
    flexDirection: "column",
    gap: 12, // gap-3
  },
  sectionHeading: {
    marginLeft: 4, // ml-1
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: "#02060cbf",
  },
  rightColumn: {
    flex: 4, // flex-4
    flexDirection: "column",
    gap: 12, // gap-3
  },

  bottomFixedArea: {
    // shadow-cart-card conversion
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 }, // Shadow on top
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8, // Higher elevation for bottom fixed elements
    borderTopLeftRadius: 8, // rounded-tl-lg
    borderTopRightRadius: 8, // rounded-tr-lg
    backgroundColor: "white", // bg-white
    paddingHorizontal: 16, // px-4
    paddingTop: 16, // py-4
    paddingBottom: 50,
    // bottom-0 z-10 - implicit due to position outside ScrollView
  },
  payButton: {
    width: "100%", // w-full
    borderRadius: 8, // rounded-lg
    backgroundColor: "#ff5200", // bg-[#ff5200]
    paddingVertical: 12, // py-2.5 (adjusted for better touch target)
    alignItems: "center",
    justifyContent: "center",
    // cursor-pointer - not applicable
    // transition duration-150 ease-in-out hover:scale-[0.98] hover:bg-[#ff5200] focus:outline-none
  },
  payButtonText: {
    fontSize: 18, // text-lg
    lineHeight: 20, // leading-5 (adjusted from leading-5.5)
    fontWeight: "500", // font-normal
    color: "white", // text-white
    letterSpacing: -0.45, // -tracking-[0.45px]
  },
  selectAddressButton: {
    // Reuses payButton styles
    // hover:shadow-none - not applicable
  },
});
