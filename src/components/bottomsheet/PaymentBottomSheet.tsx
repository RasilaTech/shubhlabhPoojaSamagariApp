import { ChevronRight, Wallet, X } from "lucide-react-native"; // Assuming lucide-react-native for icons
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

export interface TriggerPaymentBottomSheetProps {
  onSelectPaymentMethod: (method: string) => void;
  isVisible: boolean;
  onClose: () => void;
}
const screenHeight = Dimensions.get("window").height;

const PaymentBottomSheet = ({
  onSelectPaymentMethod,
  isVisible,
  onClose,
}: TriggerPaymentBottomSheetProps) => {
  const handlePaymentSelect = (method: "cod" | "online") => {
    onSelectPaymentMethod(method);
    onClose(); // Close the bottom sheet after a selection is made
  };

  return (
    <Modal
      transparent={true} // So the background behind the modal content is visible
      animationType="slide" // Slide from bottom
      visible={isVisible}
      onRequestClose={onClose} // Handles Android back button press
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.bottomSheetContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Choose a Payment Method</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Method List */}
          <ScrollView contentContainerStyle={styles.paymentMethodList}>
            <TouchableOpacity
              onPress={() => handlePaymentSelect("cod")}
              style={styles.paymentMethodItem}
            >
              <View style={styles.paymentMethodLeft}>
                <View style={styles.iconWrapper}>
                  <Wallet size={20} color="#ea580c" />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>Cash on Delivery</Text>
                  <Text style={styles.paymentDescription}>
                    Pay to after the delivery
                  </Text>
                </View>
              </View>
              <ChevronRight color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePaymentSelect("online")}
              style={styles.paymentMethodItem}
            >
              <View style={styles.paymentMethodLeft}>
                <View style={styles.iconWrapper}>
                  <Wallet size={20} color="#ea580c" />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>Pay Online</Text>
                  <Text style={styles.paymentDescription}>
                    Pay using,UPI, Credit Card, Debit Card, Wallets etc
                  </Text>
                </View>
              </View>
              <ChevronRight color="#9ca3af" />
            </TouchableOpacity>
          </ScrollView>
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
    paddingBottom: 32, // pb-8
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: screenHeight * 0.8,
  },
  header: {
    marginBottom: 12, // mb-3
    paddingHorizontal: 0,
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
    borderRadius: 12,
    backgroundColor: "rgba(2, 6, 12, 0.15)",
    padding: 4,
  },
  paymentMethodList: {
    flexDirection: "column",
    gap: 12, // gap-3
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
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
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12, // gap-3
    flex: 1,
  },
  iconWrapper: {
    marginTop: 4,
  },
  paymentInfo: {
    flexDirection: "column",
    flex: 1,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#02060C",
  },
  paymentDescription: {
    fontSize: 14,
    lineHeight: 16,
    color: "#4b5563",
    // truncate, max-w-[220px] - handled by numberOfLines and flex
  },
});

export default PaymentBottomSheet;
