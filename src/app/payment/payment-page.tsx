import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { useVerifyPaymentMutation } from "@/services/orders/orderApi"; // Adjust path
import type {
  OrderData,
  RazorpayPaymentResponse,
} from "@/services/orders/orderApi.type"; // Adjust path
import { useGetUserDetailsQuery } from "@/services/user/userApi"; // Adjust path
import { router, useLocalSearchParams } from "expo-router"; // Use router and useLocalSearchParams
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import RazorpayCheckout from "react-native-razorpay"; // Import Razorpay SDK

// We'll create a single, clean component to handle the UI for the loading state
const LoadingPaymentScreen: React.FC<{ isVerifying: boolean }> = ({
  isVerifying,
}) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.loadingScreenContainer,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.loadingContent}>
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={styles.spinner}
        />
        <Text style={[styles.loadingTitle, { color: colors.text }]}>
          {isVerifying ? "Verifying Payment..." : "Payment in Progress"}
        </Text>
        <Text style={[styles.loadingMessage, { color: colors.textSecondary }]}>
          {isVerifying
            ? "Please wait while we verify your payment..."
            : "Please complete your payment in the popup window..."}
        </Text>
      </View>
    </View>
  );
};

const PaymentPage = () => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const { data: userData, isLoading: userLoading } = useGetUserDetailsQuery();

  const [verifyPayment, { isLoading: isVerifying }] =
    useVerifyPaymentMutation();

  // Use useLocalSearchParams to get data passed via the router
  const { orderData: orderDataString } = useLocalSearchParams();
  const orderData: OrderData = orderDataString
    ? JSON.parse(orderDataString as string)
    : null;

  const orderId = orderData?.id;

  // Use state to track if payment has been initiated to prevent re-opening on re-renders
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  useEffect(() => {
    // Check for user data and order data, and prevent re-initiation
    if (!userLoading && userData && orderData && !paymentInitiated) {
      initiatePayment();
    }
  }, [userLoading, userData, orderData, paymentInitiated]);

  const handlePaymentSuccess = async (response: RazorpayPaymentResponse) => {
    try {
      const verificationResult = await verifyPayment(response).unwrap();

      if (verificationResult.success) {
        Alert.alert("Success", "Payment was successful!");
        // Use router.replace to navigate to a success page
     //   router.replace("/payment-success"); // Adjust route as needed
      } else {
        Alert.alert("Error", "Payment verification failed.");
       // router.replace("/payment-failure"); // Adjust route as needed
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      Alert.alert("Error", "Payment verification failed.");
      //router.replace("");
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    Alert.alert("Payment Failed", "The payment was canceled or failed.");
    // Use router.replace to navigate back or to a failure page
   // router.replace("/payment-failure");
  };

  const initiatePayment = () => {
    if (!orderData || !userData || !orderId) {
      Alert.alert("Error", "Missing required payment data.");
      return;
    }

    setPaymentInitiated(true);

    const options = {
      key: "rzp_live_QlYKhrECsIZWRI", // Your public Key ID
      currency: "INR",
      amount: orderData.amount, // Amount in paisa from your backend
      name: "Shubh Labh",
      description: "Test Transaction",
      image:
        "https://assets.shubhlabhpoojasamagri.com/767fdcf4-48c8-433d-bc02-c2959e5b114b.png",
      order_id: orderId, // Order ID from your backend
      prefill: {
        name: userData.data?.first_name ?? "",
        email: userData.data?.email ?? "",
        contact: userData.data?.phone_number,
      },
      theme: {
        color: "#ff5200",
      },
    };

    RazorpayCheckout.open(options)
      .then(handlePaymentSuccess)
      .catch(handlePaymentFailure);
  };

  if (isVerifying || !paymentInitiated) {
    return <LoadingPaymentScreen isVerifying={isVerifying} />;
  }

  // A fallback return, though the component should navigate away on success/failure
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
};

const styles = StyleSheet.create({
  loadingScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  spinner: {
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  loadingMessage: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default PaymentPage;
