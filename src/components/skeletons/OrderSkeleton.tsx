// src/components/skeletons/OrderDetailSkeleton.tsx
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const OrderDetailSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>Loading Order Details...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f5",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});

export default OrderDetailSkeleton;
