import AddressPage from "@/components/location/AddressPage";
import SearchAddressPage from "@/components/location/SearchAddressPage";
import { useAppSelector } from "@/store/hook";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Address = () => {
  const [searchPage, setSearchPage] = useState(false);

  const location = useAppSelector((state) => state.location); // Assuming Redux location slice
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

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
      </View>
    );
  }

  // If lat/lng is still null after loading (e.g., initial state)
  if (lat === null || lng === null) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Location not available</Text>
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
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  errorText: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
  },
});
