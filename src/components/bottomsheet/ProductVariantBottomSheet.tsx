import React from "react";
import {
  Dimensions, // For screen dimensions
  Image, // For images
  Modal, // For the bottom sheet overlay
  Pressable, // For the dismissable overlay and non-closable content
  ScrollView, // For scrollable variants list
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetCartItemsQuery } from "@/services/cart/cartAPI"; // Adjust path
import type { ProductVariant } from "@/services/product/productApi.type"; // Adjust path
import { useAppSelector } from "@/store/hook"; // Corrected hook path, ensure it's accurate for your project (e.g., "@/store/hooks")
import AddToCartCounter from "../button/AddToCartCounter"; // Adjust path for your component
import SoldOutBadge from "../button/SoldButton"; // Adjust path for your component

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

  const { data: cartData = { data: [] } } = useGetCartItemsQuery(undefined, {
    // skip: !isAuthenticated,
  });

  // Ensure we have at least one variant before trying to access properties
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
          style={styles.bottomSheetContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1} // Ensures single line and truncation
              ellipsizeMode="tail" // Adds "..." at the end if it overflows
            >
              {mainProductName}
            </Text>
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
                ]}
              >
                {/* Left section with image and label */}
                <View style={styles.variantItemLeft}>
                  <Image
                    source={{ uri: variant.images[0] }}
                    alt={variant.name}
                    style={styles.variantImage}
                    resizeMode="cover"
                  />
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={styles.variantLabel}
                  >
                    {variant.display_label}
                  </Text>
                </View>

                {/* Vertical Separator */}
                <View style={styles.verticalSeparator} />

                {/* Right section with price and button */}
                <View style={styles.variantItemRight}>
                  {/* Price Group (Price & MRP) */}
                  <View style={styles.variantPriceGroup}>
                    <Text style={styles.variantPrice}>
                      ₹{variant.price.toLocaleString("en-IN")}
                    </Text>
                    {variant.price < variant.mrp && (
                      <Text style={styles.variantMrp}>
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
            <TouchableOpacity onPress={onClose} style={styles.confirmButton}>
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
    backgroundColor: "#fff",
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
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "600",
    letterSpacing: -0.45,
    color: "rgba(2, 6, 12, 0.75)",
    flexShrink: 1, // Allow text to shrink
    minWidth: 0, // Crucial for flexShrink to work
    textAlign: "center",
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
    alignItems: "center", // Vertically center items in the row
    justifyContent: "space-between", // Space between left, separator, and right
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 60,
    overflow: "hidden", // Prevent content from overflowing
  },
  outOfStockOpacity: {
    opacity: 0.5,
  },
  variantItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Allow this section to take available space
    gap: 8,
    minWidth: 0, // Allow text to truncate
    // height: 80, // Removed fixed height, let content define height
    // maxWidth: 140, // Removed, let flex handle distribution
  },
  variantImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    resizeMode: "cover",
    flexShrink: 0, // Don't let image shrink
  },
  variantLabel: {
    flex: 1, // Allow text to take remaining space and truncate
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: -0.2,
    color: "rgba(2, 6, 12, 0.75)",
    minWidth: 0, // Essential for `flex: 1` text wrapping/truncation
  },
  verticalSeparator: {
    width: 1,
    height: "100%", // Take full height of the parent variantItem
    backgroundColor: "#eee", // Light gray separator
    marginHorizontal: 12, // Space on both sides of the separator
    flexShrink: 0, // Prevent separator from shrinking
  },
  variantItemRight: {
    flexDirection: "row", // Keep price and button in a row
    alignItems: "center", // Vertically center price and button
    justifyContent: "flex-end", // Push items to the right
    gap: 8, // Gap between price group and action button
    flexShrink: 0, // Prevent this section from shrinking too much
    flexGrow: 0, // Prevent this section from growing unnecessarily
    minWidth: 0, // Allows content within it to potentially wrap if needed
  },
  variantPriceGroup: {
    flexDirection: "column", // Stack price and MRP
    alignItems: "flex-end", // Align prices to the right
    flexShrink: 0, // Prevent prices from shrinking
    flexGrow: 0, // Prevent prices from growing
    minWidth: 50, // Ensure minimum width for prices
  },
  variantPrice: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
    color: "rgba(2, 6, 12, 0.75)",
  },
  variantMrp: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.2,
    color: "rgba(2, 6, 12, 0.4)",
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  variantActionButtonWrapper: {
    width: 80, // Fixed width for the button/counter area
    height: 30, // Fixed height to ensure consistent sizing for AddToCartCounter/SoldOutBadge
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
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
    backgroundColor: "#1ba672",
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
