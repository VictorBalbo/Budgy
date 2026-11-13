export const CURRENCIES = ["BRL", "USD", "EUR"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "BRL";

export enum TransactionType {
  Expense = "expense",
  Income = "income",
}