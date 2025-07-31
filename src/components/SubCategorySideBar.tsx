import { Category } from "@/services/category/categoryApi.type";
import { SubCategory } from "@/services/sub-category/subCategoryAPI.type";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface SubCategorySidebarProps {
  selectedCategoryId: string;
  categoryData: Category;
  subCategoryData: SubCategory[];
  handleUpdateCategory: (newCategoryId: string) => void;
}

export const SubCategorySideBar = ({
  selectedCategoryId,
  categoryData,
  subCategoryData,
  handleUpdateCategory,
}: SubCategorySidebarProps) => {
  if (!categoryData?.id) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No category data available.</Text>
      </View>
    );
  }

  const renderCategoryItem = (
    item: any,
    isSelected: boolean,
    isMainCategory: boolean = false
  ) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleUpdateCategory(item.id)}
        style={[styles.listItem, isSelected && styles.selectedListItem]}
      >
        {/* Left highlight bar */}
        {isSelected && <View style={styles.highlightBar} />}

        <View style={styles.itemContent}>
          <View
            style={[
              styles.imageContainer,
              isSelected
                ? styles.selectedImageContainer
                : styles.defaultImageContainer,
            ]}
          >
            <Image
              source={{ uri: item.image }}
              style={[
                styles.itemImage,
                isSelected
                  ? styles.selectedImageScale
                  : styles.defaultImageScale,
              ]}
              resizeMode="cover"
            />
          </View>

          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[
              styles.itemText,
              isSelected ? styles.selectedItemText : styles.defaultItemText,
              isMainCategory && styles.mainCategoryText,
            ]}
          >
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with back arrow and category name */}
      <View style={styles.sidebarHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={16} color="rgba(2, 6, 12, 0.75)" />
        </TouchableOpacity>
      </View>

      {/* Scrollable category list */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Render Main Category first */}
        {renderCategoryItem(
          categoryData,
          selectedCategoryId === categoryData.id,
          true
        )}

        {/* Render Subcategories */}
        {subCategoryData.map((subCategory) =>
          renderCategoryItem(subCategory, selectedCategoryId === subCategory.id)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    // Force the container to respect its parent width
    width: "100%",
    maxWidth: "100%",
  },
  noDataContainer: {
    padding: 8, // Reduced padding
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  noDataText: {
    fontSize: 12, // Smaller font
    color: "#666",
    textAlign: "center",
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(40, 44, 63, 0.05)",
    paddingHorizontal: 8, // Reduced from 12
    paddingVertical: 12, // Reduced from 16
    backgroundColor: "white",
    minHeight: 48, // Reduced from 56
  },
  backButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 8, // Reduced from 16
    paddingHorizontal: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12, // Reduced from 20
    paddingVertical: 6, // Reduced from 8
    paddingHorizontal: 4, // Reduced from 8
    position: "relative",
    borderRadius: 6, // Slightly smaller
    // Ensure items don't overflow
    width: "100%",
    maxWidth: "100%",
  },
  selectedListItem: {
    backgroundColor: "rgba(255, 82, 0, 0.05)",
  },
  itemContent: {
    flex: 1,
    alignItems: "center",
    gap: 6, // Reduced from 8
    // Prevent overflow
    minWidth: 0,
    maxWidth: "100%",
  },
  imageContainer: {
    width: 48, // Reduced from 60
    height: 48, // Reduced from 60
    borderRadius: 6, // Adjusted proportionally
    borderWidth: 1,
    borderColor: "rgba(2, 6, 12, 0.15)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    // Prevent the image from pushing sidebar width
    flexShrink: 0,
  },
  selectedImageContainer: {
    borderColor: "#ff5200",
    backgroundColor: "rgba(255, 82, 0, 0.1)",
  },
  defaultImageContainer: {
    backgroundColor: "#f8f9fa",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  selectedImageScale: {
    transform: [{ scale: 1.05 }], // Reduced from 1.1
  },
  defaultImageScale: {
    transform: [{ scale: 1 }],
  },
  itemText: {
    textAlign: "center",
    fontSize: 11, // Reduced from 12
    lineHeight: 13, // Reduced from 14
    fontWeight: "400",
    letterSpacing: -0.2,
    // Ensure text doesn't push sidebar width
    width: "100%",
    maxWidth: "100%",
    paddingHorizontal: 2, // Reduced from 4
    flexShrink: 1,
  },
  defaultItemText: {
    color: "rgba(2, 6, 12, 0.6)",
  },
  mainCategoryText: {
    fontWeight: "500",
  },
  selectedItemText: {
    color: "#ff5200",
    fontWeight: "500",
  },
  highlightBar: {
    position: "absolute",
    left: 0,
    top: "50%",
    height: "60%",
    width: 3,
    borderRadius: 2,
    backgroundColor: "#ff5200",
    transform: [{ translateY: -12 }],
  },
});
