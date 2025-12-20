import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const expenses = sqliteTable('expenses', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    amount: real('amount').notNull(),
    date: integer('date').notNull(),
    type: text('type').default('expense'),
});