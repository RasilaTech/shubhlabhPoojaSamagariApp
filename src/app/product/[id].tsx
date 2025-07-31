// app/(tabs)/products/[id].tsx
import ProductDetailCartButton from "@/components/button/ProductDetailCartButton";
import SoldOutBadge from "@/components/button/SoldButton";
import ProductItem2 from "@/components/card/ProductItem2";
import OrderErrorScreen from "@/components/error/OrderErrorScree";
import OrderDetailSkeleton from "@/components/skeletons/OrderSkeleton";
import {
  useGetProductByIdQuery,
  useGetProductsInfiniteQuery,
} from "@/services/product/productApi";
import { Product, ProductVariant } from "@/services/product/productApi.type";
import { LinearGradient } from "expo-linear-gradient"; // For background gradient
import { router, useLocalSearchParams } from "expo-router"; // Use router and useLocalSearchParams
import {
  ChevronLeft,
  RotateCcw,
  Share2,
  Shield,
  Star,
  Truck,
} from "lucide-react-native"; // Lucide icons
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Adjust paths for RTK Query hooks and types

// Import your converted components

// Get screen width for responsive layout
const screenWidth = Dimensions.get("window").width;
const isLargeScreen = screenWidth >= 768; // Example breakpoint for responsive layouts

export default function ProductDetailsScreen() {
  const { id: productId = "" } = useLocalSearchParams<{ id: string }>();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);

  const {
    data: productResponse,
    isLoading,
    isError,
  } = useGetProductByIdQuery(productId, { skip: !productId });

  const productData: Product | null = useMemo(() => {
    return productResponse?.data ?? null;
  }, [productResponse?.data]);

  // Set default variant and category when product data loads or productId changes
  useEffect(() => {
    // FIX START: Ensure product_variants exists before accessing length
    if (
      productData?.product_variants &&
      productData.product_variants.length > 0
    ) {
      const defaultVariant =
        productData.product_variants.find((v) => v.default_variant) ||
        productData.product_variants[0];
      setSelectedVariant(defaultVariant);
      setSelectedImageIndex(0);

      if (defaultVariant.categories?.length) {
        setSelectedCategoryId(defaultVariant.categories[0].id);
      }
    } else if (productData) {
      // If productData exists but has no variants (or variants is empty/null/undefined)
      setSelectedVariant(null);
      setSelectedCategoryId(null);
    }
    // FIX END
  }, [productData, productId]); // Add productId to dependencies to reset state on product change

  const { data: relatedProductResponse } = useGetProductsInfiniteQuery(
    {
      category_id: selectedCategoryId,
      limit: 10,
    },
    {
      skip: !selectedCategoryId, // Skip query if no category is selected
    }
  );

  const handleVariantChange = (variant: ProductVariant): void => {
    setSelectedVariant(variant);
    setSelectedImageIndex(0); // Reset image to first of new variant
  };

  const handleImageSelect = (index: number): void => {
    setSelectedImageIndex(index);
  };

  const calculateDiscountPercentage = (mrp: number, price: number): number => {
    if (!mrp || !price || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleShare = async () => {
    const productLink = `https://shubhlabhpoojasamagri.com/products/${productId}`; // Your actual product link
    const message = `Check out this product: ${
      selectedVariant?.name || "Awesome Product"
    } - ${productLink}`;

    try {
      const result = await Share.share({
        message: message,
        url: productLink,
        title: selectedVariant?.name || "Product Details",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared via ${result.activityType}`);
        } else {
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error: any) {
      Alert.alert("Sharing Error", error.message);
      console.error("Error sharing:", error);
    }
  };

  const randomNumber = useMemo(() => Math.floor(Math.random() * 100) + 1, []);
  const insets = useSafeAreaInsets();

  const truncatedDescription = useMemo(() => {
    const description = selectedVariant?.description || "";
    const words = description.split(" ");
    return words.length > 30 && !showFullDescription
      ? words.slice(0, 30).join(" ") + "..."
      : description;
  }, [selectedVariant?.description, showFullDescription]);

  if (
    isLoading ||
    (productData === null && !isError) ||
    (productData && !selectedVariant)
  ) {
    // Show skeleton if loading or if productData loaded but no selectedVariant (initial setup)
    return <OrderDetailSkeleton />;
  }
  if (isError) {
    return <OrderErrorScreen />;
  }
  // This state should ideally not be reached if productData is properly handled by skeleton/error,
  // but as a fallback if selectedVariant somehow remains null
  if (!productData || !selectedVariant) {
    return <OrderErrorScreen />;
  }

  const relatedProducts =
    relatedProductResponse?.pages
      ?.flatMap((page) => page.data)
      .filter((product) => product.id !== productId) || [];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#02060cbf" />
        </TouchableOpacity>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>
          Product Details
        </Text>
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainContentGrid}>
          {/* Product Image Section */}
          <View style={styles.imageSection}>
            <View style={styles.mainImageWrapper}>
              <Image
                source={{
                  uri:
                    selectedVariant.images?.[selectedImageIndex] ||
                    selectedVariant.images?.[0] ||
                    "https://via.placeholder.com/400x400?text=No+Image",
                }}
                alt="Product"
                style={styles.mainProductImage}
                resizeMode="contain" // object-contain
              />
            </View>

            {/* Thumbnail Gallery (Horizontal ScrollView/FlatList) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailGallery}
            >
              {selectedVariant.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleImageSelect(index)}
                  style={[
                    styles.thumbnailButton,
                    selectedImageIndex === index && styles.selectedThumbnail,
                  ]}
                >
                  <Image
                    source={{ uri: image }}
                    alt={`Thumbnail ${index + 1}`}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Features Section (hidden on mobile, visible on tablet/web) */}
            {isLargeScreen && (
              <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>
                  <Truck size={24} color="#3b82f6" />
                  <Text style={styles.featureText}>3 Days Delivery</Text>
                </View>
                <View style={styles.featureItem}>
                  <Shield size={24} color="#22c55e" />
                  <Text style={styles.featureText}>Quality Assured</Text>
                </View>
                <View style={styles.featureItem}>
                  <RotateCcw size={24} color="#a855f7" />
                  <Text style={styles.featureText}>Easy Returns</Text>
                </View>
              </View>
            )}
          </View>

          {/* Product Details Section */}
          <View style={styles.detailsSection}>
            {/* Title & Brand */}
            <View style={styles.titleBrandRating}>
              <View style={styles.titleShareRow}>
                <Text style={styles.productTitle}>{selectedVariant.name}</Text>
                <TouchableOpacity
                  onPress={handleShare}
                  style={styles.shareButton}
                >
                  <Share2 size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <Text style={styles.brandName}>{selectedVariant.brand_name}</Text>

              {/* Rating */}
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      color="#facc15" // fill-yellow-400
                      fill="#facc15"
                    />
                  ))}
                </View>
                <Text style={styles.reviewText}>
                  Based on {randomNumber} Reviews
                </Text>
              </View>
            </View>

            {/* Price */}
            <View style={styles.priceInfoContainer}>
              <Text style={styles.currentPrice}>
                ₹{selectedVariant.price.toLocaleString("en-IN")}
              </Text>
              <Text style={styles.originalPrice}>
                ₹{selectedVariant.mrp.toLocaleString("en-IN")}
              </Text>
              <LinearGradient
                colors={["#34d399", "#10b981"]} // from-emerald-400 to-emerald-600
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.discountBadge}
              >
                <Text style={styles.discountBadgeText}>
                  {calculateDiscountPercentage(
                    selectedVariant.mrp,
                    selectedVariant.price
                  )}
                  % OFF
                </Text>
              </LinearGradient>
            </View>

            {/* Variant Selection */}
            <View style={styles.variantSelectionSection}>
              <Text style={styles.variantSelectionTitle}>Select Variant</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.variantOptionsContainer}
              >
                {productData.product_variants.map((variant) => (
                  <TouchableOpacity
                    key={variant.id}
                    onPress={() => handleVariantChange(variant)}
                    style={[
                      styles.variantButton,
                      selectedVariant === variant &&
                        styles.selectedVariantButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.variantButtonText,
                        selectedVariant === variant &&
                          styles.selectedVariantButtonText,
                      ]}
                    >
                      {variant.display_label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Quantity & Add to Cart */}
            <View style={styles.addToCartSection}>
              {selectedVariant.out_of_stock === true ? (
                <SoldOutBadge />
              ) : (
                <ProductDetailCartButton productVariant={selectedVariant} />
              )}
            </View>

            {/* Description (mobile only) */}
            {!isLargeScreen && (
              <View style={styles.descriptionContainerMobile}>
                <Text>{truncatedDescription}</Text>
                {selectedVariant.description &&
                  selectedVariant.description.split(" ").length > 30 && (
                    <TouchableOpacity
                      onPress={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      style={styles.showMoreButton}
                    >
                      <Text style={styles.showMoreButtonText}>
                        {showFullDescription ? "- Show Less" : "+ Show More"}
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            )}
          </View>
        </View>

        {/* Mobile features section (hidden on desktop, visible on mobile) */}
        {!isLargeScreen && (
          <View style={styles.featuresGridMobile}>
            <View style={styles.featureItem}>
              <Truck size={24} color="#3b82f6" />
              <Text style={styles.featureText}>3 Days Delivery</Text>
            </View>
            <View style={styles.featureItem}>
              <Shield size={24} color="#22c55e" />
              <Text style={styles.featureText}>Quality Assured</Text>
            </View>
            <View style={styles.featureItem}>
              <RotateCcw size={24} color="#a855f7" />
              <Text style={styles.featureText}>Easy Returns</Text>
            </View>
          </View>
        )}

        {/* Related products section */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedProductsSection}>
            <Text style={styles.relatedProductsTitle}>You might also like</Text>
            <FlatList
              data={relatedProducts}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.relatedProductItemWrapper,
                    { width: isLargeScreen ? "22%" : "48%" },
                  ]}
                >
                  <ProductItem2 product={item} />
                </View>
              )}
              keyExtractor={(item) => item.id}
              numColumns={isLargeScreen ? 4 : 2}
              columnWrapperStyle={styles.relatedProductsColumnWrapper}
              contentContainerStyle={styles.relatedProductsContentContainer}
              scrollEnabled={false} // Parent ScrollView handles overall scroll
            />
          </View>
        )}
      </ScrollView>

      {/* Fixed Cart Summary Banner */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    shadowColor: "#000", // shadow-cart-card (approx)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4, // Android shadow
  },
  backButton: {
    paddingRight: 10, // gap-2 from original
  },
  headerTitle: {
    flex: 1, // Allow title to take remaining space
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: "#02060cbf",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20, // Space for fixed header
    backgroundColor: "#f0f0f5",
  },
  mainContentGrid: {
    flexDirection: isLargeScreen ? "row" : "column",
    gap: 12,
    alignItems: "flex-start",
  },
  imageSection: {
    flexDirection: "column",
    width: "100%",
    gap: 16,
    alignItems: "center",
  },
  mainImageWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    maxWidth: 400,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  mainProductImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  thumbnailGallery: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
  },
  thumbnailButton: {
    height: 80,
    width: 80,
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 16,
  },
  selectedThumbnail: {
    transform: [{ scale: 1.05 }],
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    borderWidth: 3,
    borderColor: "#f97316",
  },
  thumbnailImage: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
  },
  featuresGrid: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 32,
    paddingHorizontal: 0,
    width: "100%",
  },
  featuresGridMobile: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 32,
    width: "100%",
  },
  featureItem: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    backgroundColor: "#fff",
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  featureText: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 8,
    textAlign: "center",
  },
  detailsSection: {
    flexDirection: "column",
    width: "100%",
    gap: 24,
  },
  titleBrandRating: {
    flexDirection: "column",
    gap: 8,
  },
  titleShareRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  productTitle: {
    marginRight: 16,
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  shareButton: {
    flexShrink: 0,
    padding: 5,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "500",
    color: "#4b5563",
  },
  ratingContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  reviewText: {
    fontSize: 14,
    color: "#4b5563",
  },
  priceInfoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 8,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  originalPrice: {
    fontSize: 16, // text-l (adjusted from text-l)
    color: "#9ca3af", // text-gray-400
    textDecorationLine: "line-through",
  },
  discountBadge: {
    borderRadius: 9999, // rounded-full
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
    shadowColor: "#000", // shadow-lg
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  discountBadgeText: {
    fontSize: 14, // text-sm
    fontWeight: "600", // font-semibold
    color: "#fff", // text-white
  },
  descriptionContainerMobile: {
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    borderColor: "#bfdbfe", // border-blue-100
    backgroundColor: "#eff6ff", // A single color fallback for the gradient
    padding: 24, // p-6
    // md:hidden - handled by isLargeScreen conditional rendering
  },
  descriptionContainerDesktop: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
    padding: 24,
    // md:block - handled by isLargeScreen conditional rendering
  },

  showMoreButton: {
    marginTop: 8, // mt-2
  },
  showMoreButtonText: {
    color: "#ea580c", // text-orange-600
    // hover:underline - not applicable in RN
    textDecorationLine: "underline",
  },
  variantSelectionSection: {
    width: "100%", // w-full
    gap: 12, // space-y-3
  },
  variantSelectionTitle: {
    fontSize: 18, // text-lg
    fontWeight: "600", // font-semibold
    color: "#1f2937", // text-gray-900
  },
  variantOptionsContainer: {
    flexDirection: "row", // flex
    minWidth: "100%", // min-w-max (ensure it scrolls)
    gap: 12, // gap-3
    paddingBottom: 4, // pb-2 (for scroll indicator space)
  },
  variantButton: {
    flexShrink: 0,
    borderRadius: 16, // rounded-2xl
    paddingHorizontal: 12, // px-6
    paddingVertical: 12, // py-3
    borderWidth: 1,
    borderColor: "black",
  },
  selectedVariantButton: {
    // bg-gradient-to-r from-orange-500 to-red-500
    backgroundColor: "#f97316", // orange-500 (start color)
    borderColor: "#f97316",
    shadowColor: "#000", // shadow-lg
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    transform: [{ scale: 1.05 }], // scale-105
  },
  variantButtonText: {
    fontSize: 16, // font-medium (implied from context)
    fontWeight: "500",
    color: "#4b5563", // text-gray-700
  },
  selectedVariantButtonText: {
    color: "#fff", // text-white
  },
  addToCartSection: {
    flexDirection: "row", // flex w-full
    width: "100%",
  },
  relatedProductsSection: {
    marginTop: 32, // mt-8
    width: "100%", // w-full
  },
  relatedProductsTitle: {
    marginBottom: 32, // mb-8
    fontSize: 30, // text-3xl
    fontWeight: "bold", // font-bold
    color: "#1f2937", // text-gray-900
  },
  relatedProductsColumnWrapper: {
    justifyContent: "flex-start", // Fixed: start from left
    gap: 8, // Consistent gap between items
    marginBottom: 16,
  },
  relatedProductsContentContainer: {
    // Container styles if needed
  },
  relatedProductItemWrapper: {
    marginBottom: 2, // Vertical spacing between rows
    // Width is set dynamically in the component: 48% for mobile, 23% for desktop
  },
});
