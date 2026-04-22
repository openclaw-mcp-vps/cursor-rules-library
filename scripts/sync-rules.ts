import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import fetch from "node-fetch";

type Rule = {
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

const README_URL =
  "https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/main/README.md";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractFrameworkNames(markdown: string) {
  const rows = markdown.split("\n");
  const frameworks = new Set<string>();

  for (const row of rows) {
    if (!row.includes(".cursorrules")) {
      continue;
    }

    const match = row.match(/\[(.*?)\]\((.*?)\)/);
    if (!match) {
      continue;
    }

    const label = match[1]?.trim();
    if (!label) {
      continue;
    }

    frameworks.add(label);
  }

  return [...frameworks];
}

function createRuleFromFramework(name: string, nextId: number): Rule {
  return {
    id: nextId,
    slug: toSlug(name),
    name: `${name} Community Rule Pack`,
    framework: name,
    category: "Community",
    summary: `${name} defaults imported from awesome-cursorrules and normalized for hosted install flow.`,
    whenToUse: `Use this when your team wants a curated ${name} baseline with explicit engineering guardrails.`,
    maintainer: "Community Maintainers",
    downloads: 0,
    tags: ["community", "imported", "subscriber"],
    updatedAt: new Date().toISOString(),
    isPremium: true,
    content: [
      `You are a senior ${name} engineer.`,
      "- Keep code changes deterministic and reviewable.",
      "- Follow existing project patterns first, then improve incrementally.",
      "- Add tests for every behavioral change.",
      "- Report tradeoffs when design choices are ambiguous."
    ].join("\n")
  };
}

async function main() {
  const dataPath = path.join(process.cwd(), "data", "rules.json");
  const existingRaw = await readFile(dataPath, "utf-8");
  const existingRules = JSON.parse(existingRaw) as Rule[];

  const response = await fetch(README_URL, {
    headers: {
      "user-agent": "cursor-rules-library-sync-script"
    }
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch source markdown: ${response.status}`);
  }

  const markdown = await response.text();
  const frameworks = extractFrameworkNames(markdown);

  const bySlug = new Map(existingRules.map((rule) => [rule.slug, rule]));
  let nextId = Math.max(0, ...existingRules.map((rule) => rule.id)) + 1;

  for (const framework of frameworks) {
    const slug = toSlug(framework);
    if (bySlug.has(slug)) {
      continue;
    }

    const created = createRuleFromFramework(framework, nextId++);
    bySlug.set(slug, created);
  }

  const merged = [...bySlug.values()].sort(
    (a, b) => b.downloads - a.downloads || a.framework.localeCompare(b.framework)
  );

  await writeFile(dataPath, JSON.stringify(merged, null, 2), "utf-8");

  console.log(
    `Synced ${frameworks.length} source entries. Catalog now has ${merged.length} rules in ${dataPath}.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
