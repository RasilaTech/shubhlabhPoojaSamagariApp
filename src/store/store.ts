import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import { categoryApi } from "@/services/category/categoryApi";
import { productAPI } from "@/services/product/productApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productAPI.reducerPath]: productAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      categoryApi.middleware,
      productAPI.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
