import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList, // Use FlatList instead of ScrollView
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Adjust paths based on your actual file structure
import { Category } from "@/services/category/categoryApi.type"; // Assuming src/scripts/category/categoryApi.type
import { useGetProductsInfiniteQuery } from "@/services/product/productApi"; // Assuming src/scripts/product/productApi
import ProductItem from "./card/ProductItem"; // Assuming ProductItem is in a sibling 'card' directory
import { router } from "expo-router";

interface TopCategoriesWithProductProps {
  category: Category;
}

const TopCategoriesWithProduct = ({
  category,
}: TopCategoriesWithProductProps) => {
  const {
    data: productsInfiniteData = {
      pages: [
        {
          data: [],
        },
      ],
    },
    isLoading, // Added isLoading for initial state
    isError, // Added isError for error handling
    fetchNextPage,
    hasNextPage, // Crucial for knowing if there are more pages
    isFetchingNextPage, // For showing loading indicator during pagination
  } = useGetProductsInfiniteQuery({
    category_id: category.id,
    limit: 10, // Adjusted limit for better pagination demonstration
  });

  const products = productsInfiniteData.pages.flatMap((page) => page.data);

  // Callback to load more products when the end of the list is reached
  const loadMoreProducts = useCallback(() => {
    // Only fetch next page if not already fetching and there is a next page
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  // Render function for each product item
  const renderProductItem = useCallback(
    ({ item }: { item: any }) => <ProductItem product={item} key={item.id} />,
    []
  );

  // Render function for the loading footer
  const renderListFooter = () => {
    if (!isFetchingNextPage) return null; // Only show if actively fetching next page
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#f97316" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  // Optional: Handle initial loading/error state if products are crucial for this component
  if (isLoading && products.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>
          Failed to load products for {category.name}.
        </Text>
      </View>
    );
  }

  // If there are no products even after loading, you might want to show a message
  if (products.length === 0 && !isLoading) {
    return <View></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <Text
          style={styles.headingText}
          numberOfLines={1} // Crucial: Restrict text to a single line
          ellipsizeMode="tail" // Add "..." at the end if it truncates
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
          <Text style={styles.seeAllButtonText}>See All</Text>
          <ChevronRight size={13} color="#f97316" strokeWidth={3} />
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal // Enable horizontal scrolling
        showsHorizontalScrollIndicator={false}
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        // Pagination props
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.1} // Trigger when 10% from the end is reached
        ListFooterComponent={renderListFooter}
        // Styles for the FlatList content
        contentContainerStyle={styles.productsFlatListContent}
      />
    </View>
  );
};

export default TopCategoriesWithProduct;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingTop: 16,
    marginBottom: 10, // Added some bottom margin to separate categories sections
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
    color: "black",
    letterSpacing: 1.5,
    flexShrink: 1, // Allow this text to shrink if container space is limited
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
    color: "#f97316",
    // fontFamily: "outfit-semibold", // Uncomment if loaded
    fontWeight: "600", // Fallback
  },
  productsFlatListContent: {
    marginTop: 12,
    paddingHorizontal: 16,
    gap: 8, // Use gap for spacing between items, works in newer RN versions
    paddingRight: 30, // Add some extra padding at the end of the horizontal list
  },
  loadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16, // Match main padding
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 150, // Give it some height for loading/error messages
  },
  errorText: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
  },
  noProductsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
