import { PickerItemProps } from "@expo/ui";
import { ViewStyle } from "react-native";
import { IconSymbols } from "../ThemedIcon";

export { PickerItemProps } from "@expo/ui";

export type ThemedPickerProps = {
  options: PickerItemProps<string>[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  icon?: keyof IconSymbols;
  cardContainer?: boolean;
  containerStyle?: ViewStyle;
};
