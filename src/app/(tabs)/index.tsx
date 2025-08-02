import CategoryHomeScreenCard from "@/components/card/CategoryHomeScreenCard";
import ImageCarousel from "@/components/carousel/ImageCarousel";
import OrderErrorScreen from "@/components/error/OrderErrorScree";
import NavBar from "@/components/nav/NavBar";
import { HomeSkeleteon } from "@/components/skeletons/HomeSkeleton";
import TopCategoriesWithProduct from "@/components/TopCategoriesWithProduct";
import { useGetCategoriesInfiniteQuery } from "@/services/category/categoryApi";
import { useGetAppConfigurationsQuery } from "@/services/configuration/configurationApi";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { ChevronRight } from "lucide-react-native";

export default function HomeScreen() {
  const {
    data: categoriesData = {
      pages: [
        {
          data: [],
        },
      ],
    },
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetCategoriesInfiniteQuery({
    page: 1,
    sort_by: "priority",
    sort_order: "DESC",
  });

  const {
    isLoading: isAppConfigLoading,
    data: appConfigData,
    isError: isAppConfigError,
  } = useGetAppConfigurationsQuery();

  const categories = categoriesData.pages.flatMap((page) => page.data);
  const topFiveCategories = categories.slice(0, 5);

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const isLoading = categoriesLoading || isAppConfigLoading;
  const isError = categoriesError || isAppConfigError;
  const adBanners = appConfigData?.data?.ad_banners;

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: tabBarHeight,
            backgroundColor: colors.background,
          },
        ]}
      >
        <HomeSkeleteon />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: tabBarHeight,
            backgroundColor: colors.background,
          },
        ]}
      >
        <OrderErrorScreen />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: tabBarHeight,
            backgroundColor: colors.background,
          },
        ]}
      >
        <NavBar />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.categoryListContainer,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.headingContainer}>
              <Text style={[styles.headingText, { color: colors.text }]}>
                Shop By Category
              </Text>
              <LinearGradient
                colors={["rgba(2, 6, 12, 0.15)", "rgba(2, 6, 12, 0)"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.devider}
              />
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => {
                  router.push("/categories");
                }}
              >
                <Text
                  style={[styles.seeAllButtonText, { color: colors.accent }]}
                >
                  See All
                </Text>
                <ChevronRight size={13} color={colors.accent} strokeWidth={3} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryScrollView}>
                {categories.map((category) => (
                  <CategoryHomeScreenCard
                    key={category.id}
                    category={category}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
          {adBanners && adBanners.length > 0 && (
            <ImageCarousel items={adBanners} />
          )}

          {topFiveCategories.length > 0 &&
            topFiveCategories.map((category) => (
              <TopCategoriesWithProduct category={category} key={category.id} />
            ))}
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryListContainer: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  headingContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  devider: {
    flex: 1,
    height: 1,
  },
  headingText: {
    fontSize: 16,
    fontFamily: "outfit-medium",
  },
  seeAllButtonText: {
    fontSize: 13,
    fontFamily: "outfit-semibold",
  },
  seeAllButton: {
    flexDirection: "row",
    gap: 1,
    alignItems: "center",
  },
  categoryScrollView: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
});
