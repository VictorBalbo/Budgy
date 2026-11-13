import { CurrencyCode, TransactionType } from "./common";

export interface Transaction {
  id?: string;
  title: string;
  description?: string;
  amountInCents: number;
  currency: CurrencyCode;
  type: TransactionType;
  date: string;
  categoryId: string;
  walletId: string;
  paymentMethod: PaymentMethod;
  tags?: string[];
  installment?: InstallmentInfo;
  recurrence?: RecurrenceInfo;
  attachmentUri?: string;
}

export enum PaymentMethod {
  Cash = "cash",
  DebitCard = "debit_card",
  CreditCard = "credit_card",
  Pix = "pix",
  BankSlip = "bank_slip",
  Other = "other",
}

export enum RecurrenceFrequency {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
}

export type InstallmentInfo = {
  groupId: string;
  number: number;
};

export type RecurrenceInfo = {
  frequency: RecurrenceFrequency;
  interval: number;
  startsOn: string;
  endsOn?: string;
};