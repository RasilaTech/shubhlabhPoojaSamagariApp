import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { View, Text, StyleSheet } from "react-native";
import { MotiView, MotiText, AnimatePresence } from "moti";

// Ref interface for controlling the component from a parent
export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

// Component props interface, adapted for React Native
export interface RotatingTextProps {
  texts: string[];
  style?: object;
  textStyle?: object;
  transition?: object;
  initial?: object;
  animate?: object;
  exit?: object;
  animatePresenceMode?: "sync" | "wait";
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  onNext?: (index: number) => void;
  splitBy?: "characters" | "words" | "lines" | string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      style,
      textStyle,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { translateY: 20, opacity: 0 },
      animate = { translateY: 0, opacity: 1 },
      exit = { translateY: -20, opacity: 0 },
      animatePresenceMode = "wait",
      rotationInterval = 2000,
      staggerDuration = 0.05,
      staggerFrom = "first",
      loop = true,
      auto = true,
      onNext,
      splitBy = "characters",
      ...rest
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

    // Splits a string into its individual characters (graphemes), handling emojis correctly.
    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
        return Array.from(
          segmenter.segment(text),
          (segment) => segment.segment
        );
      }
      return Array.from(text);
    };

    // Memoizes the current text split into animatable elements based on the `splitBy` prop.
    const elements = useMemo(() => {
      const currentText: string = texts[currentTextIndex] || "";
      if (splitBy === "characters") {
        const words = currentText.split(" ");
        return words.map((word, i) => ({
          elements: splitIntoCharacters(word),
          needsSpace: i !== words.length - 1,
        }));
      }
      if (splitBy === "words") {
        return currentText.split(" ").map((word, i, arr) => ({
          elements: [word],
          needsSpace: i !== arr.length - 1,
        }));
      }
      if (splitBy === "lines") {
        return currentText.split("\n").map((line, i, arr) => ({
          elements: [line],
          needsSpace: i !== arr.length - 1,
        }));
      }
      // Fallback for custom separators
      return currentText.split(splitBy).map((part, i, arr) => ({
        elements: [part],
        needsSpace: i !== arr.length - 1,
      }));
    }, [texts, currentTextIndex, splitBy]);

    // Calculates the stagger delay for each element's animation.
    const getStaggerDelay = useCallback(
      (index: number, totalElements: number): number => {
        const total = totalElements;
        const durationInMs = staggerDuration * 1000;
        switch (staggerFrom) {
          case "first":
            return index * durationInMs;
          case "last":
            return (total - 1 - index) * durationInMs;
          case "center":
            const center = Math.floor(total / 2);
            return Math.abs(center - index) * durationInMs;
          case "random":
            const randomIndex = Math.floor(Math.random() * total);
            return Math.abs(randomIndex - index) * durationInMs;
          default:
            return Math.abs((staggerFrom as number) - index) * durationInMs;
        }
      },
      [staggerFrom, staggerDuration]
    );

    // --- Component Control Logic ---
    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        onNext?.(newIndex);
      },
      [onNext]
    );

    const next = useCallback(() => {
      const isLast = currentTextIndex === texts.length - 1;
      const nextIndex = isLast
        ? loop
          ? 0
          : currentTextIndex
        : currentTextIndex + 1;
      if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      const isFirst = currentTextIndex === 0;
      const prevIndex = isFirst
        ? loop
          ? texts.length - 1
          : currentTextIndex
        : currentTextIndex - 1;
      if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
      },
      [texts.length, currentTextIndex, handleIndexChange]
    );

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) handleIndexChange(0);
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [
      next,
      previous,
      jumpTo,
      reset,
    ]);

    // --- Automatic Rotation Effect ---
    // This is the standard, safe way to handle intervals in React.
    useEffect(() => {
      if (!auto) return;
      const intervalId = setInterval(next, rotationInterval);
      // The cleanup function is crucial to prevent memory leaks.
      return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto]);

    // --- Render Logic ---
    return (
      <MotiView style={[styles.container, style]} {...rest}>
        <AnimatePresence exitBeforeEnter={animatePresenceMode === "wait"}>
          <MotiView
            key={currentTextIndex}
            style={
              splitBy === "lines" ? styles.linesContainer : styles.textContainer
            }
            accessibilityLabel={texts[currentTextIndex]}
          >
            {elements.map((group, groupIndex, array) => {
              const previousElementsCount = array
                .slice(0, groupIndex)
                .reduce(
                  (sum, currentGroup) => sum + currentGroup.elements.length,
                  0
                );

              const totalElements = array.reduce(
                (sum, currentGroup) => sum + currentGroup.elements.length,
                0
              );

              return (
                <View key={groupIndex} style={styles.groupContainer}>
                  {group.elements.map((element, elementIndex) => (
                    <MotiText
                      key={`${groupIndex}-${elementIndex}`}
                      from={initial}
                      animate={animate}
                      exit={exit}
                      transition={{
                        ...transition,
                        delay: getStaggerDelay(
                          previousElementsCount + elementIndex,
                          totalElements
                        ),
                      }}
                      style={[styles.text, textStyle]}
                    >
                      {element}
                    </MotiText>
                  ))}
                  {group.needsSpace && (
                    <Text style={[styles.text, textStyle]}>
                      {splitBy === "lines" ? "\n" : " "}
                    </Text>
                  )}
                </View>
              );
            })}
          </MotiView>
        </AnimatePresence>
      </MotiView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  textContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  linesContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  groupContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  text: {},
});

RotatingText.displayName = "RotatingText";
export default RotatingText;
