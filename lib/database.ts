import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Rule = {
  id: number;
  slug: string;
  name: string;
  framework: string;
  category: string;
  summary: string;
  whenToUse: string;
  maintainer: string;
  downloads: number;
  tags: string[];
  updatedAt: string;
  isPremium: boolean;
  content: string;
};

type PurchaseRecord = {
  email: string;
  purchasedAt: string;
  source: "stripe-webhook" | "manual";
  checkoutSessionId?: string;
};

type RuleQuery = {
  query?: string;
  framework?: string;
  includePremium?: boolean;
  limit?: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const RULES_PATH = path.join(DATA_DIR, "rules.json");
const PURCHASES_PATH = path.join(DATA_DIR, "purchases.json");

let rulesCache: Rule[] | null = null;

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, data: T) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getAllRules(): Promise<Rule[]> {
  if (rulesCache) {
    return rulesCache;
  }

  const rules = await readJsonFile<Rule[]>(RULES_PATH, []);
  const normalized = rules
    .filter((rule) => !!rule.slug)
    .sort((a, b) => b.downloads - a.downloads || a.framework.localeCompare(b.framework));

  rulesCache = normalized;
  return normalized;
}

export async function findRuleBySlug(slug: string): Promise<Rule | null> {
  const rules = await getAllRules();
  return rules.find((rule) => rule.slug === slug) ?? null;
}

export async function getFrameworks(): Promise<string[]> {
  const rules = await getAllRules();
  return [...new Set(rules.map((rule) => rule.framework))].sort((a, b) => a.localeCompare(b));
}

export async function searchRules({
  query,
  framework,
  includePremium = true,
  limit
}: RuleQuery = {}): Promise<Rule[]> {
  const rules = await getAllRules();
  const normalizedQuery = query?.trim().toLowerCase();

  const filtered = rules.filter((rule) => {
    if (!includePremium && rule.isPremium) {
      return false;
    }

    if (framework && framework !== "all" && rule.framework !== framework) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      rule.framework.toLowerCase().includes(normalizedQuery) ||
      rule.name.toLowerCase().includes(normalizedQuery) ||
      rule.summary.toLowerCase().includes(normalizedQuery) ||
      rule.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
    );
  });

  if (typeof limit === "number" && limit > 0) {
    return filtered.slice(0, limit);
  }

  return filtered;
}

export async function getRuleStats() {
  const rules = await getAllRules();
  const frameworks = await getFrameworks();
  return {
    totalRules: rules.length,
    totalFrameworks: frameworks.length,
    freeRules: rules.filter((rule) => !rule.isPremium).length,
    premiumRules: rules.filter((rule) => rule.isPremium).length
  };
}

export function createRulePreview(content: string, maxLines = 10) {
  return content.split("\n").slice(0, maxLines).join("\n");
}

export async function hasPaidEmail(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const records = await readJsonFile<PurchaseRecord[]>(PURCHASES_PATH, []);
  return records.some((record) => record.email.toLowerCase() === normalized);
}

export async function recordPaidEmail(params: {
  email: string;
  source?: PurchaseRecord["source"];
  checkoutSessionId?: string;
}) {
  const normalized = params.email.trim().toLowerCase();
  if (!normalized) {
    return;
  }

  const records = await readJsonFile<PurchaseRecord[]>(PURCHASES_PATH, []);
  const existing = records.find((record) => record.email.toLowerCase() === normalized);

  if (existing) {
    return;
  }

  records.push({
    email: normalized,
    purchasedAt: new Date().toISOString(),
    source: params.source ?? "manual",
    checkoutSessionId: params.checkoutSessionId
  });

  await writeJsonFile(PURCHASES_PATH, records);
}
