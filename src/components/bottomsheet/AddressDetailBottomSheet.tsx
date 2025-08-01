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
import { useSafeAreaInsets } from "react-native-safe-area-context"; // For bottom safe area
import { z } from "zod";

export interface CompleteAddressProps {
  address_line1: string;
  address_line2: string;
  landmark: string;
  phone_number: string;
  name: string;
}

// --- Zod Schema ---
export const addressSchema = z.object({
  address_line1: z.string().min(10, "Address Line 1 is required"),
  address_line2: z.string().min(10, "Address Line 2 is required"),
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
    // Call the onSave prop with the data
    onSave({
      ...data,
      address_line2: data.address_line2 ?? "",
      landmark: data.landmark ?? "",
      phone_number: `+91${data.phone_number}`, // Append +91 prefix
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
            style={styles.bottomSheetContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>
                  Choose a delivery address
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.formScrollViewContent}>
              <View style={styles.formContainer}>
                {/* Address Line 1 */}
                <View>
                  <Controller
                    control={control}
                    name="address_line1"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        placeholder="HOUSE / FLAT / FLOOR NO."
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.address_line1 && (
                    <Text style={styles.errorText}>
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
                        style={styles.textInput}
                        placeholder="APARTMENT / ROAD / AREA"
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
                        style={styles.textInput}
                        placeholder="LANDMARK, ADDITIONAL INFO, ETC. (OPTIONAL)"
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
                        style={styles.textInput}
                        placeholder="Receiver's Name"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name.message}</Text>
                  )}
                </View>

                {/* Phone Number */}
                <View>
                  <Controller
                    control={control}
                    name="phone_number"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.textInput}
                        placeholder="Receiver's Number e.g 9876543210"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="phone-pad"
                        maxLength={10}
                      />
                    )}
                  />
                  {errors.phone_number && (
                    <Text style={styles.errorText}>
                      {errors.phone_number.message}
                    </Text>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View
              style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
            >
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                style={styles.saveButton}
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
    justifyContent: "flex-end", // Align content to the bottom
  },
  keyboardAvoidingView: {
    flex: 1, // Fill available space to allow padding to push content
    justifyContent: "flex-end",
  },
  bottomSheetContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: "column",
    paddingHorizontal: 16, // px-4
    paddingTop: 16, // pt-4
    // pb-24 is handled by footer paddingBottom
  },
  header: {
    marginBottom: 16, // mb-4
    padding: 0,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#02060C",
  },
  closeButton: {
    backgroundColor: "rgba(2, 6, 12, 0.15)", // bg-[#02060c26]
    borderRadius: 8, // rounded-lg
    padding: 4, // p-[4px]
  },
  formScrollViewContent: {
    flexGrow: 1,
    gap: 16, // gap-4
  },
  formContainer: {
    flexDirection: "column",
    gap: 16, // gap-4
  },
  textInput: {
    width: "100%",
    borderBottomWidth: 1, // border-b
    borderBottomColor: "#ccc", // border-gray-300
    backgroundColor: "transparent",
    padding: 8, // p-2
    fontSize: 14, // text-sm
    color: "#333",
  },
  errorText: {
    marginTop: 4, // mt-1
    fontSize: 12, // text-xs
    color: "red",
  },
  footer: {
    // fixed bottom-4 left-0 w-full px-4
    width: "100%",
    paddingHorizontal: 16, // px-4
    paddingTop: 16, // pt-4
    // paddingBottom: insets.bottom + 16, // Add safe area and extra padding
  },
  saveButton: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#ff5200",
    paddingVertical: 12, // py-3
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "bold", // font-bold
    letterSpacing: 1, // tracking-wide
    color: "white",
  },
});

export default AddressDetailBottomSheet;
