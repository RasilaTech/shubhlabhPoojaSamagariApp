import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SoldOutBadge: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sold Out</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" - converted to RN shadow props
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, // Simulates a light button shadow
    shadowOpacity: 0.1,
    shadowRadius: 2,

    height: "auto", // h-fit
    width: "100%", // w-full
    borderRadius: 8, // rounded-[8px]
    borderWidth: 1, // border
    borderColor: "rgba(2, 6, 12, 0.15)", // border-[#02060c26]
    paddingVertical: 6, // py-1.5 (1.5 * 4 = 6)
    paddingHorizontal: 0, // p-0 is default for View
    justifyContent: "center", // For text-center alignment on View
    alignItems: "center", // For text-center alignment on View
    backgroundColor: "white", // Assuming it's white background for the border to show
  },
  text: {
    fontSize: 14, // text-sm
    lineHeight: 18, // leading-[18px]
    fontWeight: "600", // font-semibold
    letterSpacing: -0.35, // -tracking-[0.35px]
    color: "#ff5200", // text-[#ff5200]
    textAlign: "center", // text-center (for Text component itself)
  },
});

export default SoldOutBadge;
