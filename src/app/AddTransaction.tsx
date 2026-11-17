import {
  ButtonType,
  CardView,
  getIconSymbol,
  TextType,
  ThemedButton,
  ThemedText,
  ThemedView,
} from "@/components/ui";
import { spacing } from "@/constants/theme";
import { Stack, useRouter } from "expo-router";
import { StyleSheet } from "react-native";

const backIcon = getIconSymbol("chevronLeft");

export default function AddTransaction() {
  const router = useRouter();

  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon={backIcon}
          accessibilityLabel="Back"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      <ThemedView background style={styles.container}>
        <CardView>
          <ThemedView style={styles.valueContainer}>
            <ThemedText type={TextType.Title}>R$</ThemedText>
            <ThemedText type={TextType.Display}>0.0</ThemedText>
          </ThemedView>
          <ThemedView style={styles.valueContainer}>
            <ThemedButton
              title="Despesa"
              type={ButtonType.Secondary}
              onPress={() => alert("press")}
            />
            <ThemedButton
              title="Renda"
              type={ButtonType.Secondary}
              onPress={() => alert("press")}
            />
            <ThemedButton
              title="Transferencia"
              type={ButtonType.Secondary}
              onPress={() => alert("press")}
            />
          </ThemedView>
        </CardView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.large,
  },
  valueContainer: {
    gap: spacing.small,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
