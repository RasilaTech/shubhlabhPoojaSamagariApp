// src/components/dialog/CancelOrderDialog.tsx
import React from "react";
import { Alert } from "react-native";

interface CancelOrderDialogProps {
  orderId: string;
  handleCloseCancelDialog: () => void;
}

const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
  orderId,
  handleCloseCancelDialog,
}) => {
  // This component acts as a trigger/handler for an Alert
  React.useEffect(() => {
    Alert.alert(
      "Cancel Order",
      `Are you sure you want to cancel order?`,
      [
        {
          text: "No",
          onPress: handleCloseCancelDialog,
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          onPress: () => {
            console.log(`Order cancelled (simulated).`);
            // Add your actual order cancellation logic here (e.g., call a mutation)
            handleCloseCancelDialog();
          },
          style: "destructive",
        },
      ],
      { cancelable: true, onDismiss: handleCloseCancelDialog } // Dismiss handler for outside tap
    );
  }, [orderId, handleCloseCancelDialog]); // Re-trigger if orderId changes (unlikely for a cancel dialog)

  return null; // This component doesn't render any UI itself, it just triggers the Alert
};

export default CancelOrderDialog;
