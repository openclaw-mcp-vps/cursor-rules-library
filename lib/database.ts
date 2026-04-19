import { promises as fs } from "node:fs";
import path from "node:path";
import type { PurchaseRecord, Rule } from "@/types/rule";

const dataDir = path.join(process.cwd(), "data");
const rulesPath = path.join(dataDir, "rules.json");
const purchasesPath = path.join(dataDir, "purchases.json");

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function ensurePurchasesFile() {
  try {
    await fs.access(purchasesPath);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(purchasesPath, "[]\n", "utf8");
  }
}

export async function getRules(): Promise<Rule[]> {
  const rules = await readJsonFile<Rule[]>(rulesPath);
  return rules.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFeaturedRules(limit = 9): Promise<Rule[]> {
  const rules = await getRules();
  return rules.filter((rule) => rule.featured).slice(0, limit);
}

export async function getRuleBySlug(slug: string): Promise<Rule | null> {
  const rules = await getRules();
  return rules.find((rule) => rule.slug === slug) ?? null;
}

export async function getFrameworks(): Promise<string[]> {
  const rules = await getRules();
  return [...new Set(rules.map((rule) => rule.framework))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export async function getRecentWeeklyRules(limit = 8): Promise<Rule[]> {
  const rules = await getRules();
  return rules.filter((rule) => rule.weeklyNew).slice(0, limit);
}

export async function getPurchases(): Promise<PurchaseRecord[]> {
  await ensurePurchasesFile();
  const rows = await readJsonFile<PurchaseRecord[]>(purchasesPath);
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPurchaseByOrderId(
  orderId: string
): Promise<PurchaseRecord | null> {
  const purchases = await getPurchases();
  return purchases.find((row) => row.orderId === orderId) ?? null;
}

export async function upsertPurchase(record: PurchaseRecord): Promise<void> {
  await ensurePurchasesFile();
  const purchases = await getPurchases();
  const index = purchases.findIndex((row) => row.orderId === record.orderId);

  if (index >= 0) {
    purchases[index] = { ...purchases[index], ...record };
  } else {
    purchases.push(record);
  }

  await fs.writeFile(purchasesPath, `${JSON.stringify(purchases, null, 2)}\n`, "utf8");
}
