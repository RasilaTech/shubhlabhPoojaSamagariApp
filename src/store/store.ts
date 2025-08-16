import { addressAPI } from "@/services/address/AddresssAPI";
import locationReducer from "@/services/address/addressSlice";
import { authAPI } from "@/services/auth/authApi";
import { cartAPI } from "@/services/cart/cartAPI";
import { categoryApi } from "@/services/category/categoryApi";
import { configurationApi } from "@/services/configuration/configurationApi";
import { couponAPI } from "@/services/coupon/couponAPI";
import { deviceAPI } from "@/services/device/devices";
import { mapsAPI } from "@/services/maps/MapsApi";
import { orderApi } from "@/services/orders/orderApi";
import { productAPI } from "@/services/product/productApi";
import { subCategoryAPI } from "@/services/sub-category/subCategoryApi";
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
    [addressAPI.reducerPath]: addressAPI.reducer,
    [couponAPI.reducerPath]: couponAPI.reducer,
    [configurationApi.reducerPath]: configurationApi.reducer,
    [cartAPI.reducerPath]: cartAPI.reducer,
    [authAPI.reducerPath]: authAPI.reducer,
    [subCategoryAPI.reducerPath]: subCategoryAPI.reducer,
    [mapsAPI.reducerPath]: mapsAPI.reducer,
    [deviceAPI.reducerPath]: deviceAPI.reducer,
    location: locationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      categoryApi.middleware,
      productAPI.middleware,
      orderApi.middleware,
      userAPI.middleware,
      addressAPI.middleware,
      couponAPI.middleware,
      cartAPI.middleware,
      configurationApi.middleware,
      authAPI.middleware,
      subCategoryAPI.middleware,
      mapsAPI.middleware,
      deviceAPI.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
