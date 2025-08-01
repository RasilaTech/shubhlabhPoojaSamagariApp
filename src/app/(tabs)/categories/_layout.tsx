// app/(tabs)/account/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function CategoryStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "My Orders", headerShown: false }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Order Details", headerShown: false }}
      />
    </Stack>
  );
}
