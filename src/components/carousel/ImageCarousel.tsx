import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { AdBanner } from "@/services/configuration/configurationApi.type";

interface ImageCarouselProps {
  items: AdBanner[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ items }) => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<ICarouselInstance>(null);

  const progress = useSharedValue(0);

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      width: progress.value,
    };
  });

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(36, {
      duration: 3000,
      easing: Easing.linear,
    });
  }, [progress, activeIndex]);

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    ref.current?.scrollTo({
      index,
      animated: true,
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
    >
      <Carousel
        loop
        autoPlay
        autoPlayInterval={3000}
        data={items}
        ref={ref}
        width={width}
        height={width / 2}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ item }: { item: AdBanner }) => (
          <Pressable style={styles.itemContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="stretch"
            />
          </Pressable>
        )}
      />

      <View style={styles.dotsContainer}>
        {Array.from({ length: items.length }).map((_, index) => (
          <Pressable
            key={index}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => handleDotPress(index)}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: colors.border },
                activeIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            >
              {activeIndex === index && (
                <Animated.View
                  style={[
                    styles.completionDot,
                    { backgroundColor: colors.text },
                    animatedDotStyle,
                  ]}
                />
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
  },
  itemContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 36,
    position: "relative",
  },
  completionDot: {
    position: "absolute",
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  inactiveDot: {
    width: 12,
  },
});

export default ImageCarousel;
