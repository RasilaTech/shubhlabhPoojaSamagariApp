import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the state interface
interface LocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: LocationState = {
  lat: null,
  lng: null,
  loading: true,
  error: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    // Action to start the location loading process
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    // Action to save the location coordinates
    setLocation(state, action: PayloadAction<{ lat: number; lng: number }>) {
      state.lat = action.payload.lat;
      state.lng = action.payload.lng;
      state.error = null; // Clear any previous errors
      state.loading = false;
    },
    // Action to save an error if location fetching fails
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLocation, setError, setLoading } = addressSlice.actions;

export default addressSlice.reducer;
