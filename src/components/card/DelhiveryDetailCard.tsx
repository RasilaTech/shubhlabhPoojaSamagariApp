import { Home, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { DelhiveryDetailCardProps } from "@/services/orders/orderApi.type";

const DelhiveryDetailCard = ({ orderAddress }: DelhiveryDetailCardProps) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>
          Delivery Details
        </Text>
      </View>
      <View
        style={[
          styles.detailsContainer,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <View style={styles.detailRow}>
          <User size={20} color={colors.text} strokeWidth={2} />
          <View style={styles.textGroup}>
            <Text style={[styles.nameText, { color: colors.text }]}>
              {orderAddress.name}
            </Text>
            <Text style={[styles.phoneText, { color: colors.textSecondary }]}>
              {orderAddress.phone_number.replace("+91", "")}
            </Text>
          </View>
        </View>
        <View
          style={[styles.separator, { borderBottomColor: colors.border }]}
        ></View>
        <View style={styles.detailRow}>
          <Home size={20} color={colors.text} strokeWidth={2} />
          <View style={styles.textGroup}>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {orderAddress.address_line1},
              {orderAddress.address_line2
                ? `${orderAddress.address_line2}, `
                : ""}
              {orderAddress.city}, {orderAddress.state}, {orderAddress.pincode}
            </Text>
            {orderAddress.landmark && (
              <Text
                style={[styles.landmarkText, { color: colors.textSecondary }]}
              >
                {orderAddress.landmark}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 16,
  },
  detailsContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start",
    gap: 12,
  },
  textGroup: {
    flex: 1,
    flexDirection: "column",
    gap: 6,
  },
  nameText: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "600",
  },
  phoneText: {
    fontSize: 14,
    lineHeight: 16,
  },
  separator: {
    width: "96%",
    borderBottomWidth: 1,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 16,
  },
  landmarkText: {
    fontSize: 14,
    lineHeight: 16,
  },
});

export default DelhiveryDetailCard;
