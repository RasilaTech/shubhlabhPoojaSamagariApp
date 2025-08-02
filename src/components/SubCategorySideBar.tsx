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

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

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
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  if (!categoryData?.id) {
    return (
      <View
        style={[styles.noDataContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
          No category data available.
        </Text>
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
        style={[
          styles.listItem,
          isSelected && styles.selectedListItem,
          {
            backgroundColor: isSelected
              ? colors.accent + "10"
              : colors.cardBackground,
          },
        ]}
      >
        {isSelected && (
          <View
            style={[styles.highlightBar, { backgroundColor: colors.accent }]}
          />
        )}

        <View style={styles.itemContent}>
          <View
            style={[
              styles.imageContainer,
              { borderColor: colors.border },
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
              isMainCategory && styles.mainCategoryText,
              { color: isSelected ? colors.accent : colors.textSecondary },
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
      <View
        style={[
          styles.sidebarHeader,
          {
            backgroundColor: colors.cardBackground,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderCategoryItem(
          categoryData,
          selectedCategoryId === categoryData.id,
          true
        )}

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
    // backgroundColor: 'white',
    width: "100%",
    maxWidth: "100%",
  },
  noDataContainer: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  noDataText: {
    fontSize: 12,
    textAlign: "center",
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    minHeight: 48,
  },
  backButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    position: "relative",
    borderRadius: 6,
    width: "100%",
    maxWidth: "100%",
  },
  selectedListItem: {
    // backgroundColor: "rgba(255, 82, 0, 0.05)",
  },
  itemContent: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    minWidth: 0,
    maxWidth: "100%",
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedImageContainer: {
    borderColor: "#ff5200",
  },
  defaultImageContainer: {},
  itemImage: {
    width: "100%",
    height: "100%",
  },
  selectedImageScale: {
    transform: [{ scale: 1.05 }],
  },
  defaultImageScale: {
    transform: [{ scale: 1 }],
  },
  itemText: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "400",
    letterSpacing: -0.2,
    width: "100%",
    maxWidth: "100%",
    paddingHorizontal: 2,
    flexShrink: 1,
  },
  defaultItemText: {},
  mainCategoryText: {
    fontWeight: "500",
  },
  selectedItemText: {
    fontWeight: "500",
  },
  highlightBar: {
    position: "absolute",
    left: 0,
    top: "50%",
    height: "60%",
    width: 3,
    borderRadius: 2,
    transform: [{ translateY: -12 }],
  },
});
