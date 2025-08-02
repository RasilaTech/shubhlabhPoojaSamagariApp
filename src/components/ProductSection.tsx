import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import type { Product } from "@/services/product/productApi.type";
import ProductItem2 from "./card/ProductItem2";
import EmptyScreen from "./empty/EmptyScreen";
import OrderDetailSkeleton from "./skeletons/OrderSkeleton";

export interface ProductSectionProps {
  productData: Product[];
  totalProuducts: number;
  onLoadMore: () => void;
  isFetching: boolean;
  isLoadingMore?: boolean;
}

const NoProductFoundIcon = require("../../assets/images/no-products.png");

const screenWidth = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 16;
const ITEM_GAP = 8;
const AVAILABLE_PRODUCT_WIDTH = screenWidth * 0.8 - HORIZONTAL_PADDING * 2;
const ITEM_WIDTH = (AVAILABLE_PRODUCT_WIDTH - ITEM_GAP) / 2;

export const ProductSection = ({
  productData,
  totalProuducts,
  onLoadMore,
  isFetching,
  isLoadingMore = false,
}: ProductSectionProps) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={styles.productItemWrapper}>
        <ProductItem2 product={item} />
      </View>
    ),
    []
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more products...
        </Text>
      </View>
    );
  };

  if (isFetching && !isLoadingMore && productData.length === 0) {
    return (
      <View style={styles.container}>
        <OrderDetailSkeleton />
      </View>
    );
  }

  if (productData.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.cardBackground }]}
      >
        <EmptyScreen
          imageSrc={NoProductFoundIcon}
          title={"No Products Found"}
          showBackArrow={false}
          subtitle={""}
          buttonText={"Browse other Products"}
          onButtonClick={function (): void {
            router.push({ pathname: "/" });
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.productCountHeader,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            shadowColor: colors.textSecondary,
          },
        ]}
      >
        <Text
          style={[styles.productCountText, { color: colors.textSecondary }]}
        >
          <Text style={[styles.productCountBold, { color: colors.text }]}>
            {totalProuducts} items{" "}
          </Text>
          found
        </Text>
      </View>

      <View
        style={[
          styles.productListContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <FlatList
          data={productData}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.flatListContent}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          style={styles.flatList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productCountHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productCountText: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: -0.35,
  },
  productCountBold: {
    fontWeight: "600",
  },
  productListContainer: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingVertical: 12,
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 8,
  },
  productItemWrapper: {
    width: ITEM_WIDTH,
    marginBottom: 8,
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "400",
  },
});
