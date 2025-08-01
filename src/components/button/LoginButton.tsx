import { LinearGradient } from "expo-linear-gradient";
import { CircleUserRound } from "lucide-react-native"; // Assuming lucide-react-native
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { LoginDialog } from "../dialog/LoginDialog";

export const LoginButton = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false); // State for LoginDialog visibility

  const handleLoginPress = () => {
    setShowLoginDialog(true);
  };

  return (
    <TouchableOpacity onPress={handleLoginPress} style={styles.button}>
      <LinearGradient
        colors={["#fc4a1a", "#f7b733"]} // from-[#fc4a1a] to-[#f7b733]
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBackground}
      >
        <CircleUserRound size={20} color="white" />
        <Text style={styles.buttonText}>Login</Text>
      </LinearGradient>
      <LoginDialog
        isVisible={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12, // rounded-[12px]
    overflow: "hidden", // Crucial to clip the gradient to the border radius
    // transition duration-100 ease-in hover:scale-[0.95] - Not directly supported. TouchableOpacity's default feedback works well.
  },
  gradientBackground: {
    flexDirection: "row", // flex
    alignItems: "center", // items-center
    gap: 6, // gap-1.5
    paddingHorizontal: 20, // px-5
    paddingVertical: 7, // py-[7px]
  },
  buttonText: {
    color: "white", // text-white
    fontWeight: "500", // font-medium
  },
});

export default LoginButton;
