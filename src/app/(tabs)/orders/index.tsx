import OrderCard from "@/components/card/OrderCard"; // Make sure this path is correct and points to the React Native OrderCard
import { useGetOrdersInfiniteQuery } from "@/services/orders/orderApi"; // Make sure this path is correct
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

// Import types for clarity, adjust path if needed based on your project structure
import OrderErrorScreen from "@/components/error/OrderErrorScree";
import type { OrderDetail } from "@/services/orders/orderApi.type";

const Orders = () => {
  // const { isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    data: infiniteOrdersData = {
      pages: [
        {
          data: [],
        },
      ],
    },
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage, // Added to check if there are more pages to fetch
    isFetchingNextPage,
    isFetching, // Indicates any fetching, including initial load
  } = useGetOrdersInfiniteQuery({ limit: 30 }); // Adjusted limit for better pagination testing

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const allOrders: OrderDetail[] = infiniteOrdersData.pages.flatMap(
    (page) => page.data
  );

  // Function to load more data when the end of the list is reached
  const loadMoreOrders = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  // Render item for FlatList
  const renderOrderItem = useCallback(
    ({ item }: { item: OrderDetail }) => <OrderCard order={item} />,
    []
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#0000ff" />
        <Text style={styles.loadingText}>Loading more orders...</Text>
      </View>
    );
  };

  if (isLoading && allOrders.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  // if (!isAuthenticated) {
  //   return (
  //     <View style={[styles.container, styles.centerContent]}>
  //       <Text style={styles.noOrdersText}>Please Login to View orders</Text>
  //     </View>
  //   );
  // }

  // if (isError) {
  //   return <OrderErrorScreen />;
  // }

  if (allOrders.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.noOrdersText}>You dont have any orders yet.</Text>
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
      <Text style={styles.headingText}>My Orders</Text>
      <FlatList
        data={allOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreOrders} // Trigger when the end of the list is reached
        onEndReachedThreshold={0.5} // When to trigger onEndReached (0.5 means when 50% of the list is visible)
        ListFooterComponent={renderFooter} // Component to show at the bottom (e.g., loading indicator)
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false} // Hide scroll indicator if desired
      />
    </View>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headingText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a202c", // Darker text for heading
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  flatListContent: {
    paddingHorizontal: 15,
    paddingBottom: 20, // Add some padding at the bottom of the list
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
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  noOrdersText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
});
