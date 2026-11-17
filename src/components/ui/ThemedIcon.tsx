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
  const iconName = getIconSymbol(name);

  const icon = <Icon name={iconName} size={size} color={color} style={style} />;

  if (noHost) {
    return icon;
  } else {
    return <Host matchContents>{icon}</Host>;
  }
};

export const getIconSymbol = (name: keyof IconSymbols) => {
    const iconSymbols = new IconSymbols();
    const iconSymbol = iconSymbols[name];
    return Icon.select(iconSymbol);
  }
export class IconSymbols {
  plus: IconSymbol = {
    ios: "plus",
    android: require("@expo/material-symbols/add.xml"),
  };
  chevronLeft: IconSymbol = {
    ios: "chevron.left",
    android: require("@expo/material-symbols/arrow_back_ios_new.xml"),
  };
  calendar: IconSymbol = {
    ios: "calendar",
    android: require("@expo/material-symbols/calendar_month.xml"),
  };
}
type IconSymbol = {
  ios: SFSymbol;
  android: ImageSourcePropType;
};
