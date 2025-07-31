import { Geometry } from "@/services/maps/MapApi.type";
import { useGetMapSearchResultsQuery } from "@/services/maps/MapsApi"; // Adjust path
import { useAppSelector } from "@/store/hook";
import { router } from "expo-router"; // For navigation
import { ChevronLeft, MapPin, Navigation } from "lucide-react-native"; // Lucide icons
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface AddressChangeProps {
  onChange: (lat: number, lng: number) => void;
}
export interface CoordinateProps {
  lat: number;
  lng: number;
}

interface SearchAddressPageProps extends AddressChangeProps, CoordinateProps {}

const SearchAddressPage = ({ onChange }: SearchAddressPageProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const location = useAppSelector((state) => state.location);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isError } = useGetMapSearchResultsQuery(
    debouncedSearch,
    {
      skip: debouncedSearch.length < 3,
    }
  );

  const handlePredictionClick = (prediction: Geometry) => {
    const placeLat = prediction.location.lat;
    const placeLng = prediction.location.lng;
    onChange(placeLat, placeLng); // Switch back to map view
  };

  const handleCurrentLocationClick = () => {
    const placeLat = location.lat;
    const placeLng = location.lng;
    // Fallback coordinates if location.lat/lng are null
    onChange(placeLat || 24.54354, placeLng || 22.44543);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} style={styles.backButton}>
          <ChevronLeft size={24} />
        </TouchableOpacity>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search for area, street name…"
          style={styles.searchInput}
          placeholderTextColor="#999"
          autoFocus={true}
        />
      </View>

      <View style={styles.resultsContainer}>
        {/* Use My Current Location */}
        {search.trim() === "" && (
          <TouchableOpacity
            onPress={handleCurrentLocationClick}
            style={styles.currentLocationButton}
          >
            <Navigation
              size={20}
              color="#ff5200"
              style={styles.currentLocationIcon}
            />
            <Text style={styles.currentLocationText}>
              Use My Current Location
            </Text>
          </TouchableOpacity>
        )}

        {/* Search Results */}
        {debouncedSearch.length >= 3 && (
          <View>
            <Text style={styles.resultsTitle}>Search Results</Text>
            {isLoading && <ActivityIndicator style={{ marginTop: 10 }} />}
            {isError && (
              <Text style={styles.errorText}>Something went wrong</Text>
            )}
            {!isLoading &&
              data?.data?.map((prediction, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePredictionClick(prediction.geometry)}
                  style={styles.predictionItem}
                >
                  <MapPin
                    size={20}
                    color="#666"
                    style={styles.predictionIcon}
                  />
                  <View>
                    <Text style={styles.predictionName}>{prediction.name}</Text>
                    <Text style={styles.predictionAddress}>
                      {prediction.formatted_address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>
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
    height: 60,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    borderWidth: 0, // No border on TextInput
    outlineWidth: 0, // For web
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 16,
  },
  currentLocationIcon: {
    marginRight: 12,
  },
  currentLocationText: {
    fontWeight: "bold",
    color: "#ff5200",
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  errorText: {
    color: "red",
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 16,
    gap: 12,
  },
  predictionIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  predictionName: {
    fontWeight: "bold",
    color: "#333",
  },
  predictionAddress: {
    fontSize: 14,
    color: "#666",
  },
});

export default SearchAddressPage;
