import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  // FIX: Shimmer colors are now theme-aware
  const shimmer = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.background, colors.cardBackground],
  });

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius, backgroundColor: shimmer },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    // backgroundColor: '#E0E0E0', // Removed fallback, handled by shimmer
  },
});

export default Skeleton;
