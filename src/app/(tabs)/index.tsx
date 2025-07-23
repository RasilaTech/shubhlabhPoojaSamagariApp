import NavBar from "@/components/nav/NavBar";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: tabBarHeight },
        ]}
      >
        <NavBar />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f0f0f5",
    backgroundColor: "white",
  },
});
