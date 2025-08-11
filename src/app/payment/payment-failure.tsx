import AnimatedIcon from "@/components/common/AnimatedIcons";
import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const PaymentFailure = () => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/"); // Navigate to home page after 3 seconds
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={["#fee2e2", "#fecaca"]} // from-red-50 to-red-100 (light mode)
      style={styles.fullScreenGradient}
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconSection}>
          <AnimatedIcon type="failure" color={colors.destructive} />
        </View>

        <View style={styles.textSection}>
          <Text style={[styles.title, { color: colors.destructive }]}>
            Payment Failed!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Something went wrong
          </Text>
          <Text style={[styles.bodyText, { color: colors.text }]}>
            Your payment could not be processed. Please try again later.
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
              What happened?
            </Text>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>
              The payment verification failed or was cancelled.
            </Text>
            <Text
              style={[styles.cardRedirectText, { color: colors.textSecondary }]}
            >
              Redirecting to home in 3 seconds...
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
    marginBottom: 32,
  },
  textSection: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 24,
  },
  bodyText: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
  },
  detailsCard: {
    marginTop: 32,
    maxWidth: 400,
    borderRadius: 8,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  cardText: {
    fontSize: 14,
    textAlign: "center",
  },
  cardRedirectText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

export default PaymentFailure;
