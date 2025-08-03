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
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { useGetCartItemsQuery } from "@/services/cart/cartAPI";
import { useAppSelector } from "@/store/hook";

const tabIcons = {
  index: Home,
  categories: LayoutDashboard,
  cart: ShoppingCart,
  orders: Package,
  account: User,
};

const windowWidth = Dimensions.get("window").width;
const TAB_BAR_HEIGHT = 50;
const NUMBER_OF_TABS = 5;
const INDICATOR_SIZE = 40; // Consistent size for the circular indicator
const HORIZONTAL_PADDING = 12; // Match the container padding

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const translateX = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  // Get authentication status and cart data
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const {
    data: cartData = { data: [] },
    isLoading,
    isError,
  } = useGetCartItemsQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Calculate total cart items count
  const cartItemsCount =
    cartData.data?.reduce((total: number, item: any) => {
      return total + (item.quantity || 0);
    }, 0) || 0;

  useEffect(() => {
    // Calculate the available width for tabs (excluding horizontal padding)
    const availableWidth = windowWidth - HORIZONTAL_PADDING * 2;
    const tabWidth = availableWidth / NUMBER_OF_TABS;

    // Center the indicator within each tab
    const indicatorOffset = (tabWidth - INDICATOR_SIZE) / 2;
    const targetPosition = state.index * tabWidth + indicatorOffset;

    translateX.value = withTiming(targetPosition, {
      duration: 300,
    });
  }, [state.index, translateX]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Calculate tab width based on available space
  const availableWidth = windowWidth - HORIZONTAL_PADDING * 2;
  const tabWidth = availableWidth / NUMBER_OF_TABS;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          paddingBottom: insets.bottom,
          shadowColor: colors.text,
          borderTopColor:
            theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        },
      ]}
    >
      <View style={styles.tabBarWrapper}>
        {/* Circular indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: INDICATOR_SIZE,
              height: INDICATOR_SIZE,
              backgroundColor: colors.accent,
              borderRadius: INDICATOR_SIZE / 2, // Perfect circle
            },
            indicatorStyle,
          ]}
        />
        {state.routes.map((route: Route<string>, index: number) => {
          const isFocused = state.index === index;
          const IconComponent = tabIcons[route.name as keyof typeof tabIcons];
          const isCartTab = route.name === "cart";

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
              style={[
                styles.tabButton,
                {
                  width: tabWidth,
                },
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isFocused && { transform: [{ scale: 1.1 }] },
                ]}
              >
                {IconComponent && (
                  <>
                    <IconComponent
                      color={
                        isFocused
                          ? theme === "dark"
                            ? "#FFFFFF"
                            : colors.cardBackground
                          : colors.text
                      }
                      size={26}
                      strokeWidth={isFocused ? 2.5 : 2}
                    />
                    {/* Cart Badge */}
                    {isCartTab && isAuthenticated && cartItemsCount > 0 && (
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: colors.destructive || "#FF3B30",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            {
                              color: "#FFFFFF",
                            },
                          ]}
                        >
                          {cartItemsCount > 99
                            ? "99+"
                            : cartItemsCount.toString()}
                        </Text>
                      </View>
                    )}
                  </>
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
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 2,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderTopWidth: 1,
  },
  tabBarWrapper: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    alignItems: "center",
    position: "relative", // Ensure proper positioning context
  },
  indicator: {
    position: "absolute",
    top: "50%",
    marginTop: -(INDICATOR_SIZE / 2), // Center vertically
    zIndex: 0,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingVertical: 4,
    zIndex: 1,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: INDICATOR_SIZE, // Match indicator size for perfect alignment
    height: INDICATOR_SIZE,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    zIndex: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
});
