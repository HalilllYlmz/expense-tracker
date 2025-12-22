import {
  addExpense,
  deleteAllExpenses,
  deleteExpense,
  getBudgets,
  getExpenses,
  setBudget,
  updateExpense,
} from "@/db/queries";
import { create } from "zustand";

interface Expense {
  id: number;
  title: string;
  amount: number;
  date: number;
  type: "income" | "expense";
  category: string;
}

interface Budget {
  category: string;
  amount: number;
}

interface ExpenseStore {
  expenses: Expense[];
  budgets: Budget[];
  loading: boolean;

  loadExpenses: () => Promise<void>;
  addNewExpense: (
    title: string,
    amount: number,
    category: string,
    type: "income" | "expense",
    date: number
  ) => Promise<void>;
  editExpense: (
    id: number,
    title: string,
    amount: number,
    category: string,
    type: "income" | "expense",
    date: number
  ) => Promise<void>;
  removeExpense: (id: number) => Promise<void>;
  resetAllData: () => Promise<void>;

  saveCategoryBudget: (category: string, amount: number) => Promise<void>;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  budgets: [],
  loading: false,

  loadExpenses: async () => {
    set({ loading: true });
    try {
      const data = await getExpenses();
      const budgetData = await getBudgets(); // <-- Bütçeleri çek

      set({
        expenses: data as any[],
        budgets: budgetData as Budget[], // <-- Store'a kaydet
        loading: false,
      });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },

  addNewExpense: async (title, amount, category, type, date) => {
    try {
      const newExpenseArray = await addExpense(
        title,
        amount,
        category,
        type,
        date
      );
      const newExpense = newExpenseArray[0];
      set((state) => ({
        expenses: [newExpense as Expense, ...state.expenses],
      }));
    } catch (e) {
      console.error("Store Ekleme Hatası:", e);
      throw e;
    }
  },
  editExpense: async (id, title, amount, category, type, date) => {
    try {
      await updateExpense(id, title, amount, category, type, date);
      set((state) => ({
        expenses: state.expenses.map((item) =>
          item.id === id
            ? { ...item, title, amount, category, type, date }
            : item
        ),
      }));
    } catch (error) {
      console.error("Store Error: ", error);
      throw error;
    }
  },
  removeExpense: async (id) => {
    try {
      await deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
      }));
    } catch (e) {
      console.error("Store Silme Hatası:", e);
    }
  },
  resetAllData: async () => {
    try {
      await deleteAllExpenses();
      set({ expenses: [] });
    } catch (error) {
      console.error("Sıfırlama Hatası ", error);
    }
  },
  saveCategoryBudget: async (category, amount) => {
    try {
      await setBudget(category, amount);

      set((state) => {
        const existingIndex = state.budgets.findIndex(
          (b) => b.category === category
        );
        let newBudgets = [...state.budgets];

        if (existingIndex >= 0) {
          newBudgets[existingIndex] = { category, amount }; // Güncelle
        } else {
          newBudgets.push({ category, amount }); // Ekle
        }

        return { budgets: newBudgets };
      });
    } catch (e) {
      console.error("Bütçe Hatası:", e);
    }
  },
}));
