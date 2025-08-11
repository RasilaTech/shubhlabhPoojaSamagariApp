import { Check, X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface AnimatedIconProps {
  type: "success" | "failure";
  color: string;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ type, color }) => {
  const bounceValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bounce and Pulse animations
    Animated.loop(
      Animated.parallel([
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceValue, pulseValue]);

  const bounce = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const pulse = pulseValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View style={styles.iconWrapper}>
      {/* Outer Pulse */}
      <Animated.View
        style={[
          styles.outerPulse,
          {
            backgroundColor: color,
            opacity: pulse,
          },
        ]}
      />
      {/* Middle Pulse */}
      <Animated.View
        style={[
          styles.middlePulse,
          {
            backgroundColor: color,
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0],
            }),
          },
        ]}
      />
      {/* Inner Icon */}
      <Animated.View
        style={[
          styles.innerIcon,
          {
            transform: [{ scale: bounce }],
            backgroundColor: "white",
          },
        ]}
      >
        {type === "success" ? (
          <Check size={48} color={color} strokeWidth={3} />
        ) : (
          <X size={48} color={color} strokeWidth={3} />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    height: 128,
    width: 128,
    alignItems: "center",
    justifyContent: "center",
  },
  outerPulse: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9999,
  },
  middlePulse: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 9999,
    transform: [{ scale: 1.2 }],
  },
  innerIcon: {
    height: 96,
    width: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
  },
});

export default AnimatedIcon;
