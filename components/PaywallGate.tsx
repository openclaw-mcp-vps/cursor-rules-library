import Link from "next/link";
import { Lock } from "lucide-react";
import { PricingCheckout } from "@/components/PricingCheckout";

export function PaywallGate() {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-[#30363d] bg-[#11161d] p-8 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f2630] text-[#79c0ff]">
        <Lock className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-semibold text-[#e6edf3]">Library access requires a subscription</h1>
      <p className="mt-3 text-[#9fb3c8]">
        Unlock all 240 curated rules, weekly community additions, and one-click CLI installs for every project.
      </p>
      <div className="mt-6 flex items-center justify-center">
        <PricingCheckout />
      </div>
      <p className="mt-4 text-sm text-[#9fb3c8]">
        Already purchased? Return through your Lemon Squeezy success link, then this page unlocks automatically.
      </p>
      <Link href="/" className="mt-4 inline-block text-sm text-[#79c0ff] hover:text-[#a5d6ff]">
        See plan details and FAQ
      </Link>
    </section>
  );
}
