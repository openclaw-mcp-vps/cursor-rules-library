"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { RuleCard } from "@/components/RuleCard";
import { SearchFilters } from "@/components/SearchFilters";
import type { Rule } from "@/types/rule";

type BrowseClientProps = {
  rules: Rule[];
  frameworks: string[];
};

export function BrowseClient({ rules, frameworks }: BrowseClientProps) {
  const [query, setQuery] = useState("");
  const [framework, setFramework] = useState("all");

  const fuse = useMemo(
    () =>
      new Fuse(rules, {
        threshold: 0.32,
        ignoreLocation: true,
        keys: [
          { name: "name", weight: 2 },
          { name: "framework", weight: 1.5 },
          { name: "description", weight: 1 },
          { name: "tags", weight: 1.2 },
        ],
      }),
    [rules]
  );

  const filtered = useMemo(() => {
    const base = framework === "all" ? rules : rules.filter((rule) => rule.framework === framework);
    if (!query.trim()) {
      return base;
    }

    const hitSlugs = new Set(
      fuse.search(query.trim()).map((item) => item.item.slug)
    );
    return base.filter((rule) => hitSlugs.has(rule.slug));
  }, [framework, fuse, query, rules]);

  return (
    <section className="space-y-4">
      <SearchFilters
        frameworks={frameworks}
        query={query}
        framework={framework}
        onQueryChange={setQuery}
        onFrameworkChange={setFramework}
      />
      <p className="text-sm text-[#9fb3c8]">{filtered.length} rules found</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((rule) => (
          <RuleCard key={rule.slug} rule={rule} />
        ))}
      </div>
    </section>
  );
}
