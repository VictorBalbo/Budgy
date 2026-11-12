import {
  TextType,
  ThemedButton,
  ButtonType,
  ThemedIcon,
  ThemedText,
  ThemedView,
  ButtonFormat,
} from "@/components/ui";
import { StyleSheet } from "react-native";

export default function Index() {
  return (
    <ThemedView background style={styles.container}>
      <ThemedText type={TextType.Display}>Overview</ThemedText>
      <ThemedText type={TextType.Body}>Your dashboard at a glance.</ThemedText>
      <ThemedIcon name="plus" />
      <ThemedButton
        icon="plus"
        onPress={() => alert("Pressed!")}
        format={ButtonFormat.Round}
      />
      <ThemedButton icon="plus" title="Add" onPress={() => alert("Pressed!")} />
      <ThemedButton
        title="Primary"
        type={ButtonType.Primary}
        format={ButtonFormat.Rectangle}
        onPress={() => alert("Primary!")}
      />
      <ThemedButton
        title="Secondary"
        type={ButtonType.Secondary}
        onPress={() => alert("Secondary!")}
      />
      <ThemedButton
        title="Plain"
        type={ButtonType.Plain}
        onPress={() => alert("Plain!")}
      />
      <ThemedButton
        title="Delete"
        type={ButtonType.Delete}
        onPress={() => alert("Delete!")}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
