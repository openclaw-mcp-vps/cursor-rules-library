"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchFiltersProps = {
  frameworks: string[];
  query: string;
  framework: string;
  onQueryChange: (value: string) => void;
  onFrameworkChange: (value: string) => void;
};

export function SearchFilters({
  frameworks,
  query,
  framework,
  onQueryChange,
  onFrameworkChange,
}: SearchFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#30363d] bg-[#11161d] p-4 md:grid-cols-[1fr_240px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#6e7681]" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="pl-10"
          placeholder="Search frameworks, tags, or rule descriptions"
          aria-label="Search rules"
        />
      </div>
      <select
        value={framework}
        onChange={(event) => onFrameworkChange(event.target.value)}
        className="h-10 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 text-sm text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]/60"
        aria-label="Filter by framework"
      >
        <option value="all">All frameworks</option>
        {frameworks.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
