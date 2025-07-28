import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import { categoryApi } from "@/services/category/categoryApi";
import { productAPI } from "@/services/product/productApi";
import { orderApi } from "@/services/orders/orderApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productAPI.reducerPath]: productAPI.reducer,
    [orderApi.reducerPath]: orderApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      categoryApi.middleware,
      productAPI.middleware,
      orderApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
