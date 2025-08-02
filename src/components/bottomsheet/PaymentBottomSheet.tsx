import { useGetAppConfigurationsQuery } from "@/services/configuration/configurationApi";
import { ChevronRight, Wallet, X } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
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
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const {
    data: appConfigData,
    isLoading: isAppConfigLoading,
    isError: isAppConfigError,
  } = useGetAppConfigurationsQuery();

  const handlePaymentSelect = (method: "cod" | "online") => {
    if (appConfigData?.data.store_status === false) {
      Alert.alert(
        "Store is Offline",
        `We will be back shortly after that you will start placing orders`
      );
    } else {
      onSelectPaymentMethod(method);
    }
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
          style={[
            styles.bottomSheetContent,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Choose a Payment Method
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

          <ScrollView contentContainerStyle={styles.paymentMethodList}>
            <TouchableOpacity
              onPress={() => handlePaymentSelect("cod")}
              style={[
                styles.paymentMethodItem,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.cardBackground,
                  shadowColor: colors.text,
                },
              ]}
            >
              <View style={styles.paymentMethodLeft}>
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Wallet size={20} color={colors.accent} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentName, { color: colors.text }]}>
                    Cash on Delivery
                  </Text>
                  <Text
                    style={[
                      styles.paymentDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Pay to after the delivery
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePaymentSelect("online")}
              style={[
                styles.paymentMethodItem,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.cardBackground,
                  shadowColor: colors.text,
                },
              ]}
            >
              <View style={styles.paymentMethodLeft}>
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Wallet size={20} color={colors.accent} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentName, { color: colors.text }]}>
                    Pay Online
                  </Text>
                  <Text
                    style={[
                      styles.paymentDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Pay using,UPI, Credit Card, Debit Card, Wallets etc
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textSecondary} />
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
    justifyContent: "flex-end",
  },
  bottomSheetContent: {
    flexDirection: "column",
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 32,
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
  paymentMethodList: {
    flexDirection: "column",
    gap: 12,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
  },
  paymentDescription: {
    fontSize: 14,
    lineHeight: 16,
  },
});

export default PaymentBottomSheet;
