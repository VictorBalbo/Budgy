import { baseStyle } from "@/constants";
import { useThemeColor } from "@/hooks";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";

import { dateUtc, displayDate } from "@/utils";
import { getCalendars } from "expo-localization";
import { useState } from "react";
import { CardView } from "../CardView";
import { ThemedIcon } from "../ThemedIcon";
import { ButtonFormat, ButtonType, ThemedButton } from "../ThemedButton";
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
}: ThemedDatePickerProps) => {
  const captionColor = useThemeColor("caption");
  const color = labelColor ?? captionColor;

  const [dateValue, setDateValue] = useState<Date>(() => dateUtc(initialDate ?? undefined).toDate());
  const [timeValue, setTimeValue] = useState<Date>(() => dateUtc(initialDate ?? undefined).toDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const shouldShowDate = mode === "dateOnly" || mode === "dateTime";
  const shouldShowTime = mode === "timeOnly" || mode === "dateTime";
  const uses24HourClock = getCalendars()[0].uses24hourClock ?? false;

  const dateChangeHandler = (selectedDate: Date) => {
    const utcDate = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate(),
        timeValue.getUTCHours(),
        timeValue.getUTCMinutes(),
        timeValue.getUTCSeconds(),
      ),
    );
    setDateValue(utcDate);
    setTimeValue(utcDate);
    if (onDateChange) {
      onDateChange(utcDate);
    }
  };
  const timeChangeHandler = (selectedDate: Date) => {
    const utcDate = new Date(
      Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedDate.getHours(),
        selectedDate.getMinutes(),
        selectedDate.getSeconds(),
      ),
    );
    setDateValue(utcDate);
    setTimeValue(utcDate);
    if (onDateChange) {
      onDateChange(utcDate);
    }
  };

  const utcToDeviceLocal = (d: Date) =>
    new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
    );

  const themedInput = (
    <ThemedView style={baseStyle.inlineSectionGap}>
      {icon && <ThemedIcon name={icon} color={color} />}
      <ThemedView>
        {label && (
          <ThemedText type={TextType.Caption} color={color}>
            {label}
          </ThemedText>
        )}
        <ThemedView style={baseStyle.inlineSectionGap}>
          {shouldShowDate && (
            <ThemedButton
              title={displayDate(dateValue, "LL")}
              onPress={() => setShowDatePicker(true)}
              type={ButtonType.Secondary}
              format={ButtonFormat.Capsule}
            />
          )}
          {shouldShowDate && showDatePicker && (
            <DateTimePicker
              mode={"date"}
              value={dateValue}
              is24Hour={uses24HourClock}
              minimumDate={minDate}
              maximumDate={maxDate}
              onValueChange={(_, selectedDate) => {
                setShowDatePicker(false);
                dateChangeHandler(selectedDate);
              }}
              onDismiss={() => {
                setShowDatePicker(false);
              }}
            />
          )}
          {shouldShowTime && (
            <ThemedButton
              title={displayDate(timeValue, "LT")}
              onPress={() => setShowTimePicker(true)}
              type={ButtonType.Secondary}
              format={ButtonFormat.Capsule}
            />
          )}
          {shouldShowTime && showTimePicker && (
            <DateTimePicker
              mode={"time"}
              is24Hour={uses24HourClock}
              value={utcToDeviceLocal(timeValue)}
              onValueChange={(_, selectedDate) => {
                setShowTimePicker(false);
                timeChangeHandler(selectedDate);
              }}
              onDismiss={() => {
                setShowTimePicker(false);
              }}
            />
          )}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  if (cardContainer) {
    return <CardView>{themedInput}</CardView>;
  } else {
    return themedInput;
  }
};
