import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import type { UserAddressPayload } from "@/services/address/addressApi.type";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface AddressCardProps {
  selectedAddress: UserAddressPayload | undefined | null;
  handleAdressDrawerOpen: () => void;
}

const AddressCard = ({
  selectedAddress,
  handleAdressDrawerOpen,
}: AddressCardProps) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.cardBackground, shadowColor: colors.text },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Delivery Address
        </Text>
        <TouchableOpacity
          onPress={handleAdressDrawerOpen}
          style={styles.changeButton}
        >
          <Text style={[styles.changeButtonText, { color: colors.accent }]}>
            CHANGE
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={[styles.separator, { borderBottomColor: colors.border }]}
      ></View>

      {selectedAddress ? (
        <View style={styles.addressDetails}>
          <Text style={[styles.addressName, { color: colors.text }]}>
            {selectedAddress.name || "Default Address"}
          </Text>
          <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
            {selectedAddress.address_line1}, {selectedAddress.address_line2}
          </Text>
          <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
            {selectedAddress.city}, {selectedAddress.state} {"- "}
            {selectedAddress.pincode}
          </Text>
          <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
            {selectedAddress.phone_number}
          </Text>
        </View>
      ) : (
        <Text style={[styles.noAddressText, { color: colors.textSecondary }]}>
          No address selected. Please select an address to proceed.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 4,
    flexDirection: "column",
    gap: 16,
    borderRadius: 8,
    padding: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "500",
    letterSpacing: -0.4,
  },
  changeButton: {},
  changeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
    width: "100%",
    marginVertical: 4,
  },
  addressDetails: {
    flexDirection: "column",
    gap: 12,
  },
  addressName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
  addressLine: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  },
  noAddressText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
  },
});

export default AddressCard;
