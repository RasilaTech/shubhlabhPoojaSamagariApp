import NavBar from "@/components/nav/NavBar";
import { useGetCategoriesInfiniteQuery } from "@/services/category/categoryApi";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import CategoryHomeScreenCard from "@/components/card/CategoryHomeScreenCard";
import ImageCarousel from "@/components/carousel/ImageCarousel";
import TopCategoriesWithProduct from "@/components/TopCategoriesWithProduct";

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

  const carouselData: CarouselItemData[] = [
    {
      id: 1,
      imageUri: "https://images.unsplash.com/photo-1554995207-c18c203602cb",
      onPress: () => Alert.alert("Action!", "You tapped on the living room."),
    },
    {
      id: 2,
      imageUri: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      onPress: () =>
        Alert.alert("Action!", "You tapped on the two-story house."),
    },
    {
      id: 3,
      imageUri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      // This item has no onPress action
    },
    {
      id: 1,
      imageUri: "https://images.unsplash.com/photo-1554995207-c18c203602cb",
      onPress: () => Alert.alert("Action!", "You tapped on the living room."),
    },
    {
      id: 2,
      imageUri: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      onPress: () =>
        Alert.alert("Action!", "You tapped on the two-story house."),
    },
    {
      id: 3,
      imageUri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      // This item has no onPress action
    },
    {
      id: 1,
      imageUri: "https://images.unsplash.com/photo-1554995207-c18c203602cb",
      onPress: () => Alert.alert("Action!", "You tapped on the living room."),
    },
    {
      id: 2,
      imageUri: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      onPress: () =>
        Alert.alert("Action!", "You tapped on the two-story house."),
    },
    {
      id: 3,
      imageUri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      // This item has no onPress action
    },
    {
      id: 1,
      imageUri: "https://images.unsplash.com/photo-1554995207-c18c203602cb",
      onPress: () => Alert.alert("Action!", "You tapped on the living room."),
    },
  ];

  const categories = categoriesData.pages.flatMap((page) => page.data);
  const topFiveCategories = categories.slice(0, 5);

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.container,
            { paddingTop: insets.top, paddingBottom: tabBarHeight },
          ]}
        >
          <NavBar />
          <View style={styles.categoryListContainer}>
            <View style={styles.headingContainer}>
              <Text style={styles.headingText}>Shop By Category</Text>
              <LinearGradient
                colors={["rgba(2, 6, 12, 0.15)", "rgba(2, 6, 12, 0)"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.devider}
              />
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllButtonText}>See All</Text>
                <ChevronRight size={13} color="#1976D2" strokeWidth={3} />
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
          <ImageCarousel items={carouselData} />
          {topFiveCategories.length > 0 &&
            topFiveCategories.map((category) => (
              <TopCategoriesWithProduct category={category} key={category.id} />
            ))}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
  },
  categoryListContainer: {
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
    backgroundColor: "white",
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
    color: "#02060C",
  },
  seeAllButtonText: {
    fontSize: 13,
    color: "#1976D2",
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
  },
});
