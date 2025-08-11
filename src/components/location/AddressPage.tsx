import type { CreateUserAddressPayload } from "@/services/address/addressApi.type"; // Adjust path
import { useAddUserAddressMutation } from "@/services/address/AddresssAPI"; // Adjust path
import { AddressComponent } from "@/services/maps/MapApi.type";
import { useGetAddressFromLatLngQuery } from "@/services/maps/MapsApi"; // Adjust path
import { router } from "expo-router"; // Use router for navigation
import { ChevronLeft, MapPin } from "lucide-react-native"; // Lucide icons
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"; // Import MapView and Marker
import  {AddressDetailBottomSheet}  from "../bottomsheet/AddressDetailBottomSheet";

export interface CompleteAddressProps {
  address_line1: string;
  address_line2: string;
  landmark: string;
  phone_number: string;
  name: string;
}

interface AddressPageProps {
  onChange: () => void;
  lat: number;
  lng: number;
}

const AddressPage = ({ onChange, lat, lng }: AddressPageProps) => {
  const [currentRegion, setCurrentRegion] = useState({
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [selectedPin, setSelectedPin] = useState({
    latitude: lat,
    longitude: lng,
  });
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const {
    data: addressData = {
      data: {
        formatted_address: "",
        address_components: [],
      },
    },
    isLoading: addressLoading,
    isError: addressError,
  } = useGetAddressFromLatLngQuery({
    lat: selectedPin.latitude,
    lng: selectedPin.longitude,
  });

  const [addUserAddress] = useAddUserAddressMutation();

  const extractAddressFields = (components: AddressComponent[]) => {
    const getComponent = (type: string) =>
      components.find((c) => c.types.includes(type))?.long_name || "";

    return {
      city: getComponent("locality"),
      state: getComponent("administrative_area_level_1"),
      pincode: getComponent("postal_code"),
    };
  };

  const handleAddressSave = async (data: CompleteAddressProps) => {
    const { address_line1, address_line2, landmark, name, phone_number } = data;

    const { city, state, pincode } = extractAddressFields(
      addressData.data.address_components
    );

    const fullPayload: CreateUserAddressPayload = {
      phone_number,
      name,
      address_line1,
      address_line2,
      landmark,
      city,
      state,
      pincode,
      lat: selectedPin.latitude,
      lng: selectedPin.longitude,
      is_default: true,
    };

    try {
      await addUserAddress(fullPayload).unwrap();
      setShowBottomSheet(false);
      router.back();
    } catch (error) {
      console.error("Failed to save address:", error);
      Alert.alert("Error", "Failed to save address. Please try again.");
    }
  };

  const handleMapPress = (e: any) => {
    const newCoords = e.nativeEvent.coordinate;
    setSelectedPin(newCoords);
    setCurrentRegion({
      ...currentRegion,
      latitude: newCoords.latitude,
      longitude: newCoords.longitude,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onChange} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>
            Search for area, street name…
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE} // Use Google Maps provider if you have a key configured
          style={styles.map}
          region={currentRegion}
          onRegionChangeComplete={setCurrentRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
        >
          <Marker
            coordinate={selectedPin}
            draggable
            onDragEnd={(e) => setSelectedPin(e.nativeEvent.coordinate)}
          />
        </MapView>
      </View>

      {/* Address Display & Confirm Button */}
      <View style={styles.addressDisplayContainer}>
        <View style={styles.addressInfoRow}>
          <MapPin size={24} color="red" />
          <Text style={styles.addressText} numberOfLines={2}>
            {addressLoading
              ? "Loading address..."
              : addressData.data.formatted_address || "Address not found"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowBottomSheet(true)}
          style={styles.confirmButton}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>

      {/* Address Detail Bottom Sheet */}
      <AddressDetailBottomSheet
        isVisible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onSave={handleAddressSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  backButton: {
    marginRight: 10,
  },
  searchButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
  },
  searchButtonText: {
    color: "#888",
  },
  mapContainer: {
    flex: 1,
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  addressDisplayContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  addressInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#ff5200",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddressPage;
