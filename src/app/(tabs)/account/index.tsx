import { ConfirmationDialog } from "@/components/dialog/ConfirmationDialog"; // <--- Import ConfirmationDialog
import { darkColors, lightColors } from "@/constants/ThemeColors"; // <-- Import your color constants
import { useTheme } from "@/hooks/useTheme"; // <-- Import useTheme
import { useLogoutMutation } from "@/services/auth/authApi";
import { router } from "expo-router";
import {
  ChevronRight,
  FileText,
  Info,
  LifeBuoy,
  LogOut,
  MapPin,
  Moon,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
}) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <TouchableOpacity
      style={[
        styles.optionContainer,
        { backgroundColor: colors.cardBackground },
        !isLast && { borderBottomColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.optionLeftContent}>
        <Icon size={20} color={colors.text} />
        <Text style={[styles.optionText, { color: colors.text }]}>{title}</Text>
      </View>
      <ChevronRight size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const ThemeToggle: React.FC<{ isLast: boolean }> = ({ isLast }) => {
  const { theme, toggleTheme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.optionContainer,
        { backgroundColor: colors.cardBackground },
        !isLast && { borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.optionLeftContent}>
        <Moon size={20} color={colors.text} />
        <Text style={[styles.optionText, { color: colors.text }]}>
          Dark Mode
        </Text>
      </View>
      <Switch
        trackColor={{ false: colors.textSecondary, true: colors.accent }}
        thumbColor={colors.cardBackground}
        onValueChange={toggleTheme}
        value={theme === "dark"}
      />
    </View>
  );
};

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation(); // Use isLoading for button state
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const handleLogout = () => {
    // FIX: Instead of calling Alert.alert, just show your custom dialog
    setShowLogoutDialog(true);
  };

  // The actual logout logic that your ConfirmationDialog will call
  const handleConfirmLogout = async () => {
    try {
      await logout().unwrap();
      setShowLogoutDialog(false); // Close dialog on success
      router.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout Failed", "Could not log out. Please try again.");
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: colors.background, // <-- Apply background color
        },
      ]}
    >
      <Text style={[styles.headingText, { color: colors.text }]}>
        My Account
      </Text>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.section}>
          <AccountOption
            icon={User}
            title="User Profile"
            onPress={() => router.push({ pathname: "/account/profile" })}
          />
          <AccountOption
            icon={MapPin}
            title="My Addresses"
            onPress={() => router.push({ pathname: "/account/addresses" })}
            isLast
          />
        </View>

        <View style={styles.section}>
          <ThemeToggle isLast={false} />
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

        <View style={styles.section}>
          <AccountOption
            icon={LogOut}
            title="Logout"
            onPress={handleLogout}
            isLast
          />
        </View>
      </ScrollView>
      <ConfirmationDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        headingText="Logout"
        bodyText="Are you sure you want to log out?"
        confirmationButtonText={isLoggingOut ? "Logging out..." : "Logout"}
        cancelButtonText="Cancel"
        onConfirm={handleConfirmLogout} // Pass the confirmed action
        isConfirming={isLoggingOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headingText: {
    fontSize: 26,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  section: {
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
    borderBottomWidth: 1,
  },
  optionLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  optionText: {
    fontSize: 16,
  },
  optionBorder: {
    borderBottomWidth: 1,
  },
});
