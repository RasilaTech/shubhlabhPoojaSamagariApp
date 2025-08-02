import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { Category } from "@/services/category/categoryApi.type";
import { useGetProductsInfiniteQuery } from "@/services/product/productApi";
import ProductItem from "./card/ProductItem";

interface TopCategoriesWithProductProps {
  category: Category;
}

const TopCategoriesWithProduct = ({
  category,
}: TopCategoriesWithProductProps) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const {
    data: productsInfiniteData = {
      pages: [
        {
          data: [],
        },
      ],
    },
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetProductsInfiniteQuery({
    category_id: category.id,
    limit: 10,
  });

  const products = productsInfiniteData.pages.flatMap((page) => page.data);

  const loadMoreProducts = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  const renderProductItem = useCallback(
    ({ item }: { item: any }) => <ProductItem product={item} key={item.id} />,
    []
  );

  const renderListFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more...
        </Text>
      </View>
    );
  };

  if (isLoading && products.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading products...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.destructive }]}>
          Failed to load products for {category.name}.
        </Text>
      </View>
    );
  }

  if (products.length === 0 && !isLoading && !isFetchingNextPage) {
    return <View></View>;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
    >
      <View style={styles.headingContainer}>
        <Text
          style={[styles.headingText, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {category.name.toUpperCase()}
        </Text>
        <LinearGradient
          colors={["rgba(2, 6, 12, 0.15)", "rgba(2, 6, 12, 0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.devider}
        />
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => {
            router.push({
              pathname: "/(tabs)/categories/[id]",
              params: { id: category.id },
            });
          }}
        >
          <Text style={[styles.seeAllButtonText, { color: colors.accent }]}>
            See All
          </Text>
          <ChevronRight size={13} color={colors.accent} strokeWidth={3} />
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderListFooter}
        contentContainerStyle={styles.productsFlatListContent}
      />
    </View>
  );
};

export default TopCategoriesWithProduct;

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    marginBottom: 24,
  },

  headingContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headingText: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 1.5,
    flexShrink: 1,
  },
  devider: {
    flex: 1,
    height: 1,
  },
  seeAllButton: {
    flexDirection: "row",
    gap: 1,
    alignItems: "center",
  },
  seeAllButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  productsFlatListContent: {
    marginTop: 12,
    paddingHorizontal: 16,
    gap: 8,
    paddingRight: 30,
  },
  loadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 150,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  noProductsText: {
    fontSize: 14,
    textAlign: "center",
  },
});
