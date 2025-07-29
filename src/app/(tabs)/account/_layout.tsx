// app/(tabs)/account/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function AccountStackLayout() {
  return (
    <Stack>
      {/* 'index' corresponds to app/(tabs)/account/index.tsx */}
      <Stack.Screen
        name="index"
        options={{ title: "My Account", headerShown: false }}
      />
      {/* Other screens in the account stack */}
      <Stack.Screen
        name="profile"
        options={{ title: "User Profile", headerShown: false }}
      />
      <Stack.Screen
        name="addresses"
        options={{ title: "My Addresses", headerShown: false }}
      />
      <Stack.Screen
        name="about"
        options={{ title: "About Us", headerShown: false }}
      />
      <Stack.Screen
        name="policies"
        options={{ title: "Policies", headerShown: false }}
      />
      <Stack.Screen
        name="support"
        options={{ title: "Customer Support", headerShown: false }}
      />
    </Stack>
  );
}
