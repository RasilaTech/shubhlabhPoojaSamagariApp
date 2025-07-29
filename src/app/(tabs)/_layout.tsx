// app/(tabs)/_layout.tsx

import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  House,
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
} from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          android: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <House color={color} stroke={color} />,
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: "categories",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard color={color} stroke={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "cart",
          tabBarIcon: ({ color }) => (
            <ShoppingCart color={color} stroke={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => <Package color={color} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <User color={color} stroke={color} />,
        }}
      />
    </Tabs>
  );
}
