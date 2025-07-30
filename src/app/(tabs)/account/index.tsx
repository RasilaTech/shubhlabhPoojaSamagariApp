// app/(tabs)/account/index.tsx
import { useLogoutMutation } from "@/services/auth/authApi"; // Adjust path
import { router } from "expo-router"; // Import router from expo-router
import {
  ChevronRight,
  FileText,
  Info,
  LifeBuoy,
  LogOut,
  MapPin,
  User,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Helper component for each account option item (can be extracted to src/components/common/AccountOption.tsx)
interface AccountOptionProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  onPress: () => void;
  isLast?: boolean;
}

const AccountOption: React.FC<AccountOptionProps> = ({
  icon: Icon,
  title,
  onPress,
  isLast,
}) => (
  <TouchableOpacity
    style={[styles.optionContainer, !isLast && styles.optionBorder]}
    onPress={onPress}
  >
    <View style={styles.optionLeftContent}>
      <Icon size={20} color="#333" />
      <Text style={styles.optionText}>{title}</Text>
    </View>
    <ChevronRight size={18} color="#888" />
  </TouchableOpacity>
);

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const [logout, { isLoading }] = useLogoutMutation();

  // FIX: Declare handleLogout as async
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          // FIX: Declare this inner onPress callback as async
          onPress: async () => {
            try {
              await logout().unwrap(); // Use .unwrap() to handle potential errors
              router.replace("/"); // Redirect after successful logout
            } catch (error) {
              console.error("Logout failed:", error);
              Alert.alert(
                "Logout Failed",
                "Could not log out. Please try again."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Text style={styles.headingText}>My Account</Text>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* User Specific Options */}
        <View style={styles.section}>
          <AccountOption
            icon={User}
            title="User Profile"
            onPress={() => router.push({ pathname: "/account/profile" })} // Use /account/profile for relative path in stack
          />
          <AccountOption
            icon={MapPin}
            title="My Addresses"
            onPress={() => router.push({ pathname: "/account/addresses" })} // Use /account/addresses
            isLast
          />
        </View>

        {/* Information & Support Options */}
        <View style={styles.section}>
          <AccountOption
            icon={Info}
            title="About Us"
            onPress={() => router.push({ pathname: "/account/about" })}
          />
          <AccountOption
            icon={FileText}
            title="Policies"
            onPress={() => router.push({ pathname: "/account/policies" })}
          />
          <AccountOption
            icon={LifeBuoy}
            title="Customer Support"
            onPress={() => router.push({ pathname: "/account/support" })}
            isLast
          />
        </View>

        {/* Action Options */}
        <View style={styles.section}>
          <AccountOption
            icon={LogOut}
            title="Logout"
            onPress={handleLogout}
            isLast
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
  },
  headingText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a202c",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  optionLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
