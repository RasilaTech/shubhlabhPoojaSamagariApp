import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Category } from "@/services/category/categoryApi.type";

interface CategoryHomeScreenCardProps {
  category: Category;
}

const CategoryHomeScreenCard = ({ category }: CategoryHomeScreenCardProps) => {
  return (
    <TouchableOpacity style={styles.container}>
      <Image
        source={{ uri: category.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text numberOfLines={2} style={styles.text}>
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
    fontFamily: "outfit-medim",
    color: "#323232",
    textAlign: "center",
  },
});
