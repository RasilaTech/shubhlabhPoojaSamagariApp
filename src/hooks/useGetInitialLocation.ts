import {
  setError,
  setLoading,
  setLocation,
} from "@/services/address/addressSlice";
import * as Location from "expo-location";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useGetInitialLocation = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getInitialLocation = async () => {
      dispatch(setLoading(true));

      try {
        // First check if we already have permission
        const { status: existingStatus } =
          await Location.getForegroundPermissionsAsync();

        let finalStatus = existingStatus;

        // If we don't have permission, request it
        if (existingStatus !== "granted") {
          const { status } = await Location.requestForegroundPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          dispatch(setError("Permission to access location was denied."));
          return;
        }

        // Get the current position
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Dispatch the action to save the location to the Redux store
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
        dispatch(setLoading(false));
      }
    };

    getInitialLocation();
  }, [dispatch]);
};
