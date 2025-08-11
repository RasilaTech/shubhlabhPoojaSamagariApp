import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

import { darkColors, lightColors } from "@/constants/ThemeColors";
import { useTheme } from "@/hooks/useTheme";

export interface CompleteAddressProps {
  address_line1: string;
  address_line2: string;
  landmark: string;
  phone_number: string;
  name: string;
}

// --- Zod Schema ---
export const addressSchema = z.object({
  address_line1: z.string().min(1, "Address Line 1 is required"),
  address_line2: z.string().min(1, "Address Line 2 is required"),
  landmark: z.string().optional(),
  name: z.string().min(1, "Receiver's name is required"),
  phone_number: z
    .string()
    .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressDetailBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: CompleteAddressProps) => void;
}

export const AddressDetailBottomSheet = ({
  isVisible,
  onClose,
  onSave,
}: AddressDetailBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_line1: "",
      address_line2: "",
      landmark: "",
      name: "",
      phone_number: "",
    },
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const onSubmit = (data: AddressFormData) => {
    onSave({
      ...data,
      address_line2: data.address_line2 ?? "",
      landmark: data.landmark ?? "",
      phone_number: `+91${data.phone_number}`,
    });
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <Pressable
            style={[
              styles.bottomSheetContent,
              { backgroundColor: colors.cardBackground },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Choose a delivery address
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.formScrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formContainer}>
                {/* Address Line 1 */}
                <View>
                  <Controller
                    control={control}
                    name="address_line1"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.textInput,
                          { borderColor: colors.border, color: colors.text },
                        ]}
                        placeholder="HOUSE / FLAT / FLOOR NO."
                        placeholderTextColor={colors.textSecondary}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.address_line1 && (
                    <Text
                      style={[styles.errorText, { color: colors.destructive }]}
                    >
                      {errors.address_line1.message}
                    </Text>
                  )}
                </View>

                {/* Address Line 2 */}
                <View>
                  <Controller
                    control={control}
                    name="address_line2"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.textInput,
                          { borderColor: colors.border, color: colors.text },
                        ]}
                        placeholder="APARTMENT / ROAD / AREA"
                        placeholderTextColor={colors.textSecondary}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                </View>

                {/* Landmark */}
                <View>
                  <Controller
                    control={control}
                    name="landmark"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.textInput,
                          { borderColor: colors.border, color: colors.text },
                        ]}
                        placeholder="LANDMARK, ADDITIONAL INFO, ETC. (OPTIONAL)"
                        placeholderTextColor={colors.textSecondary}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                </View>

                {/* Name */}
                <View>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.textInput,
                          { borderColor: colors.border, color: colors.text },
                        ]}
                        placeholder="Receiver's Name"
                        placeholderTextColor={colors.textSecondary}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.name && (
                    <Text
                      style={[styles.errorText, { color: colors.destructive }]}
                    >
                      {errors.name.message}
                    </Text>
                  )}
                </View>

                {/* Phone Number */}
                <View>
                  <Controller
                    control={control}
                    name="phone_number"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.textInput,
                          { borderColor: colors.border, color: colors.text },
                        ]}
                        placeholder="Receiver's Number e.g 9876543210"
                        placeholderTextColor={colors.textSecondary}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="phone-pad"
                        maxLength={10}
                      />
                    )}
                  />
                  {errors.phone_number && (
                    <Text
                      style={[styles.errorText, { color: colors.destructive }]}
                    >
                      {errors.phone_number.message}
                    </Text>
                  )}
                </View>
              </View>
            </ScrollView>

            <View
              style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
            >
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                style={[styles.saveButton, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.saveButtonText}>SAVE AND PROCEED</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    justifyContent: "flex-end",
  },
  bottomSheetContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Set minimum height for content
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  closeButton: {
    borderRadius: 20,
    padding: 8,
    marginLeft: 12,
  },
  formScrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  formContainer: {
    gap: 10,
  },
  textInput: {
    borderBottomWidth: 1.5,
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 4,
    fontSize: 15,
    lineHeight: 20,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "white",
  },
});
