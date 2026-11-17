import { baseStyle } from "@/constants";
import { useThemeColor } from "@/hooks";
import { DatePicker, DatePickerComponent, Host } from "@expo/ui/swift-ui";

import { environment } from "@expo/ui/swift-ui/modifiers";
import { getLocales } from "expo-localization";
import { useEffect, useState } from "react";
import { CardView } from "../CardView";
import { ThemedIcon } from "../ThemedIcon";
import { TextType, ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { ThemedDatePickerProps } from "./ThemedDatePicker.types";

export const ThemedDatePicker = ({
  icon,
  label,
  labelColor,
  initialDate,
  onDateChange,
  mode = "dateTime",
  minDate,
  maxDate,
  cardContainer = false,
  ...otherProps
}: ThemedDatePickerProps) => {
  const captionColor = useThemeColor("caption");
  const color = labelColor ?? captionColor;

  const locales = getLocales();
  const deviceLanguage = (locales[0].languageTag ?? "en-US").replace("-", "_");
  const [value, setValue] = useState<Date | undefined>(() => initialDate);
  const displayedComponents: DatePickerComponent[] = [];
  if (mode === "dateOnly") {
    displayedComponents.push("date");
  } else if (mode === "timeOnly") {
    displayedComponents.push("hourAndMinute");
  } else if (mode === "dateTime") {
    displayedComponents.push("date", "hourAndMinute");
  }

  // Fix for datepicker not setting localling correctly on first render.
  // Cloned into a new Date instance so React sees a changed reference and re-renders.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialDate) {
        initialDate.setMilliseconds(initialDate.getMilliseconds() + 1);
        setValue(new Date(initialDate));
      }
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateChangeHandler = (selectedDate: Date) => {
    setValue(selectedDate);
    if (onDateChange) {
      onDateChange(selectedDate);
    }
  };

  const themedInput = (
    <ThemedView style={baseStyle.inlineSectionGap}>
      {icon && <ThemedIcon name={icon} color={color} />}
      <ThemedView>
        {label && (
          <ThemedText type={TextType.Caption} color={color}>
            {label}
          </ThemedText>
        )}
        <Host matchContents ignoreSafeArea={"all"}>
          <DatePicker
            modifiers={[environment("locale", deviceLanguage), environment("timeZone", "UTC")]}
            displayedComponents={displayedComponents}
            selection={value}
            onDateChange={dateChangeHandler}
            range={{
              start: minDate,
              end: maxDate,
            }}
            {...otherProps}
          />
        </Host>
      </ThemedView>
    </ThemedView>
  );

  if (cardContainer) {
    return <CardView>{themedInput}</CardView>;
  } else {
    return themedInput;
  }
};
