import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";
import { useGetProductsInfiniteQuery } from "@/services/product/productApi";
import { useAppSelector } from "@/store/hook";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RotatingText from "../animated/RotatingText";
import ChatIcon from "../button/ChatIcon";
import { LoginButton } from "../button/LoginButton";
import SearchDialog from "../dialog/SearchDialog";

const NavBar = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const blurTimeoutRef = useRef<number | null>(null);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const {
    data: productsData = {
      pages: [
        {
          data: [],
        },
      ],
    },
    // isLoading,
    // isError,
  } = useGetProductsInfiniteQuery({ q: query, limit: 7 });
  const products = productsData.pages.flatMap((page) => page.data);

  const handleLogoPress = () => {
    router.push({ pathname: "/" });
    setIsFocused(false);
    setQuery("");
    Keyboard.dismiss();
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay hiding the dialog to allow navigation to complete
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  const handleProductSelect = () => {
    // Clear any pending blur timeout and hide the dialog immediately
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsFocused(false);
    setQuery("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.cardBackground,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Header with Logo and Chat Icon */}
        <View style={styles.headerContainer}>
          {/* Left spacer for centering logo */}
          <View style={styles.leftSpacer} />

          {/* Centered Logo */}
          <TouchableOpacity
            onPress={handleLogoPress}
            style={styles.logoWrapper}
          >
            <Image
              source={require("../../../assets/images/navbar-logo.png")}
              style={[styles.image, isFocused ? { height: 0 } : { height: 45 }]}
            />
          </TouchableOpacity>

          {/* Right side with Chat Icon */}
          <View style={styles.rightContainer}>
            <ChatIcon />
          </View>
        </View>

        {/* Search Container */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Search size={18} strokeWidth={2.5} color={colors.textSecondary} />
            {!isFocused && !query && (
              <View style={styles.placeholderContainer}>
                <Text style={[styles.placeholderText, { color: colors.text }]}>
                  Search{" "}
                </Text>
                <RotatingText
                  texts={['"Coconut"', '"Oil"', '"Agarbatti"', '"Diyas"']}
                  staggerFrom={"last"}
                  staggerDuration={0.025}
                  rotationInterval={2000}
                  textStyle={[styles.rotatingTextStyle, { color: colors.text }]}
                  initial={{ translateY: "100%" }}
                  animate={{ translateY: 0 }}
                  exit={{ translateY: "-120%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                />
              </View>
            )}
            <TextInput
              style={[styles.input, { color: colors.text, fontWeight: "300" }]}
              onChangeText={setQuery}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={query}
            />
          </View>
          {!isAuthenticated && <LoginButton />}
        </View>
      </View>
      {isFocused && query.length > 0 && (
        <SearchDialog
          products={products}
          query={query}
          onProductSelect={handleProductSelect}
        />
      )}
    </View>
  );
};

export default NavBar;

const styles = StyleSheet.create({
  outerContainer: {
    position: "relative",
    width: "100%",
    zIndex: 10,
  },
  container: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomColor: "#eeeeee",
    borderBottomWidth: 1,
    paddingVertical: 8,
    gap: 8,
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  leftSpacer: {
    width: 40, // Same width as the chat icon area to balance centering
  },
  logoWrapper: {
    flex: 1,
    alignItems: "center",
  },
  rightContainer: {
    width: 40,
    alignItems: "flex-end",
  },
  image: {
    resizeMode: "contain",
  },
  searchContainer: {
    width: "100%",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputContainer: {
    borderColor: "#0000000a",
    borderWidth: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 8,
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    height: 40,
    gap: 8,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    width: "100%",
    height: "100%",
    fontWeight: "light",
  },
  placeholderContainer: {
    pointerEvents: "none",
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    left: 38,
  },
  placeholderText: {
    color: "#9E9E9E",
    fontSize: 16,
  },
  rotatingTextStyle: {
    color: "#9E9E9E",
    fontSize: 16,
  },
});
