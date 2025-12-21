import {
  addExpense,
  deleteAllExpenses,
  deleteExpense,
  getExpenses,
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

interface ExpenseStore {
  expenses: Expense[];
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
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  loading: false,

  loadExpenses: async () => {
    set({ loading: true });
    try {
      const data = await getExpenses();
      set({ expenses: data as Expense[], loading: false });
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
}));
