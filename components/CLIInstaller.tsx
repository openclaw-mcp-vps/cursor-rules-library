"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCopy, TerminalSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CLIInstallerProps = {
  slug: string;
  accessToken?: string | null;
};

export function CLIInstaller({ slug, accessToken }: CLIInstallerProps) {
  const [copied, setCopied] = useState(false);

  const command = useMemo(() => {
    const base =
      typeof window === "undefined"
        ? "https://cursor-rules-library.com"
        : window.location.origin;

    const parts = [
      "npx",
      "cursor-rules-library",
      "install",
      slug,
      "--api",
      base
    ];

    if (accessToken) {
      parts.push("--access-token", accessToken);
    }

    return parts.join(" ");
  }, [accessToken, slug]);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TerminalSquare className="h-5 w-5 text-[var(--accent)]" />
          One-Command Install
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="overflow-x-auto rounded-md border border-[#273246] bg-[#050b18] p-3 text-sm text-[#c7d2fe]">
          {command}
        </pre>
        <Button onClick={copyCommand} variant="secondary" className="w-full">
          {copied ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCopy className="mr-2 h-4 w-4" />}
          {copied ? "Copied" : "Copy command"}
        </Button>
      </CardContent>
    </Card>
  );
}
