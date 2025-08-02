import { Minus, Plus } from "lucide-react-native";
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
  useGetCartItemsQuery,
  useUpdateCartItemMutation,
} from "@/services/cart/cartAPI";
import { useAppSelector } from "@/store/hook";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { Product } from "@/services/product/productApi.type";
import ProductVariantBottomSheet from "../bottomsheet/ProductVariantBottomSheet";
import { LoginDialog } from "../dialog/LoginDialog";

export interface TriggerProductVariantBottomSheetProps {
  product: Product;
}

const TriggerProductVariantBottomSheet = ({
  product,
}: TriggerProductVariantBottomSheetProps) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: cartData = { data: [] } } = useGetCartItemsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [updateCartItem, { isLoading: isUpdatingCart }] =
    useUpdateCartItemMutation();

  let totalProductsInCart = 0;
  let variantsOfThisProductInCart = 0;

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

  const buttonBaseStyle = [styles.counterButtonBase, styles.addOutlineButton];
  const buttonTextStyle = styles.addOutlineButtonText;

  const AddButton = () => (
    <TouchableOpacity
      style={[
        buttonBaseStyle,
        { borderColor: colors.border, backgroundColor: colors.cardBackground },
      ]}
      onPress={() => setIsBottomSheetOpen(true)}
    >
      <Text style={[buttonTextStyle, { color: colors.accent }]}>Add</Text>
    </TouchableOpacity>
  );

  const MinusButton = () => (
    <TouchableOpacity
      onPress={
        hasMultipleVariantsInCart
          ? () => setIsBottomSheetOpen(true)
          : () => handleDecreaseProductQuantity(product.id)
      }
      style={[
        styles.counterButtonSide,
        styles.leftRounded,
        isUpdatingCart && styles.disabledCounterButton,
        { backgroundColor: colors.cardBackground },
      ]}
      disabled={isUpdatingCart}
    >
      {isUpdatingCart ? (
        <ActivityIndicator size="small" color={colors.success} />
      ) : (
        <Minus size={16} color={colors.success} />
      )}
    </TouchableOpacity>
  );

  const PlusButton = () => (
    <TouchableOpacity
      onPress={() => setIsBottomSheetOpen(true)}
      style={[
        styles.counterButtonSide,
        styles.rightRounded,
        isUpdatingCart && styles.disabledCounterButton,
        { backgroundColor: colors.cardBackground },
      ]}
      disabled={isUpdatingCart}
    >
      {isUpdatingCart ? (
        <ActivityIndicator size="small" color={colors.success} />
      ) : (
        <Plus size={16} color={colors.success} />
      )}
    </TouchableOpacity>
  );

  const QuantityDisplay = () => (
    <TouchableOpacity
      onPress={() => setIsBottomSheetOpen(true)}
      style={styles.quantityDisplayContainer}
    >
      <Text style={[styles.quantityDisplayText, { color: colors.success }]}>
        {totalProductsInCart}
      </Text>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <TouchableOpacity
        style={[
          buttonBaseStyle,
          {
            borderColor: colors.border,
            backgroundColor: colors.cardBackground,
          },
        ]}
        onPress={() => setIsLoginDialogOpen(true)}
      >
        <Text style={[buttonTextStyle, { color: colors.accent }]}>Add</Text>
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
        <View style={[styles.counterGroup, { borderColor: colors.border }]}>
          <MinusButton />
          <QuantityDisplay />
          <PlusButton />
        </View>
      )}

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
    width: "100%",
    alignItems: "center",
  },
  counterButtonBase: {
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
  counterGroup: {
    flexDirection: "row",
    height: "auto",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  counterButtonSide: {
    height: "100%",
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  leftRounded: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightRounded: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.35,
  },
  quantityDisplayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityDisplayText: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0.35,
  },
  disabledCounterButton: {
    opacity: 0.5,
  },
});

export default TriggerProductVariantBottomSheet;
