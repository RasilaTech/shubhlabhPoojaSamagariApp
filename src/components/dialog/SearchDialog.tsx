import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Product } from "@/services/product/productApi.type";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import ProductCardInSearchBox from "../card/ProductCardInSearchBox";

interface SearchDialogProps {
  products: Product[];
  query: string;
}

const SearchDialog = ({ products, query }: SearchDialogProps) => {
  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={styles.container}
    >
      {products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCardInSearchBox product={item} />}
          style={styles.list}
        />
      ) : (
        <View style={styles.noResultContainer}>
          <Text style={styles.noResultText}>
            No result found for &quot;{query}&quot;
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

export default SearchDialog;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 55,
    left: 16,
    right: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    maxHeight: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  list: {
    padding: 8,
  },
  card: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  noResultContainer: {
    padding: 16,
    alignItems: "center",
  },
  noResultText: {
    color: "#6B7280",
  },
});
