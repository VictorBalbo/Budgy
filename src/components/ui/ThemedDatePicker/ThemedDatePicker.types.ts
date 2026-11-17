import { IconSymbols } from "../ThemedIcon";

export type ThemedDatePickerProps = {
  initialDate?: Date | undefined;
  onDateChange?: (date: Date) => void;
  mode?: "dateOnly" | "dateTime" | "timeOnly";
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  icon?: keyof IconSymbols;
  label?: string;
  labelColor?: string;
  cardContainer?: boolean;
};
