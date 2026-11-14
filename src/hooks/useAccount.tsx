import { Account } from "@/models";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface AccountContextValue {
  activeAccounts: Account[];
  getAccountById: (id: string) => Account | undefined;
  setAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
  archiveAccount: (id: string) => void;
  unarchiveAccount: (id: string) => void;
}

type AccountProviderProps = PropsWithChildren<{ initialAccounts?: Account[] }>;
const AccountContext = createContext<AccountContextValue | null>(null);
export const AccountProvider = ({
  children,
  initialAccounts = [],
}: AccountProviderProps) => {
  const [accounts, setAccounts] = useState(initialAccounts);
  const activeAccounts = useMemo(
    () => accounts.filter((account) => !account.archivedAt),
    [accounts],
  );

  const getAccountById = useCallback(
    (id: string) => accounts.find((account) => account.id === id),
    [accounts],
  );

  const setAccount = useCallback(
    (account: Account) => {
      const exists = accounts.some((a) => a.id === account.id);
      const updated = exists
        ? accounts?.map((a) => (a.id === account.id ? account : a))
        : [...(accounts ?? []), account];
      setAccounts(updated);
    },
    [accounts],
  );

  const removeAccount = useCallback(
    (id: string) => {
      setAccounts(accounts.filter((a) => a.id !== id));
    },
    [accounts],
  );

  const archiveAccount = useCallback(
    (id: string) => {
      const updated = accounts.map((a) =>
        a.id === id ? { ...a, isArchived: true } : a,
      );
      setAccounts(updated);
    },
    [accounts],
  );

  const unarchiveAccount = useCallback(
    (id: string) => {
      const updated = accounts.map((a) =>
        a.id === id ? { ...a, isArchived: false } : a,
      );
      setAccounts(updated);
    },
    [accounts],
  );

  const value = useMemo<AccountContextValue>(
    () => ({
      activeAccounts,
      getAccountById,
      setAccount,
      removeAccount,
      archiveAccount,
      unarchiveAccount,
    }),
    [
      activeAccounts,
      getAccountById,
      setAccount,
      removeAccount,
      archiveAccount,
      unarchiveAccount,
    ],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};

/** Acessa o estado e as ações de contas/cartões do app. */
export const useAccountsContext = (): AccountContextValue => {
  const context = useContext(AccountContext);

  if (context === null) {
    throw new Error(
      "useAccounts precisa ser usado dentro de <AccountProvider>.",
    );
  }

  return context;
};
