import {
  seedAccounts,
  seedCategories,
  seedTransactions,
} from "@/data/seed";
import {
  AccountProvider,
  CategoryProvider,
  TransactionProvider,
} from "@/hooks";
import { NativeTabs } from "expo-router/native-tabs";

export default function RootLayout() {
  return (
    <AccountProvider initialAccounts={seedAccounts}>
      <CategoryProvider initialCategories={seedCategories}>
        <TransactionProvider initialTransactions={seedTransactions}>
          <NativeTabs>
            <NativeTabs.Trigger name="index">
              <NativeTabs.Trigger.Label>Overview</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon
                sf={{
                  default: "square.grid.2x2",
                  selected: "square.grid.2x2.fill",
                }}
                md="dashboard"
              />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="account">
              <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon
                sf={{ default: "person", selected: "person.fill" }}
                md="person"
              />
            </NativeTabs.Trigger>
          </NativeTabs>
        </TransactionProvider>
      </CategoryProvider>
    </AccountProvider>
  );
}

