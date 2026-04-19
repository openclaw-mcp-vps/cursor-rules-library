"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InstallButtonProps = {
  slug: string;
  className?: string;
};

export function InstallButton({ slug, className }: InstallButtonProps) {
  const [copied, setCopied] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const pair = document.cookie
      .split("; ")
      .find((value) => value.startsWith("crl_order_id="));
    if (pair) {
      setOrderId(decodeURIComponent(pair.split("=")[1] ?? ""));
    }
  }, []);

  const command = useMemo(() => {
    if (typeof window === "undefined") {
      return `npx cursor-rules-install install ${slug}`;
    }

    const base = `npx cursor-rules-install install ${slug} --base-url ${window.location.origin}`;
    if (!orderId) {
      return base;
    }

    return `${base} --order-id ${orderId}`;
  }, [orderId, slug]);

  const downloadHref = useMemo(() => {
    const params = new URLSearchParams({ slug, format: "raw" });
    if (orderId) {
      params.set("order_id", orderId);
    }
    return `/api/rules?${params.toString()}`;
  }, [orderId, slug]);

  const onCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row", className)}>
      <Button type="button" onClick={onCopy} className="w-full sm:w-auto">
        <Copy className="mr-2 h-4 w-4" />
        {copied ? "Command copied" : "Copy install command"}
      </Button>
      <a
        href={downloadHref}
        className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#30363d] bg-[#11161d] px-4 text-sm font-medium text-[#e6edf3] transition-colors hover:bg-[#161b22] sm:w-auto"
      >
        <Download className="mr-2 h-4 w-4" />
        Download .cursorrules
      </a>
    </div>
  );
}
