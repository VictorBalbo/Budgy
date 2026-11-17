import { baseStyle, spacing } from "@/constants";
import { useThemeColor } from "@/hooks";
import { Host } from "@expo/ui";
import {
  BasicTextField,
  Column,
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  Row,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, menuAnchor, padding } from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";
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
  const selectedLabel = useNativeState(options.find((o) => o.value === value)?.label ?? "");
  const [expanded, setExpanded] = useState(false);

  const nativePicker = (
    <Host matchContents>
      <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: spacing.small }}>
        {icon && <ThemedIcon name={icon} size={24} color={captionColor} noHost />}
        <Column>
          {label && (
            <ThemedText type={TextType.Caption} noHost>
              {label}
            </ThemedText>
          )}
          <ExposedDropdownMenuBox expanded={expanded} onExpandedChange={setExpanded}>
            <BasicTextField
              value={selectedLabel}
              readOnly
              modifiers={[
                menuAnchor(),
                fillMaxWidth(),
                padding(0, spacing.smallExtra, spacing.largeExtra, spacing.smallExtra),
              ]}
            />

            <ExposedDropdownMenu expanded={expanded} onDismissRequest={() => setExpanded(false)}>
              {options.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    selectedLabel.value = option.label;
                    onValueChange(option.value);
                    setExpanded(false);
                  }}
                >
                  <DropdownMenuItem.Text>
                    <ThemedText noHost>{option.label}</ThemedText>
                  </DropdownMenuItem.Text>
                </DropdownMenuItem>
              ))}
            </ExposedDropdownMenu>
          </ExposedDropdownMenuBox>
        </Column>
      </Row>
    </Host>
  );

  if (cardContainer) {
    return <CardView style={[containerStyle, baseStyle.inlineSectionGap]}>{nativePicker}</CardView>;
  } else {
    return <ThemedView style={[containerStyle, baseStyle.inlineSectionGap]}>{nativePicker}</ThemedView>;
  }
};
