import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Adjust paths for RTK Query and Redux hooks
import {
  useGetCartItemsQuery,
  useUpdateCartItemMutation,
} from "@/services/cart/cartAPI"; // Adjust path

// Import your converted components and types
import { LoginDialog } from "@/components/dialog/LoginDialog"; // Adjust path
import { Product } from "@/services/product/productApi.type";
import { useAppSelector } from "@/store/hook";
import ProductVariantBottomSheet from "./ProductVariantBottomSheet";

export interface TriggerProductVariantBottomSheetProps {
  product: Product;
}
const TriggerProductVariantBottomSheet = ({
  product,
}: TriggerProductVariantBottomSheetProps) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false); // State to control ProductVariantBottomSheet visibility
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false); // State to control LoginDialog visibility

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: cartData = { data: [] } } = useGetCartItemsQuery(undefined, {
    // skip: !isAuthenticated,
  });

  const [updateCartItem, { isLoading: isUpdatingCart }] =
    useUpdateCartItemMutation();

  // Calculate total quantity of THIS specific product (across all its variants) in the cart
  let totalProductsInCart = 0;
  let variantsOfThisProductInCart = 0; // Number of *unique variants* of this product in cart

  product.product_variants.forEach((variant) => {
    const itemInCart = cartData.data.find(
      (cartItem) =>
        cartItem.product_variant_id === variant.id &&
        !cartItem.variant.out_of_stock
    );
    if (itemInCart) {
      totalProductsInCart += itemInCart.quantity;
      variantsOfThisProductInCart++;
    }
  });

  const hasMultipleVariantsInCart = variantsOfThisProductInCart > 1;

  const handleDecreaseProductQuantity = async (productId: string) => {
    // This function is only called when quantity is > 0 and only ONE variant is in cart
    const variantInCart = cartData.data.find(
      (item) =>
        item.variant.product_id === productId && !item.variant.out_of_stock
    );
    if (!variantInCart || isUpdatingCart) return;

    try {
      await updateCartItem({
        productVariantId: variantInCart.product_variant_id,
        body: { action: "decrease" },
      }).unwrap();
    } catch (error: any) {
      console.error("Failed to decrease quantity:", error);
      Alert.alert(
        "Error",
        error?.data?.message || "Failed to decrease quantity."
      );
    }
  };

  // Common button base style
  const buttonBaseStyle = [
    styles.counterButtonBase,
    styles.addOutlineButton, // Includes shadow and border
  ];
  const buttonTextStyle = styles.addOutlineButtonText;

  // --- Render Functions for Buttons ---
  const AddButton = () => (
    <TouchableOpacity
      style={buttonBaseStyle}
      onPress={() => setIsBottomSheetOpen(true)}
    >
      <Text style={buttonTextStyle}>Add</Text>
    </TouchableOpacity>
  );

  const MinusButton = () => (
    <TouchableOpacity
      // Only directly decrease if only one variant of this product is in cart
      onPress={
        hasMultipleVariantsInCart
          ? () => setIsBottomSheetOpen(true)
          : () => handleDecreaseProductQuantity(product.id)
      }
      style={[
        styles.counterButtonSide,
        styles.leftRounded, // Apply specific border radius
        isUpdatingCart && styles.disabledCounterButton,
      ]}
      disabled={isUpdatingCart}
    >
      {isUpdatingCart ? (
        <ActivityIndicator size="small" color="#1ba672" />
      ) : (
        <Text style={styles.counterButtonText}>-</Text>
      )}
    </TouchableOpacity>
  );

  const PlusButton = () => (
    <TouchableOpacity
      onPress={() => setIsBottomSheetOpen(true)} // Always open bottom sheet for plus
      style={[
        styles.counterButtonSide,
        styles.rightRounded, // Apply specific border radius
        isUpdatingCart && styles.disabledCounterButton,
      ]}
      disabled={isUpdatingCart}
    >
      {isUpdatingCart ? (
        <ActivityIndicator size="small" color="#1ba672" />
      ) : (
        <Text style={styles.counterButtonText}>+</Text>
      )}
    </TouchableOpacity>
  );

  const QuantityDisplay = () => (
    <TouchableOpacity
      onPress={() => setIsBottomSheetOpen(true)} // Always open bottom sheet for quantity display
      style={styles.quantityDisplayContainer}
    >
      <Text style={styles.quantityDisplayText}>{totalProductsInCart}</Text>
    </TouchableOpacity>
  );

  // --- Main Render Logic ---
  if (!isAuthenticated) {
    return (
      <TouchableOpacity
        style={buttonBaseStyle}
        onPress={() => setIsLoginDialogOpen(true)} // Open Login Dialog
      >
        <Text style={buttonTextStyle}>Add</Text>
        <LoginDialog
          isVisible={isLoginDialogOpen}
          onClose={() => setIsLoginDialogOpen(false)}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {totalProductsInCart === 0 ? (
        <AddButton />
      ) : (
        <View style={styles.counterGroup}>
          <MinusButton />
          <QuantityDisplay />
          <PlusButton />
        </View>
      )}

      {/* Product Variant Selection Bottom Sheet */}
      <ProductVariantBottomSheet
        productVariants={product.product_variants}
        isVisible={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    // This wrapper is mainly for organization
    width: "100%", // Ensure it takes full width of its parent if needed
    alignItems: "center", // Center content if button isn't full width
  },
  counterButtonBase: {
    height: "auto", // h-fit
    width: 90, // Set explicit width for button/counter
    borderRadius: 8, // rounded-[8px]
    paddingVertical: 6, // py-1.5
    alignItems: "center",
    justifyContent: "center",
  },
  // Add button (outline variant)
  addOutlineButton: {
    borderWidth: 1,
    borderColor: "rgba(2, 6, 12, 0.15)", // border-[#02060c26]
    backgroundColor: "white",
    shadowColor: "#000", // shadow-button-shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addOutlineButtonText: {
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-[18px]
    fontWeight: "600", // font-semibold
    letterSpacing: -0.35, // -tracking-[0.35px]
    color: "#ff5200", // text-[#ff5200]
  },
  // Counter group (when quantity > 0)
  counterGroup: {
    flexDirection: "row",
    height: "auto", // h-fit
    width: 90, // Set explicit width for the entire counter group
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8, // rounded-lg
    borderWidth: 1,
    borderColor: "rgba(2, 6, 12, 0.15)",
    overflow: "hidden", // Ensures border radius clips content
  },
  counterButtonSide: {
    height: "100%", // Take full height of counterGroup
    paddingHorizontal: 8, // px-2
    paddingVertical: 6, // py-1.5
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white", // Default background
  },
  leftRounded: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    // border-none rounded-r-none are implicit
  },
  rightRounded: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    // border-none rounded-l-none are implicit
  },
  counterButtonText: {
    fontSize: 18, // leading-[1.125rem] font-semibold tracking-[-0.35px]
    fontWeight: "600",
    letterSpacing: -0.35,
    color: "#1ba672", // text-[#1ba672]
  },
  quantityDisplayContainer: {
    flex: 1, // flex-1
    justifyContent: "center",
    alignItems: "center",
    // hover:bg-[#02060c26] not applicable
  },
  quantityDisplayText: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-[1.125rem]
    fontWeight: "600", // font-semibold
    letterSpacing: 0.35, // tracking-[0.35px]
    color: "#1ba672",
    // shadow-none not applicable
  },
  disabledCounterButton: {
    opacity: 0.5, // Visual for disabled state
  },
});

export default TriggerProductVariantBottomSheet;
