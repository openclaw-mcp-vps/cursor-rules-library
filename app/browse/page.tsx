import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, Lock, Search } from "lucide-react";

import { CLIInstaller } from "@/components/CLIInstaller";
import { RuleCard } from "@/components/RuleCard";
import { RulePreview } from "@/components/RulePreview";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/auth";
import { createRulePreview, getFrameworks, searchRules } from "@/lib/database";

type BrowsePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value[0] ?? "" : value;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const query = firstParam(params.q);
  const framework = firstParam(params.framework) || "all";
  const selectedSlug = firstParam(params.slug);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value ?? null;
  const session = verifyAccessToken(accessToken);
  const authenticated = Boolean(session);

  const frameworks = await getFrameworks();
  const rules = await searchRules({
    query,
    framework: framework === "all" ? undefined : framework,
    includePremium: true,
    limit: 250
  });

  const selectedRule = rules.find((rule) => rule.slug === selectedSlug) ?? rules[0] ?? null;
  const locked = selectedRule ? selectedRule.isPremium && !authenticated : false;

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-8 sm:px-8 lg:px-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to landing page
          </Link>
          <h1 className="text-3xl font-bold">Browse Rule Library</h1>
          <p className="text-sm text-[#94a3b8]">
            Search framework packs, inspect rule quality, and install into any project.
          </p>
        </div>
        {authenticated ? (
          <Badge variant="success">Subscription active for {session?.email}</Badge>
        ) : (
          <Badge variant="premium">Subscriber preview mode</Badge>
        )}
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find a rule</CardTitle>
              <CardDescription>Filter by framework and inspect install details before running the CLI.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto]" action="/browse" method="get">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
                  <Input
                    name="q"
                    defaultValue={query}
                    placeholder="Search Next.js, Rust, API testing, monorepo..."
                    className="pl-9"
                  />
                </div>
                <select
                  name="framework"
                  defaultValue={framework}
                  className="h-10 rounded-md border border-[#334155] bg-[#0b1220] px-3 text-sm"
                >
                  <option value="all">All frameworks</option>
                  {frameworks.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <Button type="submit">Apply</Button>
              </form>
            </CardContent>
          </Card>

          {!authenticated ? (
            <Card className="border-[#7c2d12]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#f59e0b]" />
                  Premium catalog is paywalled
                </CardTitle>
                <CardDescription>
                  Checkout on Stripe, then verify your payment email to unlock every rule and CLI installs.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <UnlockAccessForm />
                <div className="space-y-3 rounded-lg border border-[#273246] bg-[#0b1220] p-4">
                  <p className="text-sm text-[#cbd5e1]">
                    Subscriber plan includes full framework coverage, weekly additions, and install automation.
                  </p>
                  <Button asChild className="w-full" size="lg">
                    <a
                      href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buy subscriber access ($7/mo)
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {rules.map((rule) => (
              <RuleCard
                key={rule.slug}
                rule={rule}
                locked={rule.isPremium && !authenticated}
                active={selectedRule?.slug === rule.slug}
              />
            ))}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {selectedRule ? (
            <>
              <RulePreview
                framework={selectedRule.framework}
                locked={locked}
                content={locked ? createRulePreview(selectedRule.content, 14) : selectedRule.content}
              />
              {!locked ? (
                <CLIInstaller slug={selectedRule.slug} accessToken={accessToken} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Install is locked</CardTitle>
                    <CardDescription>
                      Verify your purchase first, then this panel will generate a command for this rule.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No rules match this filter</CardTitle>
                <CardDescription>Try a broader search term or reset framework to All.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </aside>
      </section>
    </main>
  );
}
