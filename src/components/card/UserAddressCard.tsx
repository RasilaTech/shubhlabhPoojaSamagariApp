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
import type {
  UpdateUserAddressPayload,
  UserAddressPayload,
} from "@/services/address/addressApi.type"; // Adjust path
import type { AddressComponent } from "@/services/maps/MapApi.type"; // Adjust path
import { useGetAddressFromLatLngQuery } from "@/services/maps/MapsApi"; // Adjust path

import ConfirmationDialog from "../dialog/ConfirmationDialog";
import SearchAddressPage from "../location/SearchAddressPage"; // Adjust path

interface AddressCardProps {
  data: UserAddressPayload;
}

// --- Zod Validation Schema ---
const addressValidationSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  phone_number: z
    .string()
    .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  address_line1: z.string().min(1, "Address Line 1 is required").trim(),
  address_line2: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  city: z.string().min(1, "City is required").trim(), // Added validation
  state: z.string().min(1, "State is required").trim(), // Added validation
  pincode: z.string().min(1, "Pincode is required").trim(), // Added validation
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

const UserAddressCard = ({ data }: AddressCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSearchView, setShowSearchView] = useState(false);
  const [showDeleteDialog, setDeleteDialog] = useState(false);
  const [useLat, setLat] = useState<number>(data.lat);
  const [useLng, setLng] = useState<number>(data.lng);

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

  // --- FIX: useEffect to handle location search results ---
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
  // --- END FIX ---

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
      setIsEditing(false); // Close edit form
    } catch (error) {
      console.error("Failed to update address:", error);
      Alert.alert("Error", "Failed to update address. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    reset(); // Reset form to original values
    setIsEditing(false);
    setShowSearchView(false);
  };

  const handleDelete = async () => {
    setDeleteDialog(true);
  };

  // FIX: This conditional render is for the entire card.
  // The AddressPage/SearchAddressPage should live in a higher level component.
  // The UserAddress component now handles the state, so this component should not conditionally render.
  // We'll keep the SearchAddressPage logic for the edit button within the form.
  if (showSearchView) {
    return (
      <SearchAddressPage
        onChange={(lat, lng) => {
          setShowSearchView(false);
          setLat(lat);
          setLng(lng);
          // When a new location is selected, the query hook will refetch and update addressData
          form.setValue("address_line1", ""); // Clear street level address
          form.setValue("address_line2", "");
          form.setValue("landmark", "");
        }}
        lat={useLat}
        lng={useLng}
      />
    );
  }

  return (
    <View style={styles.card}>
      {/* Display View */}
      {!isEditing ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {data.name || data.phone_number}, {data.city}, {data.pincode}
            </Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.iconButton}
              >
                <Pencil size={20} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.iconButton}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="red" />
                ) : (
                  <Trash size={20} color="#ef4444" />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.addressLine}>
            {data.address_line1}, {data.address_line2}
          </Text>
          {data.landmark && (
            <Text style={styles.addressLine}>{data.landmark}</Text>
          )}
          {data.is_default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </>
      ) : (
        // Edit Form View
        <FormProvider {...form}>
          <View style={styles.editFormContainer}>
            <View style={styles.addressSearchRow}>
              <Text style={styles.addressSearchText}>
                {addressLoading
                  ? "Loading address..."
                  : addressData?.data?.formatted_address ||
                    "Click to search address"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowSearchView(true)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            {/* Form Fields */}
            <View style={styles.formFieldsGrid}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.textInput, errors.name && styles.errorInput]}
                    placeholder="Name *"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}

              <Controller
                control={control}
                name="phone_number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.phone_number && styles.errorInput,
                    ]}
                    placeholder="Phone Number (+91XXXXXXXXXX) *"
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

              <Controller
                control={control}
                name="address_line1"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.address_line1 && styles.errorInput,
                    ]}
                    placeholder="Address Line 1 *"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isUpdating}
                  />
                )}
              />
              {errors.address_line1 && (
                <Text style={styles.errorText}>
                  {errors.address_line1.message}
                </Text>
              )}

              <Controller
                control={control}
                name="address_line2"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder="APARTMENT / ROAD / AREA (OPTIONAL)"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isUpdating}
                  />
                )}
              />

              <Controller
                control={control}
                name="landmark"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    placeholder="LANDMARK, ETC. (OPTIONAL)"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isUpdating}
                  />
                )}
              />

              {/* Read-only fields for derived address */}
              <TextInput
                style={styles.readOnlyInput}
                value={extracted.city}
                placeholder="City"
                editable={false}
              />
              <TextInput
                style={styles.readOnlyInput}
                value={extracted.state}
                placeholder="State"
                editable={false}
              />
              <TextInput
                style={styles.readOnlyInput}
                value={extracted.pincode}
                placeholder="Pincode"
                editable={false}
              />

              {/* Default Address Checkbox */}
              <View style={styles.defaultAddressSwitchRow}>
                <Controller
                  control={control}
                  name="is_default"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: "#ccc", true: "#ccc" }}
                      thumbColor={value ? "#ff5200" : "#ffffff"}
                    />
                  )}
                />
                <Text style={styles.defaultAddressSwitchLabel}>
                  Mark this address as default
                </Text>
              </View>

              {/* Action buttons */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  onPress={handleSubmit(handleSaveAddress)}
                  disabled={isUpdating}
                  style={[styles.button, styles.saveButton]}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  style={[styles.button, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </FormProvider>
      )}

      {/* Confirmation Dialog for Delete */}
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
    borderColor: "#e5e7eb",
    backgroundColor: "white",
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
    color: "#4b5563",
    lineHeight: 20,
  },
  defaultBadge: {
    backgroundColor: "#ffedd5",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "bold",
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
    color: "#333",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
  },
  editButton: {
    marginLeft: 10,
    backgroundColor: "#ff5200",
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
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginTop: 4,
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  defaultAddressSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  defaultAddressSwitchLabel: {
    fontSize: 14,
    color: "#4b5563",
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
    backgroundColor: "#ff5200",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  cancelButtonText: {
    color: "#4b5563",
  },
});
