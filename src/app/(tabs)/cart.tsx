import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

const cart = () => {
  return (
    <SafeAreaView>
      <ThemedText>orders</ThemedText>
    </SafeAreaView>
  );
};

export default cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "yellow",
    borderColor: "red",
    justifyContent: "flex-end",
    borderWidth: 5,
  },
});
