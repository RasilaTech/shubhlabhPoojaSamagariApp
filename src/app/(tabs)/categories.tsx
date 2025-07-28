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

// Import your CategoryCard component and Category interface
import { useGetCategoriesInfiniteQuery } from "@/services/category/categoryApi"; // Adjust this path if needed
import CategoryCard from "@/components/card/CategoryCard"; // Adjust this path if needed
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
    isFetching,
  } = useGetCategoriesInfiniteQuery({
    limit: 10, // Adjusted limit for better testing/demonstration of pagination
  });

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  // Combine all categories from all pages into a single flat array
  const allCategories: Category[] = categoriesData.pages.flatMap(
    (page) => page.data
  );

  // Function to load more data when the end of the list is reached
  const loadMoreCategories = useCallback(() => {
    // Only fetch next page if not already fetching and there is a next page
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  // Render item for FlatList - using CategoryCard
  const renderCategoryItem = useCallback(
    ({ item }: { item: Category }) => <CategoryCard category={item} />,
    []
  );

  // Render footer for loading indicator during pagination
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#0000ff" />
        <Text style={styles.loadingText}>Loading more categories...</Text>
      </View>
    );
  };

  // --- Conditional Rendering for initial states ---
  if (isLoading && allCategories.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top },
        ]}
      >
        <Text style={styles.errorText}>
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
          { paddingTop: insets.top },
        ]}
      >
        <Text style={styles.noCategoriesText}>No categories found.</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: tabBarHeight },
      ]}
    >
      <Text style={styles.headingText}>Categories</Text>
      <FlatList
        data={allCategories} // Corrected: use allCategories
        renderItem={renderCategoryItem} // Corrected: use renderCategoryItem
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreCategories} // Corrected: use loadMoreCategories
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        numColumns={2} // Added for a grid layout with 2 columns
        columnWrapperStyle={styles.row} // For styling rows in a grid
      />
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
    paddingHorizontal: 14,
  },
  headingText: {
    fontSize: 24,
    fontFamily: "outfit-medium",
    color: "#02060C",
    marginBottom: 16,
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
    color: "#555",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1, // Ensure it takes full height for centering
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginHorizontal: 20,
  },
  noCategoriesText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  row: {
    // Styles for the wrapper of each row in a multi-column FlatList
    justifyContent: "space-between",
    marginBottom: 8, // Add space between rows
  },
});
