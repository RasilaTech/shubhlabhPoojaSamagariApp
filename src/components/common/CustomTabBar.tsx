import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Route } from "@react-navigation/native";
import { router } from "expo-router";
import {
  Home,
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
} from "lucide-react-native";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

const tabIcons = {
  index: Home,
  categories: LayoutDashboard,
  cart: ShoppingCart,
  orders: Package,
  account: User,
};

const windowWidth = Dimensions.get("window").width;
const TAB_BAR_HEIGHT = 60;
const TAB_BAR_MARGIN_BOTTOM = 20;
const PILL_PADDING = 8;
const TAB_BAR_WIDTH = windowWidth * 0.9;
const NUMBER_OF_TABS = 5;

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const translateX = useSharedValue(0);

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  useEffect(() => {
    // FIX: Simple calculation - divide the available width by number of tabs
    // The available width is the total width minus padding on both sides
    const availableWidth = TAB_BAR_WIDTH - PILL_PADDING * 2;
    const tabWidth = availableWidth / NUMBER_OF_TABS;
    const indicatorWidth = tabWidth * 0.7; // Make indicator 70% of tab width
    const indicatorOffset = (tabWidth - indicatorWidth) / 2; // Center the indicator

    // Position is: tab index * tab width + offset to center indicator
    const targetPosition = state.index * tabWidth + indicatorOffset;

    translateX.value = withTiming(targetPosition, {
      duration: 250,
    });
  }, [state.index, translateX]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Calculate these values for consistent use
  const availableWidth = TAB_BAR_WIDTH - PILL_PADDING * 2;
  const tabWidth = availableWidth / NUMBER_OF_TABS;
  const indicatorWidth = tabWidth * 0.7;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.tabBarWrapper,
          { backgroundColor: colors.cardBackground, shadowColor: colors.text },
        ]}
      >
        <Animated.View
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              backgroundColor: colors.accent,
            },
            indicatorStyle,
          ]}
        />
        {state.routes.map((route: Route<string>, index: number) => {
          const isFocused = state.index === index;
          const IconComponent = tabIcons[route.name as keyof typeof tabIcons];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              let path = route.name;
              if (route.name === "index") {
                path = "/";
              } else {
                path = `/${route.name}`;
              }
              router.push({ pathname: path as any });
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabButton, { width: tabWidth }]}
            >
              <View style={styles.iconWrapper}>
                {IconComponent && (
                  <IconComponent
                    color={isFocused ? colors.cardBackground : colors.text}
                    size={24}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: TAB_BAR_MARGIN_BOTTOM,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tabBarWrapper: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    borderRadius: 9999,
    width: TAB_BAR_WIDTH,
    paddingHorizontal: PILL_PADDING,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    alignItems: "center",
  },
  indicator: {
    position: "absolute",
    height: TAB_BAR_HEIGHT - PILL_PADDING * 2,
    backgroundColor: "#3b82f6",
    borderRadius: 9999,
    top: PILL_PADDING,
    left: PILL_PADDING, // Start from the padded area
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    zIndex: 1,
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
