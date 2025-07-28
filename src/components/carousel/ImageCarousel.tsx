import {
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
  Pressable,
} from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect, useRef, useState } from "react";

export interface CarouselItemData {
  id: string | number;
  imageUri: string;
  onPress?: () => void;
}

interface ImageCarouselProps {
  items: CarouselItemData[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ items }) => {
  const { width } = useWindowDimensions();

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
    <View style={styles.container}>
      <Carousel
        loop
        autoPlay
        autoPlayInterval={3000}
        data={items}
        ref={ref}
        width={width}
        height={width / 2}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ item }: { item: CarouselItemData }) => (
          <Pressable style={styles.itemContainer}>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
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
                activeIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            >
              {activeIndex === index && (
                <Animated.View
                  style={[styles.completionDot, animatedDotStyle]}
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
    backgroundColor: "white",
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
    backgroundColor: "#00000021",
    position: "relative",
  },
  completionDot: {
    position: "absolute",
    backgroundColor: "black",
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  inactiveDot: {
    width: 12,
    backgroundColor: "#00000021",
  },
});

export default ImageCarousel;
