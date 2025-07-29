// store/slices/locationSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface LocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
  timestamp: number | null;
}

const initialState: LocationState = {
  lat: null,
  lng: null,
  loading: false,
  error: null,
  timestamp: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocation: (
      state,
      action: PayloadAction<{ lat: number; lng: number }>,
    ) => {
      state.lat = action.payload.lat;
      state.lng = action.payload.lng;
      state.error = null;
      state.timestamp = Date.now();
    },
    setLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLocationError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearLocation: (state) => {
      state.lat = null;
      state.lng = null;
      state.error = null;
      state.timestamp = null;
    },
  },
});

export const {
  setLocation,
  setLocationLoading,
  setLocationError,
  clearLocation,
} = locationSlice.actions;
export default locationSlice.reducer;
