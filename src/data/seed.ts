import {
  TransactionType,
  type Account,
  type Category,
  type Transaction,
} from "@/models";

import seedJson from "./seed.json";

/**
 * Dados de exemplo do Budgy — espelham os modelos de `src/models`.
 *
 * - `accounts`: dois cartões de crédito (BTG Pactual e Nubank), prontos para
 *   serem passados como `initialAccounts` do `<AccountProvider>` — incluem
 *   `initialBalanceInCents`, `creditLimitInCents`, `closingDay` e `dueDay`.
 * - `categories`: três categorias-pai de agrupamento (`catgrp_*`) e as
 *   categorias-folha referenciadas por `transactions[].categoryId`, ligadas aos
 *   grupos via `parentId`.
 * - `transactions`: gastos de cada cartão, vinculados via `accountId`.
 *
 * Valores monetários sempre em centavos (`amountInCents`,
 * `initialBalanceInCents`, `creditLimitInCents`, `monthlyBudgetInCents`) e datas
 * no formato `YYYY-MM-DD`.
 *
 * `archivedAt` vazio (`""`) representa um registro ativo: os providers filtram
 * com `!account.archivedAt` / `!category.archivedAt`, então qualquer valor
 * falsy conta como "não arquivado". Registros arquivados usam um timestamp ISO.
 *
 * O `icon` de categorias deve ser uma chave de `IconSymbols`
 * (`src/components/ui/ThemedIcon.tsx`), que hoje expõe apenas `plus`.
 */
export type SeedData = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
};

export const seed: SeedData = seedJson as SeedData;

export const seedAccounts: Account[] = seed.accounts;

export const seedCategories: Category[] = seed.categories;

export const seedTransactions: Transaction[] = seed.transactions;

/** Gastos de um cartão/conta, na ordem em que aparecem no JSON. */
export const getTransactionsByAccountId = (
  accountId: string,
): Transaction[] =>
  seedTransactions.filter(
    (transaction) => transaction.accountId === accountId,
  );

/** Soma dos gastos (`type: "expense"`) de um cartão/conta, em centavos. */
export const getSpentInCentsByAccountId = (accountId: string): number =>
  getTransactionsByAccountId(accountId)
    .filter((transaction) => transaction.type === TransactionType.Expense)
    .reduce((total, transaction) => total + transaction.amountInCents, 0);
