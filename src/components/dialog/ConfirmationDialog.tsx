import React from "react";
import {
  ActivityIndicator, // For the spinning loader
  Modal, // For the dialog overlay
  Pressable, // For the dismissable overlay and dialog content
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Assuming your props interface is defined in this path
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
  // className props are not used in RN, styles are merged
  confirmationButtonClassName,
  cancellationButtonClassName,
  isConfirming,
}) => {
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
          style={styles.dialogContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>{headingText}</Text>
            {bodyText && (
              <Text style={styles.dialogDescription}>{bodyText}</Text>
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
                // You can add styles based on cancellationButtonClassName here if you map them
              ]}
            >
              <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={handleConfirmPress}
              disabled={isConfirming}
              style={[
                styles.button,
                styles.confirmButton,
                isConfirming && styles.disabledButton,
                // You can add styles based on confirmationButtonClassName here
              ]}
            >
              {isConfirming ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
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
    maxWidth: 400, // sm:max-w-[750px] approx
    borderRadius: 24, // rounded-3xl
    paddingHorizontal: 16, // px-4
    paddingTop: 24, // pt-6
    paddingBottom: 16, // pb-4
    backgroundColor: "#fff",
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
    fontSize: 20, // text-[20px]
    lineHeight: 24, // leading-6
    fontWeight: "600", // font-semibold
    letterSpacing: -0.5, // -tracking-[0.5px]
    color: "rgba(2, 6, 12, 0.92)", // text-[#02060ceb]
    textAlign: "left",
  },
  dialogDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    letterSpacing: -0.35,
    color: "rgba(2, 6, 12, 0.75)",
    textAlign: "left",
    marginTop: 8,
  },
  dialogFooter: {
    flexDirection: "row",
    marginTop: 24,
    gap: 10,
  },
  button: {
    flex: 1, // flex-1
    height: "auto", // h-auto
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12, // rounded-[12px]
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
    // hover:scale-[0.95] - handled by TouchableOpacity's default feedback
    // focus:ring-0 focus-visible:ring-0 - not applicable
  },
  cancelButton: {
    backgroundColor: "#ffeee5", // bg-[#ffeee5]
    borderWidth: 0, // border-none
  },
  cancelButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.35,
    color: "#ff5200", // text-[#ff5200]
  },
  confirmButton: {
    backgroundColor: "#ff5200", // bg-[#ff5200]
    borderWidth: 0, // border-none
    flexDirection: "row",
  },
  confirmButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.35,
    color: "rgba(255, 255, 255, 0.92)", // text-[#ffffffeb]
  },
  disabledButton: {
    opacity: 0.7, // Add a visual disabled state
  },
  loader: {
    marginRight: 8, // mr-2
  },
});

export default ConfirmationDialog;
