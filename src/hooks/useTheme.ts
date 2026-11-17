import { ColorScheme, Theme } from "@/constants/theme";
import { useColorScheme } from "react-native";

const defaultColorScheme = "light";

export const useThemeColor = (propertyName: keyof ColorScheme) => {
  const currentTheme = useTheme();
  return Theme[currentTheme][propertyName];
}

export const useTheme = () => {
  const colorScheme = useColorScheme();
  let currentTheme = colorScheme;
  if (currentTheme === null) {
    currentTheme = defaultColorScheme;
  }
  return currentTheme;
}