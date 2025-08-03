import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Image, Linking, StyleSheet, TouchableOpacity } from "react-native";

const WhatsAppIcon = require("../../../assets/images/whatsapp_icon.png");

const ChatIcon: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const openWhatsApp = () => {
    const phoneNumber = "919000057702";
    const message = "Hello";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    Linking.openURL(url).catch((err) =>
      console.error("An error occurred opening WhatsApp", err)
    );
  };

  return (
    <TouchableOpacity onPress={openWhatsApp} style={[styles.button]}>
      <Image source={WhatsAppIcon} style={styles.icon} resizeMode="contain" />
    </TouchableOpacity>
  );
};

export default ChatIcon;

const styles = StyleSheet.create({
  button: {
    borderRadius: 20, // Changed from 9999 to a reasonable value
    elevation: 4, // Reduced elevation for better performance
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 2, // Added padding to make the button more touchable
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    height: 32,
    width: 32,
  },
});
