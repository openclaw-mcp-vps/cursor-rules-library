import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { BrowseClient } from "@/components/BrowseClient";
import { PaywallGate } from "@/components/PaywallGate";
import { RuleCard } from "@/components/RuleCard";
import { getFeaturedRules, getFrameworks, getRules } from "@/lib/database";

export const metadata: Metadata = {
  title: "Browse Rules",
  description:
    "Search and filter curated .cursorrules files by framework. Install with one command.",
  alternates: {
    canonical: "/browse",
  },
};

export default async function BrowsePage() {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get("crl_access")?.value === "1";

  if (!hasAccess) {
    const previewRules = await getFeaturedRules(6);
    return (
      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-12">
        <header className="space-y-3">
          <Link href="/" className="text-sm text-[#79c0ff] hover:text-[#a5d6ff]">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-semibold text-[#f0f6fc]">Browse the rule library</h1>
          <p className="max-w-2xl text-[#9fb3c8]">
            You can preview the catalog below. Subscribe to unlock full search, full rule content, and CLI install links.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {previewRules.map((rule) => (
            <RuleCard key={rule.slug} rule={rule} locked />
          ))}
        </div>

        <PaywallGate />
      </main>
    );
  }

  const [rules, frameworks] = await Promise.all([getRules(), getFrameworks()]);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12">
      <header className="space-y-3">
        <Link href="/" className="text-sm text-[#79c0ff] hover:text-[#a5d6ff]">
          ← Back to home
        </Link>
        <h1 className="text-3xl font-semibold text-[#f0f6fc]">Rule Library</h1>
        <p className="max-w-2xl text-[#9fb3c8]">
          Search through 240 production-ready .cursorrules files, filter by framework, then open any rule to install or fork.
        </p>
      </header>
      <BrowseClient rules={rules} frameworks={frameworks} />
    </main>
  );
}
