import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CategoryCard from "@/components/card/CategoryCard";
import { darkColors, lightColors } from "@/constants/ThemeColors"; // <-- Import color palettes
import { useTheme } from "@/hooks/useTheme"; // <-- Import useTheme hook
import { useGetCategoriesInfiniteQuery } from "@/services/category/categoryApi";
import { Category } from "@/services/category/categoryApi.type";

const Categories = () => {
  const {
    data: categoriesData = {
      pages: [
        {
          data: [],
          meta: {
            totalItems: 0,
            totalPages: 0,
            currentPage: 0,
            pageSize: 0,
          },
        },
      ],
    },
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetCategoriesInfiniteQuery({
    limit: 10,
  });

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const allCategories: Category[] = categoriesData.pages.flatMap(
    (page) => page.data
  );

  const numColumns = 2;

  const needsDummyItem = allCategories.length % numColumns !== 0;

  const dataForGrid = needsDummyItem
    ? [
        ...allCategories,
        {
          id: "dummy",
          name: "",
          image: "",
          priority: 0,
          parent_id: null,
          createdAt: "",
          updatedAt: "",
        },
      ]
    : allCategories;

  const loadMoreCategories = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  const renderCategoryItem = useCallback(({ item }: { item: Category }) => {
    // FIX: Only render CategoryCard if it's not the dummy item
    if (item.id === "dummy") {
      return <View style={styles.hiddenDummyItem} />;
    }
    return <CategoryCard category={item} />;
  }, []);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more categories...
        </Text>
      </View>
    );
  };

  if (isLoading && allCategories.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top, backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.messageText, { color: colors.textSecondary }]}>
          Loading categories...
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
          { paddingTop: insets.top, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.destructive }]}>
          Error fetching categories. Please try again later.
        </Text>
      </View>
    );
  }

  if (allCategories.length === 0 && !isLoading && !isFetchingNextPage) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.messageText, { color: colors.textSecondary }]}>
          No categories found.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: tabBarHeight,
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text style={[styles.headingText, { color: colors.text }]}>
        Categories
      </Text>
      <FlatList
        data={dataForGrid}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreCategories}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },
  headingText: {
    fontSize: 26,
    fontWeight: "bold",
    paddingHorizontal: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
  },
  noCategoriesText: {
    fontSize: 16,
    textAlign: "center",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 8,
  },
  hiddenDummyItem: {
    flex: 1,
    marginHorizontal: 4,
    height: 0,
    width: 0,
  },
});
