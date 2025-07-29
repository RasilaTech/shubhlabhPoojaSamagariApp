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
import { useGetCategoriesInfiniteQuery } from "@/services/category/categoryApi";
import { Category } from "@/services/category/categoryApi.type"; // Ensure Category type is correctly imported

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
    // isFetching, // Not directly used in rendering logic here
  } = useGetCategoriesInfiniteQuery({
    limit: 10,
  });

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const allCategories: Category[] = categoriesData.pages.flatMap(
    (page) => page.data
  );

  // --- Start of the fix for odd numbers ---
  const numColumns = 2; // Define your number of columns here

  // Calculate if we need to add a dummy item
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
      ] // Add a dummy item
    : allCategories;
  // --- End of the fix ---

  const loadMoreCategories = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  const renderCategoryItem = useCallback(({ item }: { item: Category }) => {
    // If it's the dummy item, render an empty, invisible view
    if (item.id === "dummy") {
      return <View style={styles.hiddenDummyItem} />;
    }
    // Otherwise, render the actual CategoryCard
    return <CategoryCard category={item} />;
  }, []);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#0000ff" />
        <Text style={styles.loadingText}>Loading more categories...</Text>
      </View>
    );
  };

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
        <Text style={styles.messageText}>Loading categories...</Text>
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
        <Text style={styles.messageText}>No categories found.</Text>
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
        data={dataForGrid} // Use the modified data array
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreCategories}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        numColumns={numColumns} // Use the defined numColumns
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 14,
  },
  headingText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a202c", // Darker text for heading
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
    color: "#555",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
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
    justifyContent: "space-between",
    marginBottom: 8,
  },
  hiddenDummyItem: {
    flex: 1, // Crucial for it to take up space like a real item
    marginHorizontal: 4, // Match the margin of your CategoryCard if any
    height: 0, // Make it invisible
    width: 0, // Make it invisible
  },
});
