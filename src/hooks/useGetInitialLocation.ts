import {
  setError,
  setLoading,
  setLocation,
} from "@/services/address/addressSlice"; // Adjust path
import * as Location from "expo-location";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useGetInitialLocation = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      // 1. Request foreground location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        dispatch(setError("Permission to access location was denied."));
        return;
      }

      try {
        // 2. Get the current position
        const location = await Location.getCurrentPositionAsync({});

        // 3. Dispatch the action to save the location to the Redux store
        dispatch(
          setLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          })
        );
      } catch (err: any) {
        console.error("Error fetching location:", err);
        dispatch(setError(err.message || "Failed to get current location."));
      } finally {
        dispatch(setLoading(false)); // Ensure loading state is set to false regardless of outcome
      }
    })();
  }, [dispatch]); // The dispatch function is stable and won't cause re-renders
};
