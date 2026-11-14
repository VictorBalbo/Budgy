import {
  TextType,
  ThemedButton,
  ButtonType,
  ThemedIcon,
  ThemedText,
  ThemedView,
  ButtonFormat,
  DonutChart,
  LineChart,
  CardView,
} from "@/components/ui";
import { spacing } from "@/constants/theme";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dados de exemplo do gráfico de linhas: gasto acumulado por dia.
const spendingValues = [
  40, 60, 55, 90, 120, 300, 420, 380, 460, 500, 520, 470, 560, 600, 580, 700,
  780, 820, 860, 900, 880, 960, 1041, 990, 1080, 1120,
];
const averageSpending = Math.round(
  spendingValues.reduce((total, value) => total + value, 0) /
    spendingValues.length,
);
const spendingData = spendingValues.map((value, index) => ({
  label: String(index + 1),
  title: `Dia ${index + 1}`,
  value,
  reference: averageSpending,
}));

export default function Account() {
  return (
    <ThemedView background style={styles.container}>
      <ScrollView>
        <SafeAreaView>
          <ThemedText type={TextType.Display}>Overview</ThemedText>
          <ThemedText type={TextType.Body}>
            Your dashboard at a glance.
          </ThemedText>
          <ThemedIcon name="plus" />
          <ThemedButton
            icon="plus"
            onPress={() => alert("Pressed!")}
            format={ButtonFormat.Round}
          />
          <ThemedButton
            icon="plus"
            title="Add"
            onPress={() => alert("Pressed!")}
          />
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
          <CardView>
            <DonutChart
              data={[
                {
                  label: "Firefox",
                  value: 30,
                },
                {
                  label: "Chrome",
                  value: 70,
                },
                {
                  label: "Zen",
                  value: 10,
                },
                {
                  label: "Safari",
                  value: 50,
                },
              ]}
            />
          </CardView>
          <CardView>
            <LineChart
              data={spendingData}
              formatValue={(value) => `R$ ${value.toLocaleString("pt-BR")}`}
              seriesLabel="Este período"
              referenceLabel="Média"
              xTickCount={6}
            />
          </CardView>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.medium,
  },
});
