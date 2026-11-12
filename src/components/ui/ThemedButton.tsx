import { Host, Button } from "@expo/ui";
import { ViewStyle } from "react-native";
import { IconSymbols, ThemedIcon } from "./ThemedIcon";
import { ThemedText } from "./ThemedText";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  ModifierConfig as ModifierConfigSwift,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { ModifierConfig as ModifierConfigJetpack } from "@expo/ui/jetpack-compose/modifiers";
import { useThemeColor } from "@/hooks";
import { Colors, fontSize, radius } from "@/constants/theme";

export enum ButtonType {
  Primary = "primary",
  Secondary = "secondary",
  Tertiary = "tertiary",
  Plain = "plain",
  Delete = "delete",
}
export enum ButtonFormat {
  Rectangle = "retangle",
  Round = "round",
  Capsule = "capsule",
}
interface BaseButtonProps {
  onPress: () => void;
  type?: ButtonType;
  format?: ButtonFormat;
  loading?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}
interface TitleButtonProps extends BaseButtonProps {
  title: string;
  icon?: keyof IconSymbols;
}
interface IconButtonProps extends BaseButtonProps {
  title?: string;
  icon: keyof IconSymbols;
}
export const ThemedButton = ({
  title,
  icon,
  type,
  format,
  onPress,
}: TitleButtonProps | IconButtonProps) => {
  const backgroundAccent = useThemeColor("backgroundAccent");
  const text = useThemeColor("text");
  const link = useThemeColor("link");
  const modifiers: (ModifierConfigSwift | ModifierConfigJetpack)[] = [];
  let backgroundColor = "";
  let textColor = "";
  let buttonStyleModifier:
    | "automatic"
    | "bordered"
    | "borderedProminent"
    | "borderless"
    | "glass"
    | "glassProminent"
    | "plain";

  switch (type) {
    case ButtonType.Primary:
    default:
      backgroundColor = Colors.blue;
      textColor = Colors.white;
      buttonStyleModifier = "glassProminent";
      break;
    case ButtonType.Secondary:
      backgroundColor = backgroundAccent;
      textColor = text;
      buttonStyleModifier = "glassProminent";
      break;
    case ButtonType.Tertiary:
      textColor = text;
      buttonStyleModifier = "glass";
      break;
    case ButtonType.Plain:
      textColor = link;
      buttonStyleModifier = "plain";
      break;
    case ButtonType.Delete:
      backgroundColor = Colors.red;
      textColor = Colors.white;
      buttonStyleModifier = "glassProminent";
      break;
  }
  modifiers.push(buttonStyle(buttonStyleModifier), tint(backgroundColor));
  switch (format) {
    case ButtonFormat.Round:
      modifiers.push(buttonBorderShape("circle"), controlSize("large"));
      break;
    case ButtonFormat.Capsule:
      modifiers.push(buttonBorderShape("capsule"));
      break;
    case ButtonFormat.Rectangle:
      modifiers.push(buttonBorderShape("roundedRectangle", radius.small));
      break;
  }

  return (
    <Host matchContents>
      <Button
        label={title}
        onPress={onPress}
        variant="outlined"
        modifiers={modifiers}
      >
        {icon && (
          <ThemedIcon
            name={icon}
            color={textColor}
            size={fontSize.medium}
            noHost
          />
        )}
        {title && (
          <ThemedText color={textColor} noHost>
            {title}
          </ThemedText>
        )}
      </Button>
    </Host>
  );
};
