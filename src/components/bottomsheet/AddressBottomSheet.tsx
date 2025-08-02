import { router } from "expo-router";
import { ChevronRight, MapPin, X } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import type { UserAddressPayload } from "@/services/address/addressApi.type";
export interface TriggerAddressBottomSheetProps {
  addresses: UserAddressPayload[];
  handleAddressChange: (address: UserAddressPayload) => void;
  isVisible: boolean;
  onClose: () => void;
}
const screenHeight = Dimensions.get("window").height;

export const AddressBottomSheet = ({
  addresses = [],
  handleAddressChange,
  isVisible,
  onClose,
}: TriggerAddressBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const handleAddAddressPress = () => {
    onClose();
    router.push({
      pathname: "/address",
    });
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.bottomSheetContent,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Choose a delivery address
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.background },
                ]}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={[styles.addressList, { gap: 12 }]}>
            {addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                onPress={() => {
                  handleAddressChange(address);
                }}
                style={[
                  styles.addressItem,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.addressItemLeft}>
                  <View style={styles.iconWrapper}>
                    <MapPin size={20} color={colors.accent} />
                  </View>
                  <View style={styles.addressInfo}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[styles.addressName, { color: colors.text }]}
                    >
                      {address.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        styles.addressLine,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {address.address_line1}
                    </Text>
                  </View>
                </View>
                <ChevronRight color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              onPress={handleAddAddressPress}
              style={[styles.addButton, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.addButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetContent: {
    flexDirection: "column",
    paddingHorizontal: 12,
    paddingTop: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: screenHeight * 0.8,
  },
  header: {
    marginBottom: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  headerTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    borderRadius: 12,
    padding: 4,
  },
  addressList: {
    flexDirection: "column",
    gap: 12,
    paddingBottom: 4,
  },
  addressItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addressItemLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    marginTop: 4,
  },
  addressInfo: {
    flexDirection: "column",
    flex: 1,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "600",
  },
  addressLine: {
    fontSize: 14,
    lineHeight: 16,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    paddingHorizontal: 12,
    marginTop: "auto",
  },
  addButton: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});
