import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetCartItemsQuery } from "@/services/cart/cartAPI";
import type { ProductVariant } from "@/services/product/productApi.type";
import { useAppSelector } from "@/store/hook";
import AddToCartCounter from "../button/AddToCartCounter";
import SoldOutBadge from "../button/SoldButton";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { X } from "lucide-react-native";

const screenHeight = Dimensions.get("window").height;

export interface ProductVaraintBottomSheetProps {
  productVariants: ProductVariant[];
  isVisible: boolean;
  onClose: () => void;
}

const ProductVariantBottomSheet = ({
  productVariants,
  isVisible,
  onClose,
}: ProductVaraintBottomSheetProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const { data: cartData = { data: [] } } = useGetCartItemsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const mainProductName = productVariants[0]?.name || "Select Variant";
  const productId = productVariants[0]?.product_id;

  const valueOfProductInCart = cartData.data.reduce((acc, item) => {
    if (item.variant.product_id === productId) {
      return acc + item.quantity * item.variant.price;
    }
    return acc;
  }, 0);

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.bottomSheetContent,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text
              style={[styles.headerTitle, { color: colors.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {mainProductName}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: colors.background },
              ]}
            >
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Variants List */}
          <ScrollView
            style={styles.variantsScrollView}
            contentContainerStyle={styles.variantsScrollViewContent}
          >
            {productVariants.map((variant) => (
              <View
                key={variant.id}
                style={[
                  styles.variantItem,
                  variant.out_of_stock === true && styles.outOfStockOpacity,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    shadowColor: colors.text,
                  },
                ]}
              >
                {/* Left section with image and label */}
                <View style={styles.variantItemLeft}>
                  <Image
                    source={{ uri: variant.images[0] }}
                    alt={variant.name}
                    style={[
                      styles.variantImage,
                      { borderColor: colors.border },
                    ]}
                    resizeMode="cover"
                  />
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={[
                      styles.variantLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {variant.display_label}
                  </Text>
                </View>

                {/* Vertical Separator */}
                <View
                  style={[
                    styles.verticalSeparator,
                    { backgroundColor: colors.border },
                  ]}
                />

                {/* Right section with price and button */}
                <View style={styles.variantItemRight}>
                  {/* Price Group (Price & MRP) */}
                  <View style={styles.variantPriceGroup}>
                    <Text style={[styles.variantPrice, { color: colors.text }]}>
                      ₹{variant.price.toLocaleString("en-IN")}
                    </Text>
                    {variant.price < variant.mrp && (
                      <Text
                        style={[
                          styles.variantMrp,
                          { color: colors.textSecondary },
                        ]}
                      >
                        ₹{variant.mrp.toLocaleString("en-IN")}
                      </Text>
                    )}
                  </View>

                  {/* Action Button */}
                  <View style={styles.variantActionButtonWrapper}>
                    {variant.out_of_stock === true ? (
                      <SoldOutBadge />
                    ) : (
                      <AddToCartCounter productVariant={variant} />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.confirmButton,
                { backgroundColor: colors.success },
              ]}
            >
              <View style={styles.confirmButtonLeft}>
                <Text style={styles.totalText}>item total :</Text>
                <Text style={styles.totalValue}>
                  ₹{valueOfProductInCart.toLocaleString("en-IN")}
                </Text>
              </View>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: "column",
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    maxHeight: screenHeight * 0.8,
    width: "100%",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "600",
    letterSpacing: -0.45,
    flexShrink: 1,
    minWidth: 0,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    borderRadius: 12,
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  variantsScrollView: {
    maxHeight: 350,
  },
  variantsScrollViewContent: {
    flexDirection: "column",
    gap: 8,
    paddingBottom: 10,
  },
  variantItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 60,
    overflow: "hidden",
  },
  outOfStockOpacity: {
    opacity: 0.5,
  },
  variantItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  variantImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    resizeMode: "cover",
    flexShrink: 0,
  },
  variantLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: -0.2,
    minWidth: 0,
  },
  verticalSeparator: {
    width: 1,
    height: "100%",
    marginHorizontal: 12,
    flexShrink: 0,
  },
  variantItemRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    flexShrink: 0,
    flexGrow: 0,
    minWidth: 0,
  },
  variantPriceGroup: {
    flexDirection: "column",
    alignItems: "flex-end",
    flexShrink: 0,
    flexGrow: 0,
    minWidth: 50,
  },
  variantPrice: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  variantMrp: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.2,
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  variantActionButtonWrapper: {
    width: 80,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    flexGrow: 0,
  },
  footer: {
    paddingTop: 12,
  },
  confirmButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  confirmButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: "white",
  },
  totalValue: {
    marginLeft: 8,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: "white",
  },
  confirmText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: "white",
  },
});

export default ProductVariantBottomSheet;
