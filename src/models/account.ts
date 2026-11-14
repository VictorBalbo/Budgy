import { CurrencyCode } from "./common";

export enum AccountType {
  BankAccount = "bank_account",
  Cash = "cash",
  Investment = "investment",
  CreditCard = "credit_card",
  Other = "other",
}

interface AccountBase {
  id: string;
  name: string;
  currency: CurrencyCode;
  initialBalanceInCents: number;
  archivedAt: string;
}

export interface BankAccount extends AccountBase {
  type: Exclude<AccountType, AccountType.CreditCard>;
}

export interface CreditCardAccount extends AccountBase {
  type: AccountType.CreditCard;
  creditLimitInCents: number;
  closingDay: number;
  dueDay: number;
}

export type Account = BankAccount | CreditCardAccount;