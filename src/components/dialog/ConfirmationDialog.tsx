import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors"; // <-- Import color palettes
import { useTheme } from "@/hooks/useTheme"; // <-- Import useTheme hook

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headingText: string;
  bodyText?: string;
  confirmationButtonText?: string;
  cancelButtonText?: string;
  confirmationButtonClassName?: string;
  cancellationButtonClassName?: string;
  isConfirming: boolean;
  onConfirm: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  headingText,
  bodyText = "",
  confirmationButtonText = "Confirm",
  cancelButtonText = "Cancel",
  onConfirm,
  isConfirming,
}) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const handleConfirmPress = () => {
    if (!isConfirming) {
      onConfirm();
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={open}
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => onOpenChange(false)}
      >
        <Pressable
          style={[
            styles.dialogContent,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.dialogHeader}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>
              {headingText}
            </Text>
            {bodyText && (
              <Text
                style={[
                  styles.dialogDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {bodyText}
              </Text>
            )}
          </View>

          <View style={styles.dialogFooter}>
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => onOpenChange(false)}
              disabled={isConfirming}
              style={[
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.cancelButtonText, { color: colors.accent }]}>
                {cancelButtonText}
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={handleConfirmPress}
              disabled={isConfirming}
              style={[
                styles.button,
                styles.confirmButton,
                isConfirming && styles.disabledButton,
                { backgroundColor: colors.accent, borderColor: colors.border },
              ]}
            >
              {isConfirming ? (
                <ActivityIndicator
                  size="small"
                  color="#fff" // Loader is always white on a colored button
                  style={styles.loader}
                />
              ) : null}
              <Text style={styles.confirmButtonText}>
                {confirmationButtonText}
              </Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dialogHeader: {
    flexDirection: "column",
  },
  dialogTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
    letterSpacing: -0.5,
    textAlign: "left",
  },
  dialogDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    letterSpacing: -0.35,
    textAlign: "left",
    marginTop: 8,
  },
  dialogFooter: {
    flexDirection: "row",
    marginTop: 24,
    gap: 10,
  },
  button: {
    flex: 1,
    height: "auto",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButton: {
    borderWidth: 0,
  },
  cancelButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.35,
  },
  confirmButton: {
    borderWidth: 0,
    flexDirection: "row",
  },
  confirmButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.35,
    color: "rgba(255, 255, 255, 0.92)",
  },
  disabledButton: {
    opacity: 0.7,
  },
  loader: {
    marginRight: 8,
  },
});
