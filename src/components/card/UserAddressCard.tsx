import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

import {
  useDeleteAddressMutation,
  useUpdateUserAddressMutation,
} from "@/services/address/AddresssAPI"; // Adjust path
import type { UpdateUserAddressPayload, UserAddressPayload } from "@/services/address/addressApi.type"; // Adjust path
import type { AddressComponent } from "@/services/maps/MapApi.type"; // Adjust path
import { useGetAddressFromLatLngQuery } from "@/services/maps/MapsApi"; // Adjust path

import { darkColors, lightColors } from "@/constants/ThemeColors"; // <-- Import color palettes
import { useTheme } from "@/hooks/useTheme"; // <-- Import useTheme hook
import { ConfirmationDialog } from "../dialog/ConfirmationDialog";
import SearchAddressPage from "../location/SearchAddressPage";

// --- Zod Validation Schema ---
const addressValidationSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  phone_number: z
    .string()
    .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  address_line1: z.string().min(1, "Address Line 1 is required").trim(),
  address_line2: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  city: z.string().min(1, "City is required").trim(),
  state: z.string().min(1, "State is required").trim(),
  pincode: z.string().min(1, "Pincode is required").trim(),
  is_default: z.boolean().optional(),
});
type AddressFormData = z.infer<typeof addressValidationSchema>;

const extractAddressFields = (components: AddressComponent[]) => {
  const getComponent = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name || "";
  return {
    city: getComponent("locality"),
    state: getComponent("administrative_area_level_1"),
    pincode: getComponent("postal_code"),
  };
};
interface AddressCardProps {
  data: UserAddressPayload;
}
const UserAddressCard = ({ data }: AddressCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSearchView, setShowSearchView] = useState(false);
  const [showDeleteDialog, setDeleteDialog] = useState(false);
  const [useLat, setLat] = useState<number>(data.lat);
  const [useLng, setLng] = useState<number>(data.lng);

  const { theme } = useTheme();
  const colors = theme === "dark" ? darkColors : lightColors;

  const {
    data: addressData = {
      data: {
        formatted_address: "",
        address_components: [],
        geometry: {
          location: {
            lat: data.lat,
            lng: data.lng,
          },
        },
      },
    },
    isLoading: addressLoading,
  } = useGetAddressFromLatLngQuery({ lat: useLat, lng: useLng });

  const [updateAddress, { isLoading: isUpdating }] =
    useUpdateUserAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

  const extracted = extractAddressFields(addressData.data.address_components);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressValidationSchema),
    defaultValues: {
      name: data.name,
      phone_number: data.phone_number.replace(/^\+91/, ""),
      address_line1: data.address_line1,
      address_line2: data.address_line2 || "",
      landmark: data.landmark || "",
      city: data.city || "",
      state: data.state || "",
      pincode: data.pincode || "",
      is_default: data.is_default || false,
    },
  });
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!addressLoading && addressData?.data) {
      const { city, state, pincode } = extractAddressFields(
        addressData.data.address_components
      );
      form.setValue("city", city);
      form.setValue("state", state);
      form.setValue("pincode", pincode);
    }
  }, [addressData, addressLoading, form]);

  const handleSaveAddress = async (formData: AddressFormData) => {
    try {
      const fullPayload: UpdateUserAddressPayload = {
        name: formData.name,
        phone_number: `+91${formData.phone_number}`,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        lat: useLat,
        lng: useLng,
        is_default: formData.is_default,
      };
      await updateAddress({ addressId: data.id, body: fullPayload }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update address:", error);
      Alert.alert("Error", "Failed to update address. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    reset();
    setIsEditing(false);
    setShowSearchView(false);
  };

  const handleDelete = async () => {
    setDeleteDialog(true);
  };

  if (showSearchView) {
    return (
      <SearchAddressPage
        onChange={(lat, lng) => {
          setShowSearchView(false);
          setLat(lat);
          setLng(lng);
          form.setValue("address_line1", "");
          form.setValue("address_line2", "");
          form.setValue("landmark", "");
        }}
        lat={useLat}
        lng={useLng}
      />
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
    >
      {/* Display View */}
      {!isEditing ? (
        <>
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: colors.text }]}>
              {data.name || data.phone_number}, {data.city}, {data.pincode}
            </Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.iconButton}
              >
                <Pencil size={20} color={colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.iconButton}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.destructive} />
                ) : (
                  <Trash size={20} color={colors.destructive} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
            {data.address_line1}, {data.address_line2}
          </Text>
          {data.landmark && (
            <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
              {data.landmark}
            </Text>
          )}
          {data.is_default && (
            <View
              style={[
                styles.defaultBadge,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Text style={[styles.defaultBadgeText, { color: colors.accent }]}>
                Default
              </Text>
            </View>
          )}
        </>
      ) : (
        // Edit Form View
        <FormProvider {...form}>
          <View style={styles.editFormContainer}>
            <View style={styles.addressSearchRow}>
              <Text
                style={[
                  styles.addressSearchText,
                  { color: colors.text, backgroundColor: colors.background },
                ]}
              >
                {addressLoading
                  ? "Loading address..."
                  : addressData?.data?.formatted_address ||
                    "Click to search address"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowSearchView(true)}
                style={[styles.editButton, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formFieldsGrid}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.name && styles.errorInput,
                      { borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder="Name *"
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.name && (
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                  {errors.name.message}
                </Text>
              )}

              <Controller
                control={control}
                name="phone_number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.phone_number && styles.errorInput,
                      { borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder="Phone Number (+91XXXXXXXXXX) *"
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
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                  {errors.phone_number.message}
                </Text>
              )}

              <Controller
                control={control}
                name="address_line1"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.address_line1 && styles.errorInput,
                      { borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder="Address Line 1 *"
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.address_line1 && (
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                  {errors.address_line1.message}
                </Text>
              )}

              <Controller
                control={control}
                name="address_line2"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      { borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder="APARTMENT / ROAD / AREA (OPTIONAL)"
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

              <Controller
                control={control}
                name="landmark"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      { borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder="LANDMARK, ETC. (OPTIONAL)"
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

              <TextInput
                style={[
                  styles.readOnlyInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.textSecondary,
                  },
                ]}
                value={extracted?.city}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
                editable={false}
              />
              <TextInput
                style={[
                  styles.readOnlyInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.textSecondary,
                  },
                ]}
                value={extracted?.state}
                placeholder="State"
                placeholderTextColor={colors.textSecondary}
                editable={false}
              />
              <TextInput
                style={[
                  styles.readOnlyInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.textSecondary,
                  },
                ]}
                value={extracted?.pincode}
                placeholder="Pincode"
                placeholderTextColor={colors.textSecondary}
                editable={false}
              />
              <View style={styles.defaultAddressSwitchRow}>
                <Controller
                  control={control}
                  name="is_default"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: colors.border, true: colors.accent }}
                      thumbColor={colors.cardBackground}
                    />
                  )}
                />
                <Text
                  style={[
                    styles.defaultAddressSwitchLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Mark this address as default
                </Text>
              </View>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  onPress={handleSubmit(handleSaveAddress)}
                  disabled={isUpdating}
                  style={[
                    styles.button,
                    styles.saveButton,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text
                    style={[styles.cancelButtonText, { color: colors.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </FormProvider>
      )}

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setDeleteDialog}
        headingText="Delete Address"
        bodyText="Are you sure you want to delete this address?"
        confirmationButtonText={isDeleting ? "Deleting..." : "Delete"}
        cancelButtonText="Cancel"
        onConfirm={async () => {
          try {
            await deleteAddress(data.id).unwrap();
            setDeleteDialog(false);
          } catch (error) {
            Alert.alert("Error", "Failed to delete address.");
          }
        }}
        isConfirming={isDeleting}
      />
    </View>
  );
};

export default UserAddressCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    // FIX: borderColor and backgroundColor are now theme-aware
    // borderColor: '#e5e7eb',
    // backgroundColor: 'white',
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    marginRight: 10,
    // FIX: Color is now theme-aware
    // color: '#333',
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 5,
  },
  addressLine: {
    fontSize: 14,
    lineHeight: 20,
    // FIX: Color is now theme-aware
    // color: '#4b5563',
  },
  defaultBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: 8,
    // FIX: backgroundColor is now theme-aware
    backgroundColor: "red",
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    // FIX: Color is now theme-aware
    // color: '#92400e',
  },
  editFormContainer: {
    flexDirection: "column",
    gap: 16,
  },
  addressSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  addressSearchText: {
    flex: 1,
    fontSize: 14,
    padding: 8,
    borderRadius: 4,
    // FIX: Color and background are now theme-aware
  },
  editButton: {
    marginLeft: 10,
    // FIX: backgroundColor is now theme-aware
    // backgroundColor: '#ff5200',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  editButtonText: {
    color: "white",
    fontSize: 12,
  },
  formFieldsGrid: {
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    // FIX: borderColor, color, and placeholderTextColor are now theme-aware
    // borderColor: '#ccc',
    // color: '#333',
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    fontSize: 12,
    // FIX: Color is now theme-aware
    // color: 'red',
    marginTop: 4,
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    // FIX: backgroundColor and color are now theme-aware
    // backgroundColor: '#f5f5f5',
    // color: '#666',
  },
  defaultAddressSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  defaultAddressSwitchLabel: {
    fontSize: 14,
    // FIX: Color is now theme-aware
    // color: '#4b5563',
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    // FIX: backgroundColor is now theme-aware
    // backgroundColor: '#ff5200',
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    // FIX: backgroundColor is now theme-aware
    // backgroundColor: '#ccc',
  },
  cancelButtonText: {
    // FIX: Color is now theme-aware
    // color: '#4b5563',
  },
});
