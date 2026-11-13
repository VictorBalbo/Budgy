import { TransactionType } from "./common";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  categoryGroupId: string;
  monthlyBudgetInCents?: number;
  isArchived: boolean;
}