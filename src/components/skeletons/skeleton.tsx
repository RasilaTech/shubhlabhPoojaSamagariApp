import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";

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

  const shimmer = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E0E0E0", "#F0F0F0"],
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
    backgroundColor: "#E0E0E0", // Fallback color
  },
});

export default Skeleton;
