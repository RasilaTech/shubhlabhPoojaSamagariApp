import AddressPage from "@/components/location/AddressPage";
import SearchAddressPage from "@/components/location/SearchAddressPage";
import {
  setError,
  setLoading,
  setLocation,
} from "@/services/address/addressSlice";
import { useAppSelector } from "@/store/hook";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

const Address = () => {
  const [searchPage, setSearchPage] = useState(false);
  const dispatch = useDispatch();

  const location = useAppSelector((state) => state.location);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  // Function to request location permission and get location
  const requestLocationPermission = async () => {
    dispatch(setLoading(true));
    dispatch(setError("error")); // Clear any previous errors

    try {
      // Request foreground location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        dispatch(setError("Permission to access location was denied."));
        dispatch(setLoading(false));
        return;
      }

      // Get the current position
      const locationResult = await Location.getCurrentPositionAsync({});

      // Dispatch the action to save the location to the Redux store
      dispatch(
        setLocation({
          lat: locationResult.coords.latitude,
          lng: locationResult.coords.longitude,
        })
      );
    } catch (err: any) {
      console.error("Error fetching location:", err);
      dispatch(setError(err.message || "Failed to get current location."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (location.lat !== null && location.lng !== null) {
      setLat(location.lat);
      setLng(location.lng);
    }
  }, [location.lat, location.lng]);

  if (location.loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#666" />
        <Text style={styles.loadingText}>Loading location...</Text>
      </View>
    );
  }

  if (location.error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Failed to load location: {location.error}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={requestLocationPermission}
        >
          <Text style={styles.retryButtonText}>Retry Location Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If lat/lng is still null after loading (e.g., initial state)
  if (lat === null || lng === null) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Location not available</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={requestLocationPermission}
        >
          <Text style={styles.retryButtonText}>Request Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {searchPage ? (
        <SearchAddressPage
          onChange={(newLat, newLng) => {
            setSearchPage(false);
            setLat(newLat);
            setLng(newLng);
          }}
          lat={lat}
          lng={lng}
        />
      ) : (
        <AddressPage onChange={() => setSearchPage(true)} lat={lat} lng={lng} />
      )}
    </View>
  );
};

export default Address;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  centerContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
