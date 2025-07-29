// app/(tabs)/account/profile.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function UserProfileScreen() {
  // Default export
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the User Profile Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
