import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = "user-theme";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const deviceTheme = useDeviceColorScheme();
  const [theme, setTheme] = useState<"light" | "dark">("light"); // Initial default theme
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // On app launch, read the theme from secure store
    const loadTheme = async () => {
      try {
        const storedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (storedTheme === "dark" || storedTheme === "light") {
          setTheme(storedTheme);
        } else {
          // Fallback to the device's color scheme if no preference is saved
          setTheme(deviceTheme === "dark" ? "dark" : "light");
        }
      } catch (e) {
        console.error("Failed to load theme from secure store:", e);
        // Fallback to device theme on error
        setTheme(deviceTheme === "dark" ? "dark" : "light");
      } finally {
        setIsReady(true);
      }
    };
    loadTheme();
  }, [deviceTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error("Failed to save theme to secure store:", e);
    }
  };

  const value = { theme, toggleTheme, isReady };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
