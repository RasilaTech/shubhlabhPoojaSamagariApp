import UserAddressCard from "@/components/card/UserAddressCard";
import { UserAddressPayload } from "@/services/address/addressApi.type";
import { useGetUserAddressListQuery } from "@/services/address/AddresssAPI"; // Adjust path
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const UserAddress = () => {
  const {
    data: addressData = { data: [] },
    isLoading,
    isError,
  } = useGetUserAddressListQuery();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    router.back();
  };

  const renderAddressItem = ({ item }: { item: UserAddressPayload }) => (
    <View style={styles.addressCardWrapper}>
      <UserAddressCard data={item} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#ff5200" />
        <Text style={styles.loadingText}>Loading addresses...</Text>
      </View>
    );
  }

  if (isError || addressData.data.length === 0) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.noAddressText}>No addresses found.</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#02060cbf" />
        </TouchableOpacity>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>
          Policies
        </Text>
      </View>
      <FlatList
        data={addressData.data}
        keyExtractor={(item) => item.id}
        renderItem={renderAddressItem}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default UserAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
    paddingVertical: 10,
  },
  flatListContent: {
    paddingHorizontal: 16,
    gap: 16,
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
    marginBottom: 12,
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
  addressCardWrapper: {
    // Add any wrapper styles if needed
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  noAddressText: {
    fontSize: 16,
    color: "#888",
  },
});
