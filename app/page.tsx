import Link from "next/link";
import { ArrowRight, CheckCircle2, Library, Rocket, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getRuleStats, searchRules } from "@/lib/database";

const faqs = [
  {
    question: "How is this different from awesome-cursorrules?",
    answer:
      "awesome-cursorrules is an excellent discovery list, but it is still static Markdown. Cursor Rules Library adds structured search, in-browser preview, and one-command installs so teams can move from discovery to implementation immediately."
  },
  {
    question: "What do I get after subscribing?",
    answer:
      "You unlock the full premium catalog, receive weekly additions from community submissions, and can install any rule directly into a project using the CLI tool without copy-paste drift."
  },
  {
    question: "How do I activate access after Stripe checkout?",
    answer:
      "After checkout, return to /browse and verify the same payment email you used on Stripe. The app issues a secure cookie so premium previews and CLI installs are available immediately."
  },
  {
    question: "Can I customize a rule for my team style guide?",
    answer:
      "Yes. Every rule is plain text and designed to be forked. Start with a curated baseline, adjust naming, architecture boundaries, and testing expectations, then commit the result to your repo."
  }
];

export default async function HomePage() {
  const stats = await getRuleStats();
  const featured = await searchRules({ limit: 6, includePremium: true });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10 sm:px-8 lg:px-12">
      <section className="rounded-2xl border border-[#273246] bg-[linear-gradient(140deg,rgba(11,17,30,0.95),rgba(17,24,39,0.92))] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-12">
        <div className="space-y-6">
          <Badge className="w-fit">AI Dev Tools</Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Cursor Rules Library
            <span className="mt-2 block text-2xl font-medium text-[#7dd3fc] sm:text-3xl">
              Curated .cursorrules files for every framework, one-click install.
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-[#cbd5e1]">
            Browse {stats.totalRules}+ curated rules across {stats.totalFrameworks} frameworks. Preview, fork,
            and install in seconds. Weekly community additions keep your prompts current as stacks evolve.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/browse">
                Explore the library
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string}
                target="_blank"
                rel="noreferrer"
              >
                Start subscriber access ($7/mo)
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Curated Rules" value={`${stats.totalRules}+`} icon={<Library className="h-5 w-5" />} />
        <StatCard
          label="Framework Coverage"
          value={`${stats.totalFrameworks}`}
          icon={<Sparkles className="h-5 w-5" />}
        />
        <StatCard label="Free Starters" value={`${stats.freeRules}`} icon={<Rocket className="h-5 w-5" />} />
        <StatCard label="Premium Depth" value={`${stats.premiumRules}`} icon={<ShieldCheck className="h-5 w-5" />} />
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Problem</CardTitle>
            <CardDescription>Static lists slow down project switches and team onboarding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-[#cbd5e1]">
            <p>
              Developers switching between Next.js, Rust, Go, and Python stacks keep reusing stale prompt files or
              random snippets from docs.
            </p>
            <p>
              awesome-cursorrules has huge demand with 25k stars, but static Markdown still requires manual searching,
              copy-paste, and local cleanup before each project.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Solution</CardTitle>
            <CardDescription>Hosted rules library with install flow built for speed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-[#cbd5e1]">
            <p>
              Cursor Rules Library ships reviewed .cursorrules files organized by framework and workflow. Every rule has
              install metadata, practical defaults, and maintenance history.
            </p>
            <p>
              Teams can preview before committing, fork rules for internal standards, and install from CLI with a single
              command.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Popular Framework Packs</h2>
          <Link className="text-sm text-[#7dd3fc] hover:underline" href="/browse">
            View all packs
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((rule) => (
            <Card key={rule.slug}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{rule.framework}</CardTitle>
                  {rule.isPremium ? <Badge variant="premium">Premium</Badge> : <Badge variant="success">Free</Badge>}
                </div>
                <CardDescription>{rule.summary}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[var(--muted)]">{rule.whenToUse}</CardContent>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={`/browse?slug=${rule.slug}`}>Preview rule</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <Card className="border-[#115e59]">
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Single plan designed for active Cursor and Claude Code users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-4xl font-bold text-white">$7<span className="text-lg text-[#94a3b8]">/month</span></p>
                <p className="mt-2 text-sm text-[#cbd5e1]">Cancel anytime. New rule drops every week.</p>
              </div>
              <Button asChild size="lg">
                <a
                  href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string}
                  target="_blank"
                  rel="noreferrer"
                >
                  Subscribe via Stripe
                </a>
              </Button>
            </div>
            <Separator />
            <ul className="grid gap-3 text-sm text-[#d1d5db] sm:grid-cols-2">
              {[
                "Full premium framework catalog",
                "One-command CLI installer",
                "Weekly community rule releases",
                "Fork-friendly rule structure",
                "Paywalled browsing + private installs",
                "Direct checkout on Stripe hosted page"
              ].map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#4fd1c5]" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-6 space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-[#cbd5e1]">{faq.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#94a3b8]">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-md border border-[#1f2937] bg-[#0b1220] p-2 text-[#7dd3fc]">{icon}</div>
      </CardContent>
    </Card>
  );
}
