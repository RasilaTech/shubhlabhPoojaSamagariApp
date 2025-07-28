import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Category } from "@/services/category/categoryApi.type";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import { useGetProductsInfiniteQuery } from "@/services/product/productApi";
import ProductItem from "./card/ProductItem";

interface TopCategoriesWithProductProps {
  category: Category;
}

const TopCategoriesWithProduct = ({
  category,
}: TopCategoriesWithProductProps) => {
  const {
    data: productsInfiniteData = {
      pages: [
        {
          data: [],
        },
      ],
    },
    // isLoading,
    // isError,
  } = useGetProductsInfiniteQuery({
    category_id: category.id,
    limit: 30,
  });

  const products = productsInfiniteData.pages.flatMap((page) => page.data);

  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <Text style={styles.headingText}>{category.name.toUpperCase()}</Text>
        <LinearGradient
          colors={["rgba(2, 6, 12, 0.15)", "rgba(2, 6, 12, 0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.devider}
        />
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllButtonText}>See All</Text>
          <ChevronRight size={13} color="#4F46E5" strokeWidth={3} />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryScrollView}>
          {products.map((product) => (
            <ProductItem product={product} key={product.id} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default TopCategoriesWithProduct;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingTop: 16,
  },
  headingContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headingText: {
    fontSize: 12,
    fontFamily: "outfit-medium",
    color: "#02060cbf",
    letterSpacing: 1.5,
  },
  devider: {
    flex: 1,
    height: 1,
  },
  seeAllButton: {
    flexDirection: "row",
    gap: 1,
    alignItems: "center",
  },
  seeAllButtonText: {
    fontSize: 13,
    color: "#4F46E5",
    fontFamily: "outfit-semibold",
  },
  categoryScrollView: {
    flexDirection: "row",
    marginTop: 12,
    paddingHorizontal: 16,
    gap: 8,
  }
});
