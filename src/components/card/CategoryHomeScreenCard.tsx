import { Category } from "@/services/category/categoryApi.type";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

interface CategoryHomeScreenCardProps {
  category: Category;
}

const CategoryHomeScreenCard = ({ category }: CategoryHomeScreenCardProps) => {
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        router.push({
          pathname: "/(tabs)/categories/[id]",
          params: { id: category.id },
        });
      }}
    >
      <Image
        source={{ uri: category.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text
        numberOfLines={2}
        style={[styles.text, { color: colors.textSecondary }]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

export default CategoryHomeScreenCard;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 20,
  },
  text: {
    maxWidth: 75,
    fontSize: 13,
    fontFamily: "outfit-medium",
    textAlign: "center",
  },
});
