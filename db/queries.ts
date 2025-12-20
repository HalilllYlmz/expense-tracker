import { desc, eq } from "drizzle-orm";
import { db } from "./index";
import { expenses } from "./schema";

export const initDatabase = async () => {
    try {
        await db.run(
            `CREATE TABLE IF NOT EXISTS expenses (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              amount REAL NOT NULL,
              date INTEGER NOT NULL,
              type TEXT DEFAULT 'expense'
            );`
        );
    }catch(error) {
        console.error("DB Initialization Error:", error);
    }
}

export const addExpense = async (title: string, amount: number, type: 'expense' | 'income' = 'expense') => {
    return await db.insert(expenses).values({
      title,
      amount,
      date: Date.now(),
      type
    }).returning(); // Eklenen satırı geri döner
  };

export const getExpenses = async () => {
    return await db.select().from(expenses).orderBy(desc(expenses.id));
};

export const deleteExpense = async (id: number) => {
    return await db.delete(expenses).where(eq(expenses.id, id));
}