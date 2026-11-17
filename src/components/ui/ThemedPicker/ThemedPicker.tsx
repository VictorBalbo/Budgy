import { baseStyle, spacing } from "@/constants";
import { useThemeColor } from "@/hooks";
import { Host, Picker } from "@expo/ui";
import { Fragment } from "react";
import { CardView } from "../CardView";
import { ThemedIcon } from "../ThemedIcon";
import { TextType, ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { ThemedPickerProps } from "./ThemedPicker.types";

export const ThemedPicker = ({
  options,
  value,
  onValueChange,
  label,
  icon,
  containerStyle,
  cardContainer = false,
}: ThemedPickerProps) => {
  const captionColor = useThemeColor("caption");
  const textColor = useThemeColor("text");

  const themedPicker = (
    <Fragment>
      {icon && <ThemedIcon name={icon} color={captionColor} />}
      <ThemedView>
        {label && <ThemedText type={TextType.Caption}>{label}</ThemedText>}
        <Host
          matchContents
          ignoreSafeArea={"all"}
          style={{
            marginHorizontal: -spacing.medium,
            marginVertical: -spacing.small,
          }}
          seedColor={textColor}
        >
          <Picker selectedValue={value} onValueChange={onValueChange} appearance="menu">
            {options.map((o) => (
              <Picker.Item key={o.value} label={o.label} value={o.value} />
            ))}
          </Picker>
        </Host>
      </ThemedView>
    </Fragment>
  );

  if (cardContainer) {
    return <CardView style={[containerStyle, baseStyle.inlineSectionGap]}>{themedPicker}</CardView>;
  } else {
    return <ThemedView style={[containerStyle, baseStyle.inlineSectionGap]}>{themedPicker}</ThemedView>;
  }
};
