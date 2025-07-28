import { Category } from "@/services/category/categoryApi.type";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // Navigate to a 'CategoryDetails' screen or similar, passing the category ID
        // You'll need to define 'CategoryDetails' in your React Navigation stack
      //  navigation.navigate("CategoryDetails", { categoryId: category.id });
      }}
      activeOpacity={0.8} // Adjust opacity when pressed
    >
      <Image
        source={{ uri: category.image }}
        style={styles.image}
        resizeMode="cover" // Equivalent to object-cover
      />
      <View style={styles.overlay}>
        <Text style={styles.name}>{category.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    overflow: "hidden", // Ensures the image and overlay are clipped to the border radius
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.1, // For iOS shadow
    shadowRadius: 3, // For iOS shadow
    elevation: 3, // For Android shadow
    backgroundColor: "#fff", // Background color for shadow on Android
    margin: 8, // Add some margin if used in a list or grid
    flex: 1, // To allow it to take available space in a flex container
  },
  image: {
    width: "100%", // Take full width of the card
    height: 160, // Fixed height for consistency, equivalent to h-40 in Tailwind
    // For md:h-60, you might use conditional styling or a larger default if it's primarily for tablets
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // black/70
    paddingVertical: 8, // py-2
    alignItems: "center", // text-center
  },
  name: {
    fontSize: 14, // text-sm
    fontWeight: "600", // font-semibold
    color: "#fff", // text-white
  },
});

export default CategoryCard;
