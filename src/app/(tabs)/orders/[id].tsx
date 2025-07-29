// app/(tabs)/orders/[id].tsx
import DelhiveryDetailCard from "@/components/card/DelhiveryDetailCard";
import OrderDetailMainCard from "@/components/card/OrderDetailMainCard";
import OrderItemSummaryCard from "@/components/card/OrderItemSummaryCard";
import PaymentSummaryCard from "@/components/card/PaymentSummaryCard";
import OrderErrorScreen from "@/components/error/OrderErrorScree";
import OrderDetailSkeleton from "@/components/skeletons/OrderSkeleton";
import { useGetOrderByIdQuery } from "@/services/orders/orderApi";
import { AllOrderDetail } from "@/services/orders/orderApi.type";
import { router, useLocalSearchParams } from "expo-router"; // Use router and useLocalSearchParams
import { ChevronLeft } from "lucide-react-native"; // Assuming lucide-react-native
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrderDetailScreen() {
  // Renamed to default export for file-based routing
  const { id: orderId } = useLocalSearchParams<{ id: string }>(); // Get dynamic ID from URL

  const {
    data: orderDetailsResponse = { data: null }, // Initialize with a structure that matches your API response
    isError,
    isLoading,
    isFetching,
  } = useGetOrderByIdQuery(orderId!, {
    skip: !orderId, // Skip query if orderId is not available yet
  });

  // Extract orderDetails data from the response structure
  const orderDetails: AllOrderDetail | null = orderDetailsResponse.data;

  // Handle back navigation
  const handleGoBack = () => {
    router.back();
  };
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#02060cbf" />
        </TouchableOpacity>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>
          Order Details
        </Text>
      </View>
      {/* Conditional Rendering for Loading, Error, Data */}
      {isLoading || isFetching ? (
        <OrderDetailSkeleton />
      ) : isError || orderDetails === null ? (
        <OrderErrorScreen />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Content Area */}
          <View style={styles.mainContent}>
            {/* Left Column (flex-7) */}
            <View style={styles.leftColumn}>
              <OrderDetailMainCard orderDetails={orderDetails} />
              <OrderItemSummaryCard orderDetails={orderDetails} />
            </View>
            {/* Right Column (flex-5) */}
            <View style={styles.rightColumn}>
              <DelhiveryDetailCard orderAddress={orderDetails.order_address} />
              <PaymentSummaryCard orderDetails={orderDetails} />
            </View>
          </View>
        </ScrollView>
      )}
      {/* Fixed Bottom Banner */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    marginBottom: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    shadowColor: "#000", // shadow-cart-card (approx)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4, // Android shadow
  },
  backButton: {
    paddingRight: 10, // gap-2 from original
  },
  headerTitle: {
    flex: 1, // Allow title to take remaining space
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: "#02060cbf",
  },
  scrollContent: {
    flexGrow: 1, // Allows content to grow within ScrollView
    paddingHorizontal: 16, // px-4
    paddingVertical: 24, // py-6
    // sm:px-8 for larger screens would need Dimensions API and conditional styling
  },
  mainContent: {
    flexDirection: "column", // Default for small screens (sm:flex-row)
    gap: 16, // gap-4
    flex: 1, // Ensure content takes available space
    // For sm:flex-row, you'd use Dimensions or a ResponsiveLayout component
    // Example for larger screens (if you want to implement responsive columns):
    // If (screenWidth > 600) { flexDirection: 'row' }
  },
  leftColumn: {
    flexDirection: "column",
    gap: 16, // gap-4
    flex: 7, // sm:flex-7 (needs a parent with flexDirection: 'row')
  },
  rightColumn: {
    flexDirection: "column",
    gap: 16, // gap-4
    flex: 5, // sm:flex-5 (needs a parent with flexDirection: 'row')
  },
});
