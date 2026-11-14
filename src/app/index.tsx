import {
  TextType,
  ThemedText,
  ThemedView,
  LineChart,
  CardView,
} from "@/components/ui";
import { spacing } from "@/constants/theme";
import { useTransactionsContext } from "@/hooks";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { getCumulativeTransactionsPerDay } = useTransactionsContext();
  const valuePerDay = getCumulativeTransactionsPerDay("2026-11");
  const spendingData = valuePerDay.map((value, index) => ({
    label: String(index + 1),
    title: `Dia ${index + 1}`,
    value: value ? value / 100 : null,
  }));
  return (
    <ThemedView background style={styles.container}>
      <ScrollView>
        <SafeAreaView>
          <ThemedText type={TextType.Display}>Overview</ThemedText>
          <CardView>
            <ThemedText>Gasto este Mês</ThemedText>
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
