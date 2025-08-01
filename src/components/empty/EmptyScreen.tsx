import { router } from "expo-router"; // For back navigation
import { ChevronLeft } from "lucide-react-native"; // For back arrow icon
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type EmptyScreenProps = {
  imageSrc: ImageSourcePropType; // Use this type for images from require()
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
  const handleGoBack = () => {
    // router.back() is the Expo Router equivalent of window.history.back()
    router.back();
  };

  return (
    <View style={styles.container}>
      {showBackArrow && (
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#6b7280" /> {/* gray-500 */}
        </TouchableOpacity>
      )}

      <Image
        source={imageSrc}
        alt="Error" // The alt prop isn't rendered but is good practice
        style={styles.image}
        resizeMode="contain" // Fit image within dimensions
      />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <TouchableOpacity onPress={onButtonClick} style={styles.button}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex flex-1 flex-col items-center justify-center
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8, // rounded-tl-lg (assuming you only want one corner rounded)
    backgroundColor: "white", // bg-white
    paddingHorizontal: 16, // px-4
  },
  backButton: {
    // absolute top-4 left-4
    position: "absolute",
    top: 16,
    left: 16,
    padding: 8, // Add padding to make touch target larger
  },
  image: {
    // mb-6 h-40 w-40
    marginBottom: 24,
    height: 160,
    width: 160,
  },
  title: {
    // text-xl font-semibold text-orange-500
    fontSize: 20,
    fontWeight: "600",
    color: "#f97316", // hex for orange-500
    marginBottom: 8, // Add some margin
    textAlign: "center",
  },
  subtitle: {
    // mb-6 text-gray-500
    marginBottom: 24,
    color: "#6b7280", // hex for gray-500
    textAlign: "center",
  },
  button: {
    // rounded-full bg-orange-500 px-6 py-2 font-medium text-white shadow
    borderRadius: 999, // rounded-full
    backgroundColor: "#f97316", // bg-orange-500
    paddingHorizontal: 24, // px-6
    paddingVertical: 8, // py-2
    shadowColor: "#000", // shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // Android shadow
  },
  buttonText: {
    // font-medium text-white
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
});

export default EmptyScreen;
