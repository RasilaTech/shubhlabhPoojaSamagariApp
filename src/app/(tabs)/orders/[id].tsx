import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DelhiveryDetailCard from "@/components/card/DelhiveryDetailCard";
import { OrderDetailMainCard } from "@/components/card/OrderDetailMainCard";
import { OrderItemSummaryCard } from "@/components/card/OrderItemSummaryCard";
import PaymentSummaryCard from "@/components/card/PaymentSummaryCard";
import OrderErrorScreen from "@/components/error/OrderErrorScree";
import OrderDetailSkeleton from "@/components/skeletons/OrderSkeleton";

import { useGetOrderByIdQuery } from "@/services/orders/orderApi";
import { AllOrderDetail } from "@/services/orders/orderApi.type";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

export default function OrderDetailScreen() {
  const { id: orderId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const {
    data: orderDetailsResponse = { data: null },
    isError,
    isLoading,
    isFetching,
  } = useGetOrderByIdQuery(orderId!, {
    skip: !orderId,
  });

  const orderDetails: AllOrderDetail | null = orderDetailsResponse.data;

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.cardBackground, shadowColor: colors.text },
        ]}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.headerTitle, { color: colors.text }]}
        >
          Order Details
        </Text>
      </View>
      {isLoading || isFetching ? (
        <OrderDetailSkeleton />
      ) : isError || orderDetails === null ? (
        <OrderErrorScreen />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainContent}>
            <View style={styles.leftColumn}>
              <OrderDetailMainCard orderDetails={orderDetails} />
              <OrderItemSummaryCard orderDetails={orderDetails} />
            </View>
            <View style={styles.rightColumn}>
              <DelhiveryDetailCard orderAddress={orderDetails.order_address} />
              <PaymentSummaryCard orderDetails={orderDetails} />
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  mainContent: {
    flexDirection: "column",
    gap: 16,
    flex: 1,
  },
  leftColumn: {
    flexDirection: "column",
    gap: 16,
    flex: 7,
  },
  rightColumn: {
    flexDirection: "column",
    gap: 16,
    flex: 5,
  },
});
