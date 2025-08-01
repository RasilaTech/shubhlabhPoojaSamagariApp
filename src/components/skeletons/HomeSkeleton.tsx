import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import Skeleton from "./skeleton";

export function HomeSkeleteon() {
  const categoryData = [...Array(10)]; // Generate a fixed number of category placeholders
  const trendingProductsData = [...Array(4)]; // Generate a fixed number of product placeholders

  return (
    <View style={styles.outerContainer}>
      {/* Categories */}
      <View style={styles.sectionContainer}>
        <Skeleton width={128} height={24} style={styles.sectionHeading} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categoryData}
          keyExtractor={(_, i) => `category-skeleton-${i}`}
          renderItem={({ item }) => (
            <View style={styles.categoryItem}>
              <Skeleton width={64} height={64} borderRadius={16} />
              <Skeleton width={80} height={12} />
            </View>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Banner */}
      <View style={styles.sectionContainer}>
        <Skeleton width="100%" height={160} borderRadius={16} />
      </View>

      {/* Trending Products */}
      <View style={styles.sectionContainer}>
        <Skeleton width={160} height={24} style={styles.sectionHeading} />
        <View style={styles.productGrid}>
          {trendingProductsData.map((_, i) => (
            <View key={`trending-${i}`} style={styles.productItem}>
              <Skeleton width="100%" height={128} borderRadius={8} />
              <Skeleton width={96} height={16} />
              <Skeleton width={64} height={16} />
            </View>
          ))}
        </View>
      </View>

      {/* Another Product Grid */}
      <View style={styles.sectionContainer}>
        <Skeleton width={160} height={24} style={styles.sectionHeading} />
        <View style={styles.productGrid}>
          {trendingProductsData.map((_, i) => (
            <View key={`trending-2-${i}`} style={styles.productItem}>
              <Skeleton width="100%" height={128} borderRadius={8} />
              <Skeleton width={96} height={16} />
              <Skeleton width={64} height={16} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    padding: 16, // px-4 py-6
    backgroundColor: "#fff",
    gap: 24, // space-y-6
  },
  sectionContainer: {
    gap: 16, // space-y-4
  },
  sectionHeading: {
    marginBottom: 16, // mb-4
  },
  categoryList: {
    gap: 16, // space-x-4
    paddingRight: 24, // Ensure some padding at the end of the horizontal list
  },
  categoryItem: {
    alignItems: "center",
    gap: 8, // space-y-2
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16, // gap-4
    justifyContent: "space-between",
  },
  productItem: {
    flexBasis: "48%", // Approx. grid-cols-2
    gap: 8, // space-y-2
    marginBottom: 16, // Margin for the grid layout
  },
});
