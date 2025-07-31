import { Minus, Plus, ShoppingCart } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useAddToCartMutation,
  useGetCartItemsQuery,
  useUpdateCartItemMutation,
} from "@/services/cart/cartAPI";

import { CartItem } from "@/services/cart/cartApi.type";
import { ProductVariant } from "@/services/product/productApi.type";
import { useAppSelector } from "@/store/hook";
import { LoginDialog } from "../dialog/LoginDialog";

export interface AddToCartCounterProps {
  productVariant: ProductVariant;
}

const ProductDetailCartButton = ({ productVariant }: AddToCartCounterProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [showLoginDialog, setShowLoginDialog] = useState(false);

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
    if (isAddingToCart) return;
    try {
      await addCartItem({ product_variant_id: productId }).unwrap();
    } catch (error: any) {
      console.error("Failed to add item to cart:", error);
      Alert.alert(
        "Error",
        error?.data?.message || "Failed to add item to cart."
      );
    }
  };

  const handleDecreaseProductQuantity = async (productId: string) => {
    if (isUpdatingCart) return;

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
    if (isUpdatingCart) return;
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

  const showLoading = isAddingToCart || isUpdatingCart || isFetchingCart;

  if (!isAuthenticated) {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.gradientButton}
          onPress={() => setShowLoginDialog(true)}
          disabled={showLoading}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            {showLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <ShoppingCart size={18} color="white" />
                <Text style={styles.gradientButtonText}>Add to Cart</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <LoginDialog
          isVisible={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
        />
      </View>
    );
  }

  return quantity === 0 ? (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.gradientButton}
        onPress={() => handleAddItemToCart(productVariant.id)}
        disabled={showLoading}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          {showLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <ShoppingCart size={18} color="white" />
              <Text style={styles.gradientButtonText}>Add to Cart</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.buttonContainer}>
      <View style={styles.counterContainer}>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => handleDecreaseProductQuantity(productVariant.id)}
          disabled={showLoading}
        >
          <Minus size={16} color="#1ba672" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  // Fixed container with consistent height
  buttonContainer: {
    width: "100%",
    height: 48, // Fixed height to prevent expansion
  },

  gradientButton: {
    flex: 1, // Take full container height
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#f97316",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24, // Minimum height for content consistency
  },

  gradientButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginLeft: 8,
  },

  counterContainer: {
    flex: 1, // Take full container height
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(2, 6, 12, 0.15)",
    overflow: "hidden",
  },

  counterButton: {
    height: "100%", // Full height of container
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44, // Minimum touch target
  },

  quantityDisplay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24, // Consistent minimum height
  },

  quantityText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0.35,
    color: "#1ba672",
  },
});

export default ProductDetailCartButton;
