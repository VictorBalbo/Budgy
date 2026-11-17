import { useThemeColor } from "@/hooks";
import { useRef } from "react";
import {
  ActivityIndicator,
  TextInputProps,
  TextInputInstance,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { CardView } from "./CardView";
import { ThemedIcon, IconSymbols } from "./ThemedIcon";
import { TextType, ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { fontSize, spacing } from "@/constants/theme";

export type ThemedInputProps = TextInputProps & {
  icon?: keyof IconSymbols;
  label?: string;
  labelColor?: string;
  cardContainer?: boolean;
  loading?: boolean;
};

export function ThemedInput({
  icon,
  label,
  labelColor,
  cardContainer = false,
  style,
  loading,
  ...otherProps
}: ThemedInputProps) {
  const placeholderColor = useThemeColor("placeholder");
  const captionColor = useThemeColor("caption");
  const textColor = useThemeColor("text");
  const color = otherProps.editable === false ? captionColor : textColor;
  const inputRef = useRef<TextInputInstance>(null);

  const themedInput = (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      style={baseStyle.inlineSectionGap}
    >
      {icon && !loading && (
        <ThemedIcon name={icon} color={labelColor ?? captionColor} size={24} />
      )}
      {loading && <ActivityIndicator style={{ width: 24 }} />}
      <ThemedView style={{ flex: 1 }}>
        {label && (
          <ThemedText
            type={TextType.Caption}
            color={labelColor ?? captionColor}
          >
            {label}
          </ThemedText>
        )}
        <TextInput
          ref={inputRef}
          placeholderTextColor={placeholderColor}
          style={[style, { color: color, fontSize: fontSize.medium }]}
          {...otherProps}
        />
      </ThemedView>
    </Pressable>
  );

  if (cardContainer) {
    return <CardView>{themedInput}</CardView>;
  } else {
    return themedInput;
  }
}

const baseStyle = StyleSheet.create({
  inlineSectionGap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.small,
  },
});