// src/components/common/OtpInput.tsx
import React, { useRef } from "react";
import { Dimensions, StyleSheet, TextInput, View } from "react-native";

const screenWidth = Dimensions.get("window").width;
const isSmallScreen = screenWidth < 375; // iPhone SE and smaller

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  error?: string; // Optional error message prop
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  maxLength,
  error,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleTextChange = (text: string, index: number) => {
    const newOtp = value.split("");
    newOtp[index] = text;
    const updatedValue = newOtp.join("");
    onChange(updatedValue);

    // Auto-focus next input
    if (text && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Auto-focus previous input on backspace if current is empty
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpInputGroup}>
      {Array.from({ length: maxLength }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => {
            // Correct ref callback
            inputRefs.current[i] = ref;
          }}
          style={[
            styles.otpInputSlot,
            error && styles.otpInputSlotError, // Apply error style if error exists
            { borderColor: value[i] ? "#fb641b" : "#ccc" }, // Highlight if slot has value
          ]}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) => handleTextChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          value={value[i] || ""}
          caretHidden={false} // Show cursor
          returnKeyType={i === maxLength - 1 ? "done" : "next"}
          blurOnSubmit={false} // Prevents keyboard from closing on 'next'
          onSubmitEditing={() => {
            // Manually focus next on submit
            if (i < maxLength - 1) {
              inputRefs.current[i + 1]?.focus();
            }
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  otpInputGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: isSmallScreen ? 4 : 8, // Smaller gap on small screens
    width: "100%",
    maxWidth: isSmallScreen ? 280 : 320, // Adjust max width based on screen size
    alignSelf: "center",
    paddingHorizontal: 8,
  },
  otpInputSlot: {
    width: isSmallScreen ? 38 : 45, // Smaller width on small screens
    height: isSmallScreen ? 44 : 50, // Smaller height on small screens
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    fontSize: isSmallScreen ? 18 : 20, // Smaller font on small screens
    color: "#333",
    backgroundColor: "#fff",
  },
  otpInputSlotError: {
    borderColor: "red", // Style for error state
  },
});
