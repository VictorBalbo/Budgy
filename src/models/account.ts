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
  institution: string | null;
  currency: CurrencyCode;
  color: string;
  icon: string;
  balanceInCents: number;
  isArchived: boolean;
}

export interface BankAccount extends AccountBase {
  type: Exclude<AccountType, AccountType.CreditCard>;
}

export interface CreditCardAccount extends AccountBase {
  type: AccountType.CreditCard;
  creditLimitInCents: number;
  statementClosingDay: number;
  paymentDueDay: number;
}

export type Account = BankAccount | CreditCardAccount;