import AnimatedIcon from "@/components/common/AnimatedIcons";
import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient"; // For background gradient
import { router } from "expo-router"; // Use router for navigation
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const PaymentSuccess = () => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/orders"); // Navigate to orders page after 3 seconds
    }, 3000);
    return () => clearTimeout(timeout); // Clear timeout on unmount
  }, []);

  return (
    <LinearGradient
      colors={["#dcfce7", "#d9f99d"]} // from-green-50 to-green-100 (light mode)
      style={styles.fullScreenGradient}
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconSection}>
          <AnimatedIcon type="success" color={colors.success} />
        </View>

        <View style={styles.textSection}>
          <Text style={[styles.title, { color: colors.success }]}>
            Payment Successful!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Thank you for your order
          </Text>
          <Text style={[styles.bodyText, { color: colors.text }]}>
            Your order has been confirmed and will be processed shortly.
          </Text>

          <View
            style={[
              styles.detailsCard,
              {
                backgroundColor: colors.cardBackground,
                shadowColor: colors.textSecondary,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Order Details
            </Text>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>
              You will receive a confirmation email shortly.
            </Text>
            <Text
              style={[styles.cardRedirectText, { color: colors.textSecondary }]}
            >
              Redirecting to orders in 3 seconds...
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullScreenGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  iconSection: {
    marginBottom: 32, // mb-8
  },
  textSection: {
    alignItems: "center",
  },
  title: {
    fontSize: 32, // text-4xl
    fontWeight: "bold", // font-bold
    marginBottom: 16, // mb-4
  },
  subtitle: {
    fontSize: 20, // text-xl
    marginBottom: 24, // mb-6
  },
  bodyText: {
    fontSize: 16, // text-base
    marginBottom: 32, // mb-8
    textAlign: "center",
  },
  detailsCard: {
    marginTop: 32, // mt-8
    maxWidth: 400, // max-w-md
    borderRadius: 8, // rounded-lg
    padding: 16, // p-4
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18, // text-lg
    fontWeight: "600", // font-semibold
    marginBottom: 8, // mb-2
    textAlign: "center",
  },
  cardText: {
    fontSize: 14, // text-sm
    textAlign: "center",
  },
  cardRedirectText: {
    fontSize: 14,
    marginTop: 8, // mt-2
    textAlign: "center",
  },
});

export default PaymentSuccess;
