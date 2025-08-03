import OrderCard from "@/components/card/OrderCard";
import OrderErrorScreen from "@/components/error/OrderErrorScree";
import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { useGetOrdersInfiniteQuery } from "@/services/orders/orderApi";
import type { OrderDetail } from "@/services/orders/orderApi.type";
import { useAppSelector } from "@/store/hook";
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

const Orders = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

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
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useGetOrdersInfiniteQuery({ limit: 30 });

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const allOrders: OrderDetail[] = infiniteOrdersData.pages.flatMap(
    (page) => page.data
  );

  const loadMoreOrders = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  const renderOrderItem = useCallback(
    ({ item }: { item: OrderDetail }) => <OrderCard order={item} />,
    []
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading more orders...
        </Text>
      </View>
    );
  };

  if (isLoading && allOrders.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading your orders...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.noOrdersText, { color: colors.textSecondary }]}>
          Please Login to View orders
        </Text>
      </View>
    );
  }

  if (isError) {
    // You should probably pass the theme to your error screen as well
    return <OrderErrorScreen />;
  }

  if (allOrders.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.noOrdersText, { color: colors.textSecondary }]}>
          You dont have any orders yet.
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
      <View style={[styles.header, { shadowColor: colors.text }]}>
        <Text style={[styles.headingText, { color: colors.text }]}>
          My Orders
        </Text>
      </View>
      <FlatList
        data={allOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreOrders}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  headingText: {
    fontSize: 26,
    fontWeight: "bold",
  },
  flatListContent: {
    paddingHorizontal: 15,
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
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  noOrdersText: {
    fontSize: 16,
    textAlign: "center",
  },
});
