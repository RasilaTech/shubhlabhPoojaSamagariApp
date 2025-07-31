import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

import OrderErrorScreen from "@/components/error/OrderErrorScree";
import NavBar from "@/components/nav/NavBar";
import { ProductSection } from "@/components/ProductSection";
import OrderDetailSkeleton from "@/components/skeletons/OrderSkeleton";
import { SubCategorySideBar } from "@/components/SubCategorySideBar";
import { useGetCategoryByIdQuery } from "@/services/category/categoryApi";
import { useGetProductsInfiniteQuery } from "@/services/product/productApi";
import { useGetSubCategoriesInfiniteQuery } from "@/services/sub-category/subCategoryApi";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.2; // About 28% of screen width
const PRODUCT_SECTION_WIDTH = width * 0.8; // About 72% of screen width

export default function SubCategoriesWithProductScreen() {
  const { id: initialCategoryId = "" } = useLocalSearchParams<{ id: string }>();
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(initialCategoryId);

  // API Queries
  const {
    data: categoryData = {
      data: {
        id: "",
        name: "",
        image: "",
        parent_id: null,
        createdAt: "",
        updatedAt: "",
        priority: 0,
      },
    },
    isLoading: catLoading,
    isError: catError,
  } = useGetCategoryByIdQuery(initialCategoryId, { skip: !initialCategoryId });

  const {
    data: subCategoryInfiniteData = { pages: [{ data: [] }] },
    isLoading: subCatLoading,
    isError: subCatError,
    fetchNextPage: fetchNextSubCategoryPage,
    hasNextPage: hasNextSubCategoryPage,
    isFetchingNextPage: isFetchingNextSubCategoryPage,
  } = useGetSubCategoriesInfiniteQuery({
    parent_ids: initialCategoryId,
    sort_by: "priority",
    sort_order: "DESC",
  });

  const subCategoryData = subCategoryInfiniteData.pages.flatMap(
    (page) => page.data
  );

  const {
    data: infiniteProductData,
    isLoading: productLoading,
    isError: productError,
    fetchNextPage: fetchNextProductPage,
    isFetchingNextPage: isFetchingNextProductPage,
    isFetching: isAnyProductFetching,
  } = useGetProductsInfiniteQuery({
    category_id: selectedCategoryId,
    limit: 30,
  });

  const allProducts =
    infiniteProductData?.pages.flatMap((page) => page.data) || [];
  const totalProducts = infiniteProductData?.pages[0]?.meta?.totalItems || 0;
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  // Handlers
  const handleUpdateCategory = (newCategoryId: string) => {
    setSelectedCategoryId(newCategoryId);
  };

  // Loading/Error States
  const isLoadingOverall = catLoading || subCatLoading || productLoading;
  const isErrorOverall = catError || subCatError || productError;

  if (isLoadingOverall) {
    return <OrderDetailSkeleton />;
  }

  if (isErrorOverall) {
    return <OrderErrorScreen />;
  }

  if (!categoryData.data.id && allProducts.length === 0) {
    return <OrderErrorScreen />;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: tabBarHeight,
        },
      ]}
    >
      <NavBar />

      <View style={styles.contentLayout}>
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          <SubCategorySideBar
            selectedCategoryId={selectedCategoryId}
            categoryData={categoryData.data}
            subCategoryData={subCategoryData}
            handleUpdateCategory={handleUpdateCategory}
          />
        </View>

        {/* Right Product Section */}
        <View style={styles.productSectionWrapper}>
          <ProductSection
            productData={allProducts}
            totalProuducts={totalProducts}
            onLoadMore={fetchNextProductPage}
            isFetching={isAnyProductFetching}
            isLoadingMore={isFetchingNextProductPage}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
  },
  contentLayout: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  sidebar: {
    flex: 0.2, // 20% of available space
    backgroundColor: "white",
    borderTopRightRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    overflow: "hidden",
  },
  productSectionWrapper: {
    flex: 0.8, // 80% of available space
    backgroundColor: "white",
    borderTopLeftRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: -1, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    overflow: "hidden",
  },
});
