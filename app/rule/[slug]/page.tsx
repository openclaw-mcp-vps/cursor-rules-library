import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ForkRuleButton } from "@/components/ForkRuleButton";
import { InstallButton } from "@/components/InstallButton";
import { PaywallGate } from "@/components/PaywallGate";
import { Badge } from "@/components/ui/badge";
import { getRuleBySlug, getRules } from "@/lib/database";

export async function generateStaticParams() {
  const rules = await getRules();
  return rules.map((rule) => ({ slug: rule.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rule = await getRuleBySlug(slug);

  if (!rule) {
    return {
      title: "Rule not found",
    };
  }

  return {
    title: rule.name,
    description: rule.description,
    alternates: {
      canonical: `/rule/${rule.slug}`,
    },
  };
}

export default async function RulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rule = await getRuleBySlug(slug);

  if (!rule) {
    notFound();
  }

  const cookieStore = await cookies();
  const hasAccess = cookieStore.get("crl_access")?.value === "1";

  if (!hasAccess) {
    const preview = rule.content.split("\n").slice(0, 18).join("\n");

    return (
      <main className="mx-auto w-full max-w-4xl space-y-8 px-6 py-12">
        <header className="space-y-3">
          <Link href="/browse" className="text-sm text-[#79c0ff] hover:text-[#a5d6ff]">
            ← Back to browse
          </Link>
          <h1 className="text-3xl font-semibold text-[#f0f6fc]">{rule.name}</h1>
          <p className="text-[#9fb3c8]">{rule.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge>{rule.framework}</Badge>
            {rule.weeklyNew ? <Badge variant="success">New this week</Badge> : null}
          </div>
        </header>

        <section className="rounded-xl border border-[#30363d] bg-[#11161d] p-5">
          <p className="mb-3 text-sm text-[#9fb3c8]">
            Preview only. Subscribe to unlock the full rule file, fork support, and install commands.
          </p>
          <pre className="max-h-[380px] overflow-auto rounded-lg bg-[#0d1117] p-4 text-sm text-[#c9d1d9]">
            {preview}
          </pre>
        </section>

        <PaywallGate />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-6 py-12">
      <header className="space-y-3">
        <Link href="/browse" className="text-sm text-[#79c0ff] hover:text-[#a5d6ff]">
          ← Back to browse
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{rule.framework}</Badge>
          <Badge variant="accent">{rule.language}</Badge>
          {rule.weeklyNew ? <Badge variant="success">New this week</Badge> : null}
        </div>
        <h1 className="text-3xl font-semibold text-[#f0f6fc]">{rule.name}</h1>
        <p className="text-[#9fb3c8]">{rule.description}</p>
      </header>

      <section className="rounded-xl border border-[#30363d] bg-[#11161d] p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#9fb3c8]">Install this rule in one command or fork it for your team.</p>
          <div className="flex flex-wrap gap-2">
            <InstallButton slug={rule.slug} />
            <ForkRuleButton slug={rule.slug} content={rule.content} />
          </div>
        </div>
        <pre className="overflow-auto rounded-lg bg-[#0d1117] p-4 text-sm text-[#c9d1d9]">
          {rule.content}
        </pre>
      </section>
    </main>
  );
}
