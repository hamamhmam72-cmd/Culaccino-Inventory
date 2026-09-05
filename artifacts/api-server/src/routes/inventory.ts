import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, itemsTable, transactionsTable, type ItemRow } from "@workspace/db";
import {
  CreateItemBody,
  UpdateItemBody,
  DeleteItemBody,
  WithdrawItemBody,
  RestockItemBody,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function toItemDto(row: ItemRow) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: row.quantity,
    unit: row.unit,
    minStock: row.minStock,
    cost: row.cost,
    totalValue: row.cost === null ? null : Math.round(row.cost * row.quantity * 100) / 100,
    addedBy: row.addedBy,
    addedAt: row.addedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

type TxInput = {
  itemId: string;
  itemName: string;
  type: "restock" | "withdrawal" | "adjustment" | "deletion" | "addition";
  quantityBefore: number;
  quantityAfter: number;
  delta: number;
  performedBy: string;
  note?: string;
};

type Db = typeof db;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

async function recordTransaction(dbc: Db | Tx, tx: TxInput) {
  await dbc.insert(transactionsTable).values({ id: randomUUID(), ...tx });
}

async function lockItem(tx: Tx, id: string): Promise<ItemRow | undefined> {
  const rows = await tx
    .select()
    .from(itemsTable)
    .where(eq(itemsTable.id, id))
    .limit(1)
    .for("update");
  return rows[0];
}

// ── Seed data on first run (matches the previous local-storage seed) ───────
const SEED_ITEMS = [
  { name: "Ethiopia Yirgacheffe Beans", category: "Coffee Beans", quantity: 8, unit: "kg", minStock: 10, cost: 24.5 },
  { name: "Colombia Supremo Beans", category: "Coffee Beans", quantity: 25, unit: "kg", minStock: 15, cost: 18.0 },
  { name: "Decaf Swiss Water Beans", category: "Coffee Beans", quantity: 5, unit: "kg", minStock: 5, cost: 26.0 },
  { name: "Whole Milk", category: "Dairy & Milk", quantity: 42, unit: "L", minStock: 20, cost: 1.2 },
  { name: "Oat Milk", category: "Dairy & Milk", quantity: 18, unit: "L", minStock: 24, cost: 2.1 },
  { name: "Vanilla Syrup", category: "Syrups", quantity: 6, unit: "bottles", minStock: 4, cost: 8.5 },
  { name: "Caramel Syrup", category: "Syrups", quantity: 3, unit: "bottles", minStock: 4, cost: 8.5 },
  { name: "8oz Hot Cups", category: "Cups & Packaging", quantity: 450, unit: "pcs", minStock: 500, cost: 0.1 },
  { name: "12oz Hot Cups", category: "Cups & Packaging", quantity: 1200, unit: "pcs", minStock: 500, cost: 0.15 },
  { name: "Lids (Standard)", category: "Cups & Packaging", quantity: 1500, unit: "pcs", minStock: 1000, cost: 0.05 },
  { name: "Espresso Machine Cleaner", category: "Cleaning Supplies", quantity: 4, unit: "tubs", minStock: 2, cost: 15.0 },
  { name: "Microfiber Cloths", category: "Cleaning Supplies", quantity: 24, unit: "pcs", minStock: 10, cost: 1.5 },
];

let seedPromise: Promise<void> | null = null;
function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await db.select({ id: itemsTable.id }).from(itemsTable).limit(1);
      if (existing.length > 0) return;
      await db
        .insert(itemsTable)
        .values(SEED_ITEMS.map((s) => ({ id: randomUUID(), addedBy: "Admin", ...s })));
      logger.info("Seeded inventory items");
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

async function findItem(id: string): Promise<ItemRow | undefined> {
  const rows = await db.select().from(itemsTable).where(eq(itemsTable.id, id)).limit(1);
  return rows[0];
}

router.get("/items", async (_req, res, next) => {
  try {
    await ensureSeeded();
    const rows = await db.select().from(itemsTable).orderBy(itemsTable.addedAt);
    res.json(rows.map(toItemDto));
  } catch (err) {
    next(err);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const parsed = CreateItemBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const { performedBy, ...data } = parsed.data;
    const id = randomUUID();
    const row = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(itemsTable)
        .values({ id, ...data, name: data.name.trim(), unit: data.unit.trim(), addedBy: performedBy })
        .returning();
      await recordTransaction(tx, {
        itemId: id,
        itemName: created.name,
        type: "addition",
        quantityBefore: 0,
        quantityAfter: created.quantity,
        delta: created.quantity,
        performedBy,
        note: "Item added",
      });
      return created;
    });
    res.status(201).json(toItemDto(row));
  } catch (err) {
    next(err);
  }
});

router.patch("/items/:id", async (req, res, next) => {
  try {
    const parsed = UpdateItemBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const { performedBy, ...updates } = parsed.data;
    const row = await db.transaction(async (tx) => {
      const target = await lockItem(tx, req.params.id);
      if (!target) return null;

      const [updated] = await tx
        .update(itemsTable)
        .set({
          ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
          ...(updates.category !== undefined ? { category: updates.category } : {}),
          ...(updates.quantity !== undefined ? { quantity: updates.quantity } : {}),
          ...(updates.unit !== undefined ? { unit: updates.unit.trim() } : {}),
          ...(updates.minStock !== undefined ? { minStock: updates.minStock } : {}),
          ...(updates.cost !== undefined ? { cost: updates.cost } : {}),
        })
        .where(eq(itemsTable.id, target.id))
        .returning();

      if (updates.quantity !== undefined && updates.quantity !== target.quantity) {
        await recordTransaction(tx, {
          itemId: target.id,
          itemName: updated.name,
          type: "adjustment",
          quantityBefore: target.quantity,
          quantityAfter: updates.quantity,
          delta: updates.quantity - target.quantity,
          performedBy,
          note: "Item edited",
        });
      }
      return updated;
    });
    if (!row) { res.status(404).json({ error: "Item not found" }); return; }
    res.json(toItemDto(row));
  } catch (err) {
    next(err);
  }
});

router.post("/items/:id/delete", async (req, res, next) => {
  try {
    const parsed = DeleteItemBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const found = await db.transaction(async (tx) => {
      const target = await lockItem(tx, req.params.id);
      if (!target) return false;

      await tx.delete(itemsTable).where(eq(itemsTable.id, target.id));
      await recordTransaction(tx, {
        itemId: target.id,
        itemName: target.name,
        type: "deletion",
        quantityBefore: target.quantity,
        quantityAfter: 0,
        delta: -target.quantity,
        performedBy: parsed.data.performedBy,
        note: "Item deleted",
      });
      return true;
    });
    if (!found) { res.status(404).json({ error: "Item not found" }); return; }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

async function applyStockChange(
  id: string,
  kind: "withdraw" | "restock",
  body: unknown,
  res: import("express").Response,
): Promise<void> {
  const schema = kind === "withdraw" ? WithdrawItemBody : RestockItemBody;
  const parsed = schema.safeParse(body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { quantity, performedBy, note } = parsed.data;

  const row = await db.transaction(async (tx) => {
    const target = await lockItem(tx, id);
    if (!target) return null;

    const newQty =
      kind === "withdraw" ? Math.max(0, target.quantity - quantity) : target.quantity + quantity;

    const [updated] = await tx
      .update(itemsTable)
      .set({ quantity: newQty })
      .where(eq(itemsTable.id, target.id))
      .returning();

    await recordTransaction(tx, {
      itemId: target.id,
      itemName: target.name,
      type: kind === "withdraw" ? "withdrawal" : "restock",
      quantityBefore: target.quantity,
      quantityAfter: newQty,
      delta: newQty - target.quantity,
      performedBy,
      note: note ?? (kind === "withdraw" ? "Withdrawn for use" : "Restocked"),
    });
    return updated;
  });
  if (!row) { res.status(404).json({ error: "Item not found" }); return; }
  res.json(toItemDto(row));
}

router.post("/items/:id/withdraw", async (req, res, next) => {
  try {
    await applyStockChange(req.params.id, "withdraw", req.body, res);
  } catch (err) {
    next(err);
  }
});

router.post("/items/:id/restock", async (req, res, next) => {
  try {
    await applyStockChange(req.params.id, "restock", req.body, res);
  } catch (err) {
    next(err);
  }
});

router.get("/transactions", async (_req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(transactionsTable)
      .orderBy(desc(transactionsTable.timestamp));
    res.json(
      rows.map((r) => ({
        id: r.id,
        itemId: r.itemId,
        itemName: r.itemName,
        type: r.type,
        quantityBefore: r.quantityBefore,
        quantityAfter: r.quantityAfter,
        delta: r.delta,
        performedBy: r.performedBy,
        timestamp: r.timestamp.toISOString(),
        note: r.note,
      })),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
