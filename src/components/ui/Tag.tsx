import { radius, spacing } from "@/constants";
import { useThemeColor } from "@/hooks";
import { StyleSheet, type ViewProps } from "react-native";
import { TextType, ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export type TagProps = ViewProps & {
  text: string;
};

export function Tag({ text, style, ...otherProps }: TagProps) {
  const backgroundColor = useThemeColor("backgroundSoft");
  const borderColor = useThemeColor("border");

  return (
    <ThemedView style={[styles.tag, { backgroundColor, borderColor }, style]} {...otherProps}>
      <ThemedText type={TextType.Footnote}>{text}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.smallExtra,
    borderWidth: 0.5,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, .4)",
  },
});