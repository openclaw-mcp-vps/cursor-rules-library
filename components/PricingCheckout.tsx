"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    LemonSqueezy?: {
      Url?: {
        Open: (url: string) => void;
      };
    };
  }
}

type PricingCheckoutProps = {
  className?: string;
};

export function PricingCheckout({ className }: PricingCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const checkoutUrl = useMemo(() => {
    const productOrUrl = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
    if (!productOrUrl) {
      return "";
    }

    if (productOrUrl.startsWith("http")) {
      return productOrUrl;
    }

    return `https://checkout.lemonsqueezy.com/buy/${productOrUrl}?embed=1`;
  }, []);

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-lemonsqueezy='checkout']"
    );
    if (existing) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.lemonsqueezy.com/js/lemon.js";
    script.async = true;
    script.defer = true;
    script.dataset.lemonsqueezy = "checkout";
    document.body.appendChild(script);
  }, []);

  const openCheckout = () => {
    if (!checkoutUrl) {
      return;
    }

    setLoading(true);
    const maybeOpen = window.LemonSqueezy?.Url?.Open;
    if (maybeOpen) {
      maybeOpen(checkoutUrl);
      setLoading(false);
      return;
    }

    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    setLoading(false);
  };

  return (
    <Button
      type="button"
      onClick={openCheckout}
      size="lg"
      className={className}
      disabled={!checkoutUrl || loading}
    >
      {loading ? "Opening checkout..." : "Start 7-day trial for $7/mo"}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
