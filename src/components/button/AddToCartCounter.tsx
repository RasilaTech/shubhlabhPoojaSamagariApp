import { Minus, Plus } from "lucide-react-native"; // For +/- icons
import React, { useState } from "react";
import {
  ActivityIndicator, // For showing loading state on buttons
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Adjust paths for your RTK Query hooks and Redux hook
import {
  useAddToCartMutation,
  useGetCartItemsQuery,
  useUpdateCartItemMutation,
} from "@/services/cart/cartAPI"; // Adjust path

// Import type definitions

// Assuming LoginDialog is a React Native component that uses Modal
// import LoginDialog from "@/components/dialog/LoginDialog"; // Adjust path
import { CartItem } from "@/services/cart/cartApi.type";
import { ProductVariant } from "@/services/product/productApi.type";
import { useAppSelector } from "@/store/hook";
import { LoginDialog } from "../dialog/LoginDialog";

export interface AddToCartCounterProps {
  productVariant: ProductVariant;
}
const AddToCartCounter = ({ productVariant }: AddToCartCounterProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [showLoginDialog, setShowLoginDialog] = useState(false); // State for LoginDialog visibility

  const { data: cartData = { data: [] }, isFetching: isFetchingCart } =
    useGetCartItemsQuery();

  const [updateCartItem, { isLoading: isUpdatingCart }] =
    useUpdateCartItemMutation();
  const [addCartItem, { isLoading: isAddingToCart }] = useAddToCartMutation();

  let quantity = 0;
  const cartItem = cartData.data.find(
    (item: CartItem) => item.product_variant_id === productVariant.id
  );
  quantity = cartItem ? cartItem.quantity : 0;

  const handleAddItemToCart = async (productId: string) => {
    if (isAddingToCart) return; // Prevent double clicks
    try {
      await addCartItem({ product_variant_id: productId }).unwrap();
      // Alert.alert("Success", "Item added to cart!");
    } catch (error: any) {
      console.error("Failed to add item to cart:", error);
      Alert.alert(
        "Error",
        error?.data?.message || "Failed to add item to cart."
      );
    }
  };

  const handleDecreaseProductQuantity = async (productId: string) => {
    if (isUpdatingCart) return; // Prevent double clicks

    try {
      await updateCartItem({
        productVariantId: productId,
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

  const handleIncreaseProductQuantity = async (productId: string) => {
    if (isUpdatingCart) return; // Prevent double clicks
    try {
      await updateCartItem({
        productVariantId: productId,
        body: { action: "increase" },
      }).unwrap();
    } catch (error: any) {
      console.error("Failed to increase quantity:", error);
      Alert.alert(
        "Error",
        error?.data?.message || "Failed to increase quantity."
      );
    }
  };

  // Render loading state for buttons if any cart operation is pending
  const showLoading = isAddingToCart || isUpdatingCart || isFetchingCart;

  if (!isAuthenticated) {
    return (
      <TouchableOpacity
        style={[styles.baseButton, styles.addOutlineButton]}
        onPress={() => setShowLoginDialog(true)} // Open LoginDialog
        disabled={showLoading}
      >
        {showLoading ? (
          <ActivityIndicator size="small" color="#ff5200" />
        ) : (
          <Text style={styles.addOutlineButtonText}>Add</Text>
        )}

        {/* Login Dialog (Modal) */}
        <LoginDialog
          isVisible={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
        />
      </TouchableOpacity>
    );
  }

  return quantity === 0 ? (
    <TouchableOpacity
      style={[styles.baseButton, styles.addOutlineButton]}
      onPress={() => handleAddItemToCart(productVariant.id)}
      disabled={showLoading}
    >
      {showLoading ? (
        <ActivityIndicator size="small" color="#ff5200" />
      ) : (
        <Text style={styles.addOutlineButtonText}>Add</Text>
      )}
    </TouchableOpacity>
  ) : (
    <View style={styles.counterContainer}>
      <TouchableOpacity
        style={styles.counterButton}
        onPress={() => handleDecreaseProductQuantity(productVariant.id)}
        disabled={showLoading}
      >
        <Minus size={16}  color="#1ba672" />
      </TouchableOpacity>

      <View style={styles.quantityDisplay}>
        {showLoading ? (
          <ActivityIndicator size="small" color="#1ba672" />
        ) : (
          <Text style={styles.quantityText}>{quantity}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.counterButton}
        onPress={() => handleIncreaseProductQuantity(productVariant.id)}
        disabled={showLoading}
      >
        <Plus size={16} color="#1ba672" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Base button styles to be reused
  baseButton: {
    height: "auto", // h-fit
    width: "100%", // w-full
    borderRadius: 8, // rounded-[8px]
    paddingVertical: 4, // py-1.5
    alignItems: "center",
    justifyContent: "center",
  },
  // Add button (outline variant)
  addOutlineButton: {
    borderWidth: 1,
    borderColor: "rgba(2, 6, 12, 0.15)", // border-[#02060c26]
    backgroundColor: "white", // bg-white
    // shadow-button-shadow conversion
  
   // Android shadow
  },
  addOutlineButtonText: {
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-[18px]
    fontWeight: "600", // font-semibold
    letterSpacing: -0.35, // -tracking-[0.35px]
    color: "#ff5200", // text-[#ff5200]
    // hover styles are not directly applicable
  },
  // Counter container (for quantity > 0)
  counterContainer: {
    flexDirection: "row",
    height: "auto", // h-fit
    width: "100%", // w-full
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8, // rounded-[8px]
    borderWidth: 1,
    borderColor: "rgba(2, 6, 12, 0.15)", // border-[#02060c26]
    overflow: "hidden", // Ensures buttons don't extend past border radius
  },
  counterButton: {
    height: "100%", // h-fit
    paddingHorizontal: 4, // px-2 (approx)
    paddingVertical: 2, // py-1.5 (approx)
    alignItems: "center",
    justifyContent: "center",
   
  },
  quantityDisplay: {
    flex: 1, // flex-1
    alignItems: "center", // justify-center
    justifyContent: "center",
  },
  quantityText: {
    // cursor-default - not applicable
    paddingHorizontal: 8, // px-2 (approx)
    paddingVertical: 6, // py-1.5 (approx)
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-[1.125rem] (1.125 * 16px = 18px)
    fontWeight: "600", // font-semibold
    letterSpacing: 0.35, // tracking-[0.35px]
    color: "#1ba672", // text-[#1ba672]
    // shadow-none - not applicable
  },
});

export default AddToCartCounter;
