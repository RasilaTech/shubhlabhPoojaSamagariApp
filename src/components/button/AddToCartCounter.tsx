import { Minus, Plus } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { useAppSelector } from "@/store/hook";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

import type { CartItem } from "@/services/cart/cartApi.type";
import type { ProductVariant } from "@/services/product/productApi.type";
import { LoginDialog } from "../dialog/LoginDialog";

export interface AddToCartCounterProps {
  productVariant: ProductVariant;
}

const AddToCartCounter = ({ productVariant }: AddToCartCounterProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const { data: cartData = { data: [] }, isFetching: isFetchingCart } =
    useGetCartItemsQuery(undefined, {
      skip: !isAuthenticated,
    });

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
      <View>
        <TouchableOpacity
          style={[
            styles.baseButton,
            styles.addOutlineButton,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowLoginDialog(true)}
          disabled={showLoading}
        >
          {showLoading ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text
              style={[styles.addOutlineButtonText, { color: colors.accent }]}
            >
              Add
            </Text>
          )}
        </TouchableOpacity>
        <Modal
          visible={showLoginDialog}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLoginDialog(false)}
        >
          <LoginDialog
            isVisible={showLoginDialog}
            onClose={() => setShowLoginDialog(false)}
          />
        </Modal>
      </View>
    );
  }

  return quantity === 0 ? (
    <TouchableOpacity
      style={[
        styles.baseButton,
        styles.addOutlineButton,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
      onPress={() => handleAddItemToCart(productVariant.id)}
      disabled={showLoading}
    >
      {showLoading ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <Text style={[styles.addOutlineButtonText, { color: colors.accent }]}>
          Add
        </Text>
      )}
    </TouchableOpacity>
  ) : (
    <View
      style={[
        styles.counterContainer,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        style={styles.counterButton}
        onPress={() => handleDecreaseProductQuantity(productVariant.id)}
        disabled={showLoading}
      >
        <Minus size={16} color={colors.success} />
      </TouchableOpacity>

      <View style={styles.quantityDisplay}>
        {showLoading ? (
          <ActivityIndicator size="small" color={colors.success} />
        ) : (
          <Text style={[styles.quantityText, { color: colors.success }]}>
            {quantity}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.counterButton}
        onPress={() => handleIncreaseProductQuantity(productVariant.id)}
        disabled={showLoading}
      >
        <Plus size={16} color={colors.success} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: "auto",
    width: "100%",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addOutlineButton: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addOutlineButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: -0.35,
  },
  counterContainer: {
    flexDirection: "row",
    height: "auto",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  counterButton: {
    height: "100%",
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityDisplay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0.35,
  },
});

export default AddToCartCounter;
