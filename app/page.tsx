import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { PricingCheckout } from "@/components/PricingCheckout";
import { RuleCard } from "@/components/RuleCard";
import { Badge } from "@/components/ui/badge";
import { getFeaturedRules, getRecentWeeklyRules } from "@/lib/database";

const faqItems = [
  {
    question: "What do I get for $7/month?",
    answer:
      "Full access to all 240 curated .cursorrules files, weekly community additions, searchable framework filters, and direct install commands for every rule.",
  },
  {
    question: "How does installation work?",
    answer:
      "Every rule has a one-command installer (`npx cursor-rules-install install <slug>`) and a direct .cursorrules download option if you prefer manual setup.",
  },
  {
    question: "Is this just copied markdown from GitHub?",
    answer:
      "No. Rules are normalized, structured for direct use, and maintained with consistent quality standards so teams can adopt them quickly.",
  },
  {
    question: "Can I fork a rule for my own team conventions?",
    answer:
      "Yes. Each rule page includes a fork action so you can copy the full baseline and customize it for project-specific workflows.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const params = await searchParams;
  if (params.order_id) {
    redirect(`/api/auth?order_id=${encodeURIComponent(params.order_id)}`);
  }

  const [featuredRules, weeklyRules] = await Promise.all([
    getFeaturedRules(6),
    getRecentWeeklyRules(6),
  ]);

  return (
    <main>
      <header className="border-b border-[#30363d]/70 bg-[#0d1117]/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-semibold text-[#e6edf3]">
            Cursor Rules Library
          </Link>
          <nav className="flex items-center gap-5 text-sm text-[#9fb3c8]">
            <a href="#pricing" className="hover:text-[#e6edf3]">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#e6edf3]">
              FAQ
            </a>
            <Link href="/browse" className="inline-flex items-center gap-1 text-[#79c0ff] hover:text-[#a5d6ff]">
              Browse rules
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-14 pt-16 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div>
          <Badge variant="success" className="mb-4">
            Weekly new rules from the community
          </Badge>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-[#f0f6fc] md:text-5xl">
            Cursor Rules Library
            <br />
            curated .cursorrules files for every framework, one-click install
          </h1>
          <p className="mt-5 max-w-xl text-base text-[#9fb3c8] md:text-lg">
            Stop copy-pasting static markdown. Find production-ready rules for Next.js, Rust, Go,
            Python, and more. Preview, fork, and ship faster with an install flow that takes less than 30 seconds.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PricingCheckout className="sm:w-auto" />
            <Link
              href="/browse"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#30363d] px-5 text-sm font-medium text-[#e6edf3] hover:bg-[#161b22]"
            >
              Explore locked library
            </Link>
          </div>
          <div className="mt-6 grid gap-2 text-sm text-[#9fb3c8]">
            <p className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-[#56d364]" />
              240 framework-specific rules maintained weekly
            </p>
            <p className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-[#56d364]" />
              Copy-ready commands and direct downloads
            </p>
            <p className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-[#56d364]" />
              Built for Cursor and Claude Code workflows
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#30363d] bg-[#11161d] p-6">
          <p className="text-xs uppercase tracking-wide text-[#79c0ff]">Install flow</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-[#0d1117] p-4 text-sm text-[#c9d1d9]">
{`npx cursor-rules-install install nextjs-core-architecture \\
  --base-url https://cursor-rules-library.com`}
          </pre>
          <p className="mt-3 text-sm text-[#9fb3c8]">
            Installer writes `.cursorrules` in your project root and keeps your repo ready for AI pair programming.
          </p>
          <div className="mt-4 rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-[#e6edf3]">
              <Sparkles className="h-4 w-4 text-[#79c0ff]" />
              New this week
            </p>
            <ul className="mt-2 space-y-2 text-sm text-[#9fb3c8]">
              {weeklyRules.slice(0, 3).map((rule) => (
                <li key={rule.slug} className="truncate">
                  {rule.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-xl border border-[#30363d] bg-[#11161d] p-5">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">The problem</h2>
            <p className="mt-2 text-sm text-[#9fb3c8]">
              `awesome-cursorrules` has huge reach but it is static markdown. Teams still spend time manually
              copying, cleaning, and adapting rules before they can start coding.
            </p>
          </article>
          <article className="rounded-xl border border-[#30363d] bg-[#11161d] p-5">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">The solution</h2>
            <p className="mt-2 text-sm text-[#9fb3c8]">
              A hosted, searchable library with normalized metadata, framework filters, and direct installation.
              Open a rule and install immediately with one command.
            </p>
          </article>
          <article className="rounded-xl border border-[#30363d] bg-[#11161d] p-5">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">Why now</h2>
            <p className="mt-2 text-sm text-[#9fb3c8]">
              Cursor and Claude Code users switch stacks constantly. Paying $7/month to skip setup friction is a clear
              convenience wedge that saves engineering time every week.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-[#f0f6fc]">Featured rules</h2>
          <Link href="/browse" className="text-sm text-[#79c0ff] hover:text-[#a5d6ff]">
            View full library
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredRules.map((rule) => (
            <RuleCard key={rule.slug} rule={rule} locked />
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="rounded-2xl border border-[#30363d] bg-[#11161d] p-8 md:p-10">
          <h2 className="text-3xl font-semibold text-[#f0f6fc]">Simple pricing for working engineers</h2>
          <p className="mt-3 max-w-2xl text-[#9fb3c8]">
            One plan. Full rule library access, weekly updates, and CLI install support across all frameworks.
          </p>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-4xl font-semibold text-[#f0f6fc]">
                $7
                <span className="text-lg font-medium text-[#9fb3c8]">/month</span>
              </p>
              <p className="mt-2 text-sm text-[#9fb3c8]">7-day trial included, cancel anytime.</p>
            </div>
            <PricingCheckout />
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <h2 className="text-2xl font-semibold text-[#f0f6fc]">FAQ</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-xl border border-[#30363d] bg-[#11161d] p-5">
              <h3 className="text-base font-semibold text-[#e6edf3]">{item.question}</h3>
              <p className="mt-2 text-sm text-[#9fb3c8]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
