import { seedAccounts, seedCategories, seedTransactions } from "@/data/seed";
import {
  AccountProvider,
  CategoryProvider,
  TransactionProvider,
  useTheme,
  useThemeColor,
} from "@/hooks";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";

export default function RootLayout() {
  const scheme = useTheme();
  const backgroundColor = useThemeColor("background");
  const navigationTheme = scheme === "dark" ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider value={navigationTheme}>
      <AccountProvider initialAccounts={seedAccounts}>
        <CategoryProvider initialCategories={seedCategories}>
          <TransactionProvider initialTransactions={seedTransactions}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="AddTransaction"
                options={{
                  presentation: "modal",
                  title: "Nova Transação",
                  headerStyle: { backgroundColor },
                }}
              />
            </Stack>
          </TransactionProvider>
        </CategoryProvider>
      </AccountProvider>
    </ThemeProvider>
  );
}
