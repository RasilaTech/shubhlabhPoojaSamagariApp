// app/(tabs)/account/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function AddressStackLayout() {
  return (
    <Stack>
      {/* 'index' corresponds to app/(tabs)/account/index.tsx */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
