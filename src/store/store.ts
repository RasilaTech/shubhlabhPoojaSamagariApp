import { categoryApi } from "@/services/category/categoryApi";
import { orderApi } from "@/services/orders/orderApi";
import { productAPI } from "@/services/product/productApi";
import { userAPI } from "@/services/user/userApi";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productAPI.reducerPath]: productAPI.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      categoryApi.middleware,
      productAPI.middleware,
      orderApi.middleware,
      userAPI.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
