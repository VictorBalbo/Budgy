import { Category, TransactionType } from "@/models";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface CategoryContextValue {
  activeCategories: Category[];
  expenseCategories: Category[];
  incomeCategories: Category[];
  getCategoryById: (id: string) => Category | undefined;
  setCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
  archiveCategory: (id: string) => void;
  unarchiveCategory: (id: string) => void;
}

type CategoryProviderProps = PropsWithChildren<{
  initialCategories?: Category[];
}>;

const CategoryContext = createContext<CategoryContextValue | null>(null);

export const CategoryProvider = ({
  children,
  initialCategories = [],
}: CategoryProviderProps) => {
  const [categories, setCategories] = useState(initialCategories);

  const activeCategories = useMemo(
    () => categories.filter((category) => !category.archivedAt),
    [categories],
  );

  const expenseCategories = useMemo(
    () =>
      activeCategories.filter(
        (category) => category.type === TransactionType.Expense,
      ),
    [activeCategories],
  );

  const incomeCategories = useMemo(
    () =>
      activeCategories.filter(
        (category) => category.type === TransactionType.Income,
      ),
    [activeCategories],
  );

  const getCategoryById = useCallback(
    (id: string) => categories.find((category) => category.id === id),
    [categories],
  );

  const setCategory = useCallback((category: Category) => {
    setCategories((current) =>
      current.some((c) => c.id === category.id)
        ? current.map((c) => (c.id === category.id ? category : c))
        : [...current, category],
    );
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCategories((current) => current.filter((c) => c.id !== id));
  }, []);

  const archiveCategory = useCallback((id: string) => {
    setCategories((current) =>
      current.map((c) => (c.id === id ? { ...c, isArchived: true } : c)),
    );
  }, []);

  const unarchiveCategory = useCallback((id: string) => {
    setCategories((current) =>
      current.map((c) => (c.id === id ? { ...c, isArchived: false } : c)),
    );
  }, []);

  const value = useMemo<CategoryContextValue>(
    () => ({
      activeCategories,
      expenseCategories,
      incomeCategories,
      getCategoryById,
      setCategory,
      removeCategory,
      archiveCategory,
      unarchiveCategory,
    }),
    [
      activeCategories,
      expenseCategories,
      incomeCategories,
      getCategoryById,
      setCategory,
      removeCategory,
      archiveCategory,
      unarchiveCategory,
    ],
  );

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

/** Acessa o estado e as ações de categorias do app. */
export const useCategoriesContext = (): CategoryContextValue => {
  const context = useContext(CategoryContext);

  if (context === null) {
    throw new Error(
      "useCategoriesContext precisa ser usado dentro de <CategoryProvider>.",
    );
  }

  return context;
};
