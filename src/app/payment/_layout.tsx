// app/(payment)/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function PaymentStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="payment-page" options={{ headerShown: false }} />
      <Stack.Screen name="payment-success" options={{ headerShown: false }} />
      <Stack.Screen name="payment-failure" options={{ headerShown: false }} />
    </Stack>
  );
}
