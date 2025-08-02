import { CustomTabBar } from "@/components/common/CustomTabBar";
import { Tabs } from "expo-router";
import React from "react";

// <--- Import your custom tab bar component

// ... other imports

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // You can keep other general screen options here
      }}
      // <--- Pass the CustomTabBar component here
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
        }}
      />
    </Tabs>
  );
}
