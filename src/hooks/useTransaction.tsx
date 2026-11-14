import { Transaction, TransactionType } from "@/models";
import { getDayOfDate, getMonthInfo, getMonthOfDate } from "@/utils";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface TransactionContextValue {
  transactions: Transaction[];
  expenseTransactions: Transaction[];
  incomeTransactions: Transaction[];
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByCategoryId: (categoryId: string) => Transaction[];
  getTransactionsByAccountId: (walletId: string) => Transaction[];
  getCumulativeTransactionsPerDay: (month: string) => (number | null)[];
  setTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
}

type TransactionProviderProps = PropsWithChildren<{
  initialTransactions?: Transaction[];
}>;

const TransactionContext = createContext<TransactionContextValue | null>(null);

/** Id local para transações criadas sem um (o modelo aceita `id` opcional). */
const createTransactionId = () =>
  `tx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const TransactionProvider = ({
  children,
  initialTransactions = [],
}: TransactionProviderProps) => {
  const [transactions, setTransactions] = useState(initialTransactions);

  const expenseTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) => transaction.type === TransactionType.Expense,
      ),
    [transactions],
  );

  const incomeTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) => transaction.type === TransactionType.Income,
      ),
    [transactions],
  );

  const getTransactionById = useCallback(
    (id: string) => transactions.find((transaction) => transaction.id === id),
    [transactions],
  );

  const getTransactionsByCategoryId = useCallback(
    (categoryId: string) =>
      transactions.filter(
        (transaction) => transaction.categoryId === categoryId,
      ),
    [transactions],
  );

  const getTransactionsByAccountId = useCallback(
    (walletId: string) =>
      transactions.filter((transaction) => transaction.accountId === walletId),
    [transactions],
  );
  
  const getCumulativeTransactionsPerDay = useCallback(
    (month: string): (number | null)[] => {
      const monthInfo = getMonthInfo(month);

      if (monthInfo === null) {
        return [];
      }

      const { daysInMonth, lastKnownDay } = monthInfo;

      const totalsPerDayInCents = Array.from(
        { length: daysInMonth },
        () => 0,
      );

      transactions.forEach((transaction) => {
        if (getMonthOfDate(transaction.date) !== month) {
          return;
        }

        const day = getDayOfDate(transaction.date);

        if (day >= 1 && day <= daysInMonth) {
          totalsPerDayInCents[day - 1] += transaction.amountInCents;
        }
      });

      let cumulativeInCents = 0;

      return totalsPerDayInCents.map((totalInCents, index) => {
        if (index + 1 > lastKnownDay) {
          return null;
        }

        cumulativeInCents += totalInCents;

        return cumulativeInCents;
      });
    },
    [transactions],
  );

  const setTransaction = useCallback((transaction: Transaction) => {
    // Sem id, a transação é tratada como nova: geramos um para permitir
    // editar/remover depois.
    const next: Transaction = transaction.id
      ? transaction
      : { ...transaction, id: createTransactionId() };

    setTransactions((current) =>
      current.some((t) => t.id === next.id)
        ? current.map((t) => (t.id === next.id ? next : t))
        : [...current, next],
    );
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id),
    );
  }, []);

  const value = useMemo<TransactionContextValue>(
    () => ({
      transactions,
      expenseTransactions,
      incomeTransactions,
      getTransactionById,
      getTransactionsByCategoryId,
      getTransactionsByAccountId,
      getCumulativeTransactionsPerDay,
      setTransaction,
      removeTransaction,
    }),
    [
      transactions,
      expenseTransactions,
      incomeTransactions,
      getTransactionById,
      getTransactionsByCategoryId,
      getTransactionsByAccountId,
      getCumulativeTransactionsPerDay,
      setTransaction,
      removeTransaction,
    ],
  );

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

/** Acessa o estado e as ações de transações do app. */
export const useTransactionsContext = (): TransactionContextValue => {
  const context = useContext(TransactionContext);

  if (context === null) {
    throw new Error(
      "useTransactionsContext precisa ser usado dentro de <TransactionProvider>.",
    );
  }

  return context;
};
