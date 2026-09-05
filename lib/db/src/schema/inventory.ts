import { doublePrecision, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const itemsTable = pgTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  minStock: doublePrecision("min_stock").notNull(),
  cost: doublePrecision("cost"),
  addedBy: text("added_by").notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertItemSchema = createInsertSchema(itemsTable).omit({
  id: true,
  addedAt: true,
  updatedAt: true,
});
export type InsertItem = z.infer<typeof insertItemSchema>;
export type ItemRow = typeof itemsTable.$inferSelect;

export const transactionsTable = pgTable("transactions", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  itemName: text("item_name").notNull(),
  type: text("type").notNull(),
  quantityBefore: doublePrecision("quantity_before").notNull(),
  quantityAfter: doublePrecision("quantity_after").notNull(),
  delta: doublePrecision("delta").notNull(),
  performedBy: text("performed_by").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  note: text("note"),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({
  id: true,
  timestamp: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type TransactionRow = typeof transactionsTable.$inferSelect;
