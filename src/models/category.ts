import { TransactionType } from "./common";

export interface Category {
  id: string;
  parentId?: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  monthlyBudgetInCents?: number;
  archivedAt: string;
}