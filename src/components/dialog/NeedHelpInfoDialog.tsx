import { Mail, Phone } from "lucide-react-native"; // Assuming lucide-react-native for icons
import React from "react";
import {
  Dimensions,
  Linking, // For opening mail and phone links
  Modal, // For responsive width
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Get screen width for responsive sizing
const screenWidth = Dimensions.get("window").width;

interface NeedHelpInfoDialogProps {
  isVisible: boolean;
  onClose: () => void;
}

const NeedHelpInfoDialog: React.FC<NeedHelpInfoDialogProps> = ({
  isVisible,
  onClose,
}) => {
  const handleMailPress = () => {
    Linking.openURL("mailto:support@shubhlabhpoojasamagri.com");
  };

  const handlePhonePress = () => {
    Linking.openURL("tel:+919000057702");
  };

  return (
    <Modal
      transparent={true} // Makes the background transparent
      animationType="fade" // Can be 'none', 'slide', 'fade'
      visible={isVisible}
      onRequestClose={onClose} // Handles Android back button press
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        {/*
          The AlertDialogContent from web is this main View.
          We stop propagation to prevent closing the modal when clicking inside the dialog.
        */}
        <Pressable
          style={styles.dialogContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Contact Us</Text>
            <Text style={styles.headerSubtitle}>We are here to help.</Text>
          </View>

          <View style={styles.contactLinksContainer}>
            <TouchableOpacity
              onPress={handleMailPress}
              style={styles.contactLink}
            >
              <View style={styles.iconBackground}>
                <Mail size={20} color="#4f46e5" /> {/* text-indigo-600 */}
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.contactText}
              >
                support@shubhlabhpoojasamagri.com
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePhonePress}
              style={styles.contactLink}
            >
              <View style={styles.iconBackground}>
                <Phone size={20} color="#4f46e5" /> {/* text-indigo-600 */}
              </View>
              <Text style={styles.contactText}>+91 90000-57702</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContent: {
    maxWidth: screenWidth * 0.95, // max-w-[95%]
    width: "95%", // For smaller screens
    // For sm:max-w-110 (which is 440px), you could add:
    // maxWidth: 440, // If you want a hard limit for larger screens/tablets
    gap: 12, // gap-3 (approx)
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    borderColor: "#e2e8f0", // border-slate-200
    backgroundColor: "#f8fafc", // bg-slate-50
    padding: 12, // p-3 (approx)
    shadowColor: "#000", // shadow-lg (approx)
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8, // Android shadow
    outlineWidth: 0, // outline-none - not directly applicable in RN, but good to note
  },
  header: {
    alignItems: "center", // text-center
  },
  headerTitle: {
    fontSize: 20, // text-xl
    fontWeight: "600", // font-semibold
    color: "#1e293b", // text-slate-800
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14, // text-sm
    fontWeight: "500", // font-medium
    color: "#64748b", // text-slate-500
  },
  contactLinksContainer: {
    flexDirection: "column",
    width: "100%", // w-full
    gap: 12, // gap-3 (approx)
  },
  contactLink: {
    flexDirection: "row",
    width: "100%", // w-full
    alignItems: "center",
    gap: 8, // gap-2
    borderRadius: 8, // rounded-lg
    padding: 8, // Added padding for better touch area and visual space
    // No direct hover styles in RN, but TouchableOpacity provides feedback
    backgroundColor: "transparent", // Default
  },
  iconBackground: {
    flexShrink: 0,
    borderRadius: 9999, // rounded-full
    backgroundColor: "#e0e7ff", // bg-indigo-100
    padding: 8, // p-2
  },
  contactText: {
    flexShrink: 1, // Allow text to wrap if necessary
    fontWeight: "500", // font-medium
    color: "#334155", // text-slate-700
    // group-hover:text-indigo-600 - not directly applicable, TouchableOpacity provides visual feedback
  },
  closeButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
  closeButton: {
    width: "50%", // w-1/2
    borderRadius: 6, // rounded-md
    borderWidth: 0, // border-none
    backgroundColor: "#4f46e5", // bg-indigo-600
    paddingVertical: 10, // py-2
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000", // shadow-sm (approx)
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Android shadow
    // transition-all duration-150 ease-in-out hover:scale-[0.95] hover:bg-indigo-700 hover:text-white focus:outline-none
    // TouchableOpacity provides scale/opacity feedback naturally.
  },
  closeButtonText: {
    fontSize: 16, // text-sm (adjusted slightly for better readability)
    fontWeight: "500",
    color: "#fff", // text-white
  },
});

export default NeedHelpInfoDialog;
