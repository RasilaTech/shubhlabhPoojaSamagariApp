import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Search } from "lucide-react-native";
import RotatingText from "../animated/RotatingText";

const NavBar = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");

  const handleLogoPress = () => {
    //TODO: Implement navigation to home screen
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleLogoPress}>
        <Image
          source={require("../../../assets/images/navbar-logo.png")}
          style={[styles.image, isFocused ? { height: 0 } : { height: 45 }]}
        />
      </TouchableOpacity>

      <View style={{ width: "100%", paddingHorizontal: 16 }}>
        <View style={styles.inputContainer}>
          <Search size={18} strokeWidth={2.5} />
          {!isFocused && !query && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Search </Text>
              <RotatingText
                texts={['"Coconut"', '"Oil"', '"Agarbatti"', '"Diyas"']}
                staggerFrom={"last"}
                staggerDuration={0.025}
                rotationInterval={2000}
                textStyle={styles.rotatingTextStyle}
                initial={{ translateY: "100%" }}
                animate={{ translateY: 0 }}
                exit={{ translateY: "-120%" }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              />
            </View>
          )}
          <TextInput
            style={styles.input}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
      </View>
    </View>
  );
};

export default NavBar;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomColor: "#eeeeee",
    borderBottomWidth: 1,
    paddingVertical: 8,
    gap: 8,
  },
  image: {
    resizeMode: "contain",
  },
  inputContainer: {
    borderColor: "#0000000a",
    borderWidth: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 8,
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    height: 40,
    gap: 8,
    borderRadius: 12,
  },
  input: {
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
