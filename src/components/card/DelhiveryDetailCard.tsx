// src/components/card/DelhiveryDetailCard.tsx
import { DelhiveryDetailCardProps } from "@/services/orders/orderApi.type";
import { Home, User } from "lucide-react-native"; // Assuming lucide-react-native
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DelhiveryDetailCard = ({ orderAddress }: DelhiveryDetailCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Delivery Details</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <User size={20} color="#212121" strokeWidth={2} />
          <View style={styles.textGroup}>
            <Text style={styles.nameText}>{orderAddress.name}</Text>
            <Text style={styles.phoneText}>
              {orderAddress.phone_number.replace("+91", "")}
            </Text>
          </View>
        </View>
        <View style={styles.separator}></View>
        <View style={styles.detailRow}>
          <Home size={20} color="#212121" strokeWidth={2} />
          <View style={styles.textGroup}>
            <Text style={styles.addressText}>
              {orderAddress.address_line1},
              {orderAddress.address_line2
                ? `${orderAddress.address_line2}, `
                : ""}
              {orderAddress.city}, {orderAddress.state}, {orderAddress.pincode}
            </Text>
            {orderAddress.landmark && (
              <Text style={styles.landmarkText}>{orderAddress.landmark}</Text>
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
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 16,
    color: "#02060c73",
  },
  detailsContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12, // gap-3
    borderRadius: 12,
    backgroundColor: "#f9f9fb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16, // Match the padding of the header for alignment
    marginBottom: 16, // Space below the card's content
  },
  detailRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start", // Align items to top if text wraps
    gap: 12, // gap-3
  },
  textGroup: {
    flex: 1, // Allow text to take remaining space and wrap
    flexDirection: "column",
    gap: 6, // gap-1.5
  },
  nameText: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "600",
    color: "#212121",
  },
  phoneText: {
    fontSize: 14,
    lineHeight: 16,
    color: "#333333",
  },
  separator: {
    width: "96%", // w-[96%]
    borderBottomWidth: 1,
    borderBottomColor: "#ccc", // Adjust color as needed for border-[#E9E9EB]
  },
  addressText: {
    fontSize: 14,
    lineHeight: 16,
    color: "#212121",
  },
  landmarkText: {
    fontSize: 14,
    lineHeight: 16,
    color: "#333333",
  },
});

export default DelhiveryDetailCard;
