import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGetUserAddressListQuery } from "@/services/address/AddresssAPI"; // Adjust path
import type { UserAddressPayload } from "@/services/address/addressApi.type"; // Adjust path
import UserAddressCard from "../../../../src/components/card/UserAddressCard"; // Adjust path

import { darkColors, lightColors } from "@/constants/ThemeColors"; // <-- Import color palettes
import { useTheme } from "@/hooks/useTheme"; // <-- Import useTheme hook

const UserAddress = () => {
  const {
    data: addressData = { data: [] },
    isLoading,
    isError,
  } = useGetUserAddressListQuery();
  const insets = useSafeAreaInsets();

  const { theme } = useTheme(); // Get the current theme
  const colors = theme === "dark" ? darkColors : lightColors; // Select color palette

  const handleGoBack = () => {
    router.back();
  };

  const renderAddressItem = ({ item }: { item: UserAddressPayload }) => (
    <View style={styles.addressCardWrapper}>
      {/* Pass the onEdit handler if you want to enable the edit flow */}
      <UserAddressCard data={item} />
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[styles.centerContent, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading addresses...
        </Text>
      </View>
    );
  }

  if (isError || addressData.data.length === 0) {
    return (
      <View
        style={[styles.centerContent, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.noAddressText, { color: colors.textSecondary }]}>
          No addresses found.
        </Text>
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
          backgroundColor: colors.background, // Apply background color
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
          My Addresses
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
    paddingVertical: 10,
    marginBottom: 24,
  },
  flatListContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
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
  addressCardWrapper: {
    marginBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  noAddressText: {
    fontSize: 16,
  },
});
