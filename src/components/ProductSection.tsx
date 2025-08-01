import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Product } from "@/services/product/productApi.type";
import { router } from "expo-router";
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

const NoProductFoundIcon = require("../../../assets/images/no_products.png");

const screenWidth = Dimensions.get("window").width;
const AVAILABLE_PRODUCT_WIDTH = screenWidth * 0.8 - 8; // 80% minus padding
const ITEM_GAP = 8; // 2 * 4 = 8px total gap (4px on each side)
const HORIZONTAL_PADDING = 12;
const ITEM_WIDTH =
  (AVAILABLE_PRODUCT_WIDTH - HORIZONTAL_PADDING * 2 - ITEM_GAP) / 2;

export const ProductSection = ({
  productData,
  totalProuducts,
  onLoadMore,
  isFetching,
  isLoadingMore = false,
}: ProductSectionProps) => {
  const renderProductItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <View
        style={[
          styles.productItemWrapper,
          {
            marginRight: index % 2 === 0 ? ITEM_GAP / 2 : 0,
            marginLeft: index % 2 === 1 ? ITEM_GAP / 2 : 0,
          },
        ]}
      >
        <ProductItem2 product={item} />
      </View>
    ),
    []
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#ff5200" />
        <Text style={styles.loadingText}>Loading more products...</Text>
      </View>
    );
  };

  // Condition for initial loading
  if (isFetching && !isLoadingMore && productData.length === 0) {
    return (
      <View style={styles.container}>
        <OrderDetailSkeleton />
      </View>
    );
  }

  // Condition for no products found
  if (productData.length === 0) {
    return (
      <View style={styles.container}>
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
      {/* Product count header */}
      <View style={styles.productCountHeader}>
        <Text style={styles.productCountText}>
          <Text style={styles.productCountBold}>{totalProuducts} items</Text>{" "}
          found
        </Text>
      </View>

      {/* Product Grid */}
      <View style={styles.productListContainer}>
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
    backgroundColor: "white",
  },
  productCountHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(40, 44, 63, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productCountText: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: -0.35,
    color: "rgba(2, 6, 12, 0.75)",
  },
  productCountBold: {
    fontWeight: "600",
    color: "rgba(2, 6, 12, 0.9)",
  },
  productListContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingVertical: 12,
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 8, // Vertical gap between rows
  },
  productItemWrapper: {
    width: ITEM_WIDTH,
    marginBottom: 8, // Consistent bottom margin for each item
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
    color: "#666",
    fontWeight: "400",
  },
});
