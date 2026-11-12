import { Host, Icon, UniversalStyle } from "@expo/ui";
import { SFSymbol } from "expo-symbols";
import { ImageSourcePropType } from "react-native";

type IconProps = {
  name: keyof IconSymbols;
  size?: number;
  color?: string;
  style?: UniversalStyle;
  noHost?: boolean;
};
export const ThemedIcon = ({
  name,
  size = 24,
  color,
  style,
  noHost,
}: IconProps) => {
  const symbolMapping = new IconSymbols();
  const iconConfig = symbolMapping[name];
  const iconName = Icon.select({
    ios: iconConfig.ios,
    android: iconConfig.android,
  });

  const icon = <Icon name={iconName} size={size} color={color} style={style} />;

  if (noHost) {
    return icon;
  } else {
    return <Host matchContents>{icon}</Host>;
  }
};

export class IconSymbols {
  plus: IconSymbol = {
    ios: "plus",
    android: require("@expo/material-symbols/add.xml"),
  };
}
type IconSymbol = {
  ios: SFSymbol;
  android: ImageSourcePropType;
};
