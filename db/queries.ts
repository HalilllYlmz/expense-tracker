import { desc, eq, sql } from "drizzle-orm"; // sql importunu unutma
import { db } from "./index";
import { expenses } from "./schema";

export const initDatabase = async () => {
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        date INTEGER NOT NULL,
        type TEXT DEFAULT 'expense',
        category TEXT DEFAULT 'Diğer'
      );
    `);
    console.log("✅ Veritabanı ve Tablo Hazır");
  } catch (error) {
    console.error("❌ Veritabanı başlatma hatası:", error);
  }
};

export const getExpenses = async () => {
  return await db.select().from(expenses).orderBy(desc(expenses.id));
};

export const addExpense = async (
  title: string,
  amount: number,
  category: string,
  type: "expense" | "income" = "expense",
  dateTimestamp: number
) => {
  return await db
    .insert(expenses)
    .values({
      title,
      amount,
      date: dateTimestamp,
      type,
      category,
    })
    .returning();
};

export const deleteExpense = async (id: number) => {
  return await db.delete(expenses).where(eq(expenses.id, id));
};
