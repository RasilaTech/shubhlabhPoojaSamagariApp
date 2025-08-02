import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

type EmptyScreenProps = {
  imageSrc: ImageSourcePropType;
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick: () => void;
  showBackArrow?: boolean;
};

const EmptyScreen: React.FC<EmptyScreenProps> = ({
  imageSrc,
  title,
  subtitle,
  buttonText,
  onButtonClick,
  showBackArrow = true,
}) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showBackArrow && (
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      <Image
        source={imageSrc}
        alt="Error"
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>

      <TouchableOpacity
        onPress={onButtonClick}
        style={[
          styles.button,
          { backgroundColor: colors.accent, shadowColor: colors.text },
        ]}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    padding: 8,
  },
  image: {
    marginBottom: 24,
    height: 160,
    width: 160,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 24,
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
});

export default EmptyScreen;
