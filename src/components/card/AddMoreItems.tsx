// src/components/common/AddMoreItems.tsx
import { router } from "expo-router"; // For navigation
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const AddMoreItems: React.FC = () => {
  const handleAddMoreItems = () => {
    console.log("Add more items clicked");
    router.replace("/"); // Navigates to the home screen (or wherever your main product Browse page is)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {"Missed Something? "}
        <Text onPress={handleAddMoreItems} style={styles.linkText}>
          Add more items
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // shadow-cart-card conversion
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 4, // mb-1
    flexDirection: "row", // flex
    justifyContent: "center", // justify-center
    borderRadius: 8, // rounded-lg
    backgroundColor: "white", // bg-white
    padding: 16, // p-4
  },
  text: {
    fontSize: 13, // text-[13px]
    lineHeight: 17, // leading-[17px]
    fontWeight: "600", // font-semibold
    letterSpacing: -0.33, // -tracking-[0.33px]
    color: "#02060cbf", // text-[#02060cbf]
  },
  linkText: {
    color: "#ff5200", // text-[#ff5200]
    // cursor-pointer - not applicable in RN
  },
});

export default AddMoreItems;
