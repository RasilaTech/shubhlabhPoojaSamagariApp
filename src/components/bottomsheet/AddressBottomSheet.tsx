import { UserAddressPayload } from "@/services/address/addressApi.type";
import { router } from "expo-router"; // For navigation
import { ChevronRight, MapPin, X } from "lucide-react-native";
import React from "react";
import {
  Dimensions, // To open phone/mail links, though not needed here
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface TriggerAddressBottomSheetProps {
  addresses: UserAddressPayload[];
  handleAddressChange: (address: UserAddressPayload) => void;
  isVisible: boolean;
  onClose: () => void;
}

const screenHeight = Dimensions.get("window").height;

// This component will be the content inside the Modal
export const AddressBottomSheet = ({
  addresses = [],
  handleAddressChange,
  isVisible,
  onClose,
}: TriggerAddressBottomSheetProps) => {
  const handleAddAddressPress = () => {
    onClose(); 
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
          style={styles.bottomSheetContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Choose a delivery address</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.addressList}>
            {addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                onPress={() => {
                  handleAddressChange(address);
                }}
                style={styles.addressItem}
              >
                <View style={styles.addressItemLeft}>
                  <View style={styles.iconWrapper}>
                    <MapPin size={20} color="#ea580c" />
                  </View>
                  <View style={styles.addressInfo}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={styles.addressName}
                    >
                      {address.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={styles.addressLine}
                    >
                      {address.address_line1}
                    </Text>
                  </View>
                </View>
                <ChevronRight color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleAddAddressPress}
              style={styles.addButton}
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
    justifyContent: "flex-end", // Align content to the bottom
  },
  bottomSheetContent: {
    flexDirection: "column",
    paddingHorizontal: 12, // px-3
    paddingTop: 16, // pt-4
    paddingBottom: 80, // pb-20 (extra space for footer, or absolute position footer)
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: screenHeight * 0.8,
  },
  header: {
    marginBottom: 12, // mb-3
    paddingHorizontal: 0, // p-0
  },
  headerTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#02060C",
  },
  closeButton: {
    borderRadius: 12, // rounded-[12px]
    backgroundColor: "rgba(2, 6, 12, 0.15)", // bg-[#02060c26]
    padding: 4, // p-[4px]
    // X icon is rendered white inside the button
  },
  addressList: {
    flexDirection: "column",
    gap: 12, // gap-3
    paddingBottom: 4, // Space below last item
    // overflow-auto is implicit with ScrollView
  },
  addressItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    borderColor: "#E9E9EB",
    backgroundColor: "white",
    paddingHorizontal: 12, // px-3
    paddingVertical: 12, // py-3
    shadowColor: "#000", // shadow-sm
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addressItemLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12, // gap-3
    flex: 1, // Allow this section to take available space
  },
  iconWrapper: {
    marginTop: 4, // mt-1
  },
  addressInfo: {
    flexDirection: "column",
    flex: 1,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#02060C",
  },
  addressLine: {
    fontSize: 14,
    lineHeight: 16,
    color: "#4b5563", // text-gray-600
  },
  footer: {
    position: "absolute", // fixed bottom-4
    bottom: 16, // bottom-4
    left: 0,
    right: 0,
    width: "100%",
    paddingHorizontal: 12, // px-3
    marginTop: "auto", // mt-auto (pushes to the bottom)
  },
  addButton: {
    width: "100%",
    borderRadius: 12, // rounded-xl
    backgroundColor: "#ff5200", // bg-[#ff5200]
    paddingVertical: 12, // py-3
    alignItems: "center",
    justifyContent: "center",
    // hover:scale-[0.98] - not directly applicable
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});

export default AddressBottomSheet;
