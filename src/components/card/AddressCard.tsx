// src/components/card/AddressCard.tsx
import { UserAddressPayload } from "@/services/address/addressApi.type";
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
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery Address</Text>
        <TouchableOpacity
          onPress={handleAdressDrawerOpen}
          style={styles.changeButton}
        >
          <Text style={styles.changeButtonText}>CHANGE</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.separator}></View>

      {selectedAddress ? (
        <View style={styles.addressDetails}>
          <Text style={styles.addressName}>
            {selectedAddress.name || "Default Address"}
          </Text>
          <Text style={styles.addressLine}>
            {selectedAddress.address_line1}, {selectedAddress.address_line2}
          </Text>
          <Text style={styles.addressLine}>
            {selectedAddress.city}, {selectedAddress.state} -{" "}
            {selectedAddress.pincode}
          </Text>
          <Text style={styles.addressLine}>{selectedAddress.phone_number}</Text>
        </View>
      ) : (
        <Text style={styles.noAddressText}>
          No address selected. Please select an address to proceed.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // shadow-cart-card conversion
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 4, // mb-1
    flexDirection: "column", // flex w-full flex-col
    gap: 16, // gap-4
    borderRadius: 8, // rounded-lg
    backgroundColor: "white", // bg-white
    padding: 12, // p-3
  },
  header: {
    flexDirection: "row", // flex
    alignItems: "center", // items-center
    justifyContent: "space-between", // justify-between
  },
  headerTitle: {
    fontSize: 16, // text-[16px]
    lineHeight: 21, // leading-[21px]
    fontWeight: "500", // font-medium
    letterSpacing: -0.4, // tracking-[-0.4px]
  },
  changeButton: {
    // cursor-pointer - not applicable
  },
  changeButtonText: {
    fontSize: 14, // text-sm
    fontWeight: "600", // font-semibold
    color: "#d96d2a", // text-[#d96d2a]
  },
  separator: {
    borderBottomWidth: 1, // border-b
    borderBottomColor: "rgba(2, 6, 12, 0.15)", // border-dashed border-[#02060c26]
    borderStyle: "dashed",
    width: "100%", // w-full
    marginVertical: 4, // To visually separate from gap of header/address
  },
  addressDetails: {
    flexDirection: "column", // flex flex-col
    gap: 12, // gap-3
  },
  addressName: {
    fontSize: 14, // text-[14px]
    lineHeight: 18, // leading-[18px]
    fontWeight: "600", // font-semibold
    color: "#02060C", // text-[#02060C]
  },
  addressLine: {
    fontSize: 12, // text-[12px]
    lineHeight: 16, // leading-[16px]
    fontWeight: "400", // font-normal
    color: "rgba(2, 6, 12, 0.45)", // text-[#02060C73]
  },
  noAddressText: {
    fontSize: 14, // text-[14px]
    lineHeight: 18, // leading-[18px]
    fontWeight: "400", // font-normal
    color: "rgba(2, 6, 12, 0.45)", // text-[#02060C73]
  },
});

export default AddressCard;
