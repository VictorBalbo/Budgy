import { TextType, ThemedText, ThemedView } from "@/components/ui";
import { StyleSheet } from "react-native";

export default function Account() {
  return (
    <ThemedView background style={styles.container}>
      <ThemedText type={TextType.Display}>Account</ThemedText>
      <ThemedText type={TextType.Body}>Manage your profile and settings.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  }
});