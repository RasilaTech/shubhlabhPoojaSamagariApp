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
const TAB_BAR_WIDTH = windowWidth * 0.9; // FIX: Use a fixed width for the entire bar (e.g., 90%)
const TAB_BUTTON_WIDTH = TAB_BAR_WIDTH / 5; // FIX: Calculate tab width based on this total width

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const translateX = useSharedValue(0);

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  useEffect(() => {
    // FIX: Animate position based on the new, consistent tab width
    translateX.value = withTiming(state.index * TAB_BUTTON_WIDTH, {
      duration: 250,
    });
  }, [state.index, translateX]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

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
              // FIX: Use the new constant tab width for the indicator
              width: TAB_BUTTON_WIDTH - PILL_PADDING * 2,
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
              // FIX: Use the new, consistent tab width for the buttons
              style={[styles.tabButton, { width: TAB_BUTTON_WIDTH }]}
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
    // FIX: Apply the calculated width here
    width: TAB_BAR_WIDTH,
    // FIX: Add padding to the wrapper itself, which will be inside the rounded edges
    paddingHorizontal: PILL_PADDING,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  indicator: {
    position: "absolute",
    // FIX: Position relative to the parent, which now has the padding
    left: PILL_PADDING,
    height: TAB_BAR_HEIGHT - PILL_PADDING * 2,
    marginVertical: PILL_PADDING,
    backgroundColor: "#3b82f6",
    borderRadius: 9999,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    // FIX: No padding on the button itself, the padding is on the wrapper
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
