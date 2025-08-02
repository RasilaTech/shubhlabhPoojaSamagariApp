import { useRefreshTokenMutation } from "@/services/auth/authApi"; // To refresh expired tokens
import { logout, setCredentials } from "@/store/features/auth/authSlice"; // Adjust path
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useCheckAuthOnLaunch = () => {
  const dispatch = useDispatch();
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync("access_token");
        const refreshTokenValue = await SecureStore.getItemAsync(
          "refresh_token"
        );

        if (accessToken && refreshTokenValue) {
          // If a refresh token exists, try to get a new access token
          // This is a common pattern to ensure the access token is fresh
          // You could also just use the stored access token directly here
          dispatch(
            setCredentials({
              access_token: accessToken,
              refresh_token: refreshTokenValue,
            })
          );

          // Optionally, try to refresh the token to ensure it's still valid
          // You'd need to modify your authAPI to handle refresh token logic
          // await refreshToken().unwrap();
        } else {
          // No tokens found, ensure Redux state is logged out
          dispatch(logout());
        }
      } catch (error) {
        console.error("Failed to load tokens from SecureStore:", error);
        dispatch(logout());
      }
    };

    checkAuth();
  }, [dispatch, refreshToken]);
};
