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
import React, { useCallback, useMemo } from "react";
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
  withSpring
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
} as const;

const { width: windowWidth } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 50;
const NUMBER_OF_TABS = 5;
const INDICATOR_SIZE = 40;
const HORIZONTAL_PADDING = 12;

// Memoized tab button component to prevent unnecessary re-renders
const TabButton = React.memo(({
  route,
  index,
  isFocused,
  tabWidth,
  colors,
  theme,
  cartItemsCount,
  isAuthenticated,
  onPress,
}: {
  route: Route<string>;
  index: number;
  isFocused: boolean;
  tabWidth: number;
  colors: any;
  theme: string;
  cartItemsCount: number;
  isAuthenticated: boolean;
  onPress: () => void;
}) => {
  const IconComponent = tabIcons[route.name as keyof typeof tabIcons];
  const isCartTab = route.name === "cart";

  return (
    <TouchableOpacity
      key={route.key}
      onPress={onPress}
      style={[styles.tabButton, { width: tabWidth }]}
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
            {isCartTab && isAuthenticated && cartItemsCount > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.destructive || "#FF3B30",
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {cartItemsCount > 99 ? "99+" : cartItemsCount.toString()}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
});

TabButton.displayName = "TabButton";

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const translateX = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  // Memoize colors to prevent recalculation
  const colors = useMemo(() => 
    theme === "dark" ? darkColors : lightColors, 
    [theme]
  );

  // Get authentication status and cart data
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: cartData = { data: [] } } = useGetCartItemsQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Memoize cart items count calculation
  const cartItemsCount = useMemo(() => {
    if (!cartData.data) return 0;
    return cartData.data.reduce((total: number, item: any) => {
      return total + (item.quantity || 0);
    }, 0);
  }, [cartData.data]);

  // Memoize tab calculations
  const { availableWidth, tabWidth } = useMemo(() => {
    const available = windowWidth - HORIZONTAL_PADDING * 2;
    return {
      availableWidth: available,
      tabWidth: available / NUMBER_OF_TABS,
    };
  }, []);

  // Update indicator position when tab changes
  React.useEffect(() => {
    const indicatorOffset = (tabWidth - INDICATOR_SIZE) / 2;
    const targetPosition = state.index * tabWidth + indicatorOffset;
    
    translateX.value = withSpring(targetPosition, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });
  }, [state.index, tabWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  }, []);

  // Memoize container styles
  const containerStyle = useMemo(() => [
    styles.container,
    {
      backgroundColor: colors.cardBackground,
      paddingBottom: insets.bottom,
      shadowColor: colors.text,
      borderTopColor:
        theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
  ], [colors.cardBackground, colors.text, insets.bottom, theme]);

  // Memoize indicator styles
  const indicatorBaseStyle = useMemo(() => [
    styles.indicator,
    {
      width: INDICATOR_SIZE,
      height: INDICATOR_SIZE,
      backgroundColor: colors.accent,
      borderRadius: INDICATOR_SIZE / 2,
    },
  ], [colors.accent]);

  // Optimize navigation with useCallback
  const createOnPressHandler = useCallback((route: Route<string>, index: number) => {
    return () => {
      const isFocused = state.index === index;
      
      if (isFocused) return;

      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        // Use replace instead of push for better performance
        const path = route.name === "index" ? "/" : `/${route.name}`;
        router.replace(path as any);
      }
    };
  }, [state.index, navigation]);

  return (
    <View style={containerStyle}>
      <View style={styles.tabBarWrapper}>
        <Animated.View
          style={[indicatorBaseStyle, indicatorStyle]}
        />
        {state.routes.map((route: Route<string>, index: number) => {
          const isFocused = state.index === index;
          
          return (
            <TabButton
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              tabWidth={tabWidth}
              colors={colors}
              theme={theme}
              cartItemsCount={cartItemsCount}
              isAuthenticated={isAuthenticated}
              onPress={createOnPressHandler(route, index)}
            />
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
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: "50%",
    marginTop: -(INDICATOR_SIZE / 2),
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
    width: INDICATOR_SIZE,
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
    color: "#FFFFFF",
  },
});