// app/(tabs)/account/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function OrderStackLayout() {
  return (
    <Stack>
      {/* 'index' corresponds to app/(tabs)/account/index.tsx */}
      <Stack.Screen
        name="index"
        options={{ title: "My Orders", headerShown: false }}
      />
      {/* Other screens in the account stack */}
      <Stack.Screen
        name="[id]"
        options={{ title: "Order Details", headerShown: false }}
      />
    </Stack>
  );
}
