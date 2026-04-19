"use client";

import { useState } from "react";
import { GitFork, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type ForkRuleButtonProps = {
  slug: string;
  content: string;
};

export function ForkRuleButton({ slug, content }: ForkRuleButtonProps) {
  const [done, setDone] = useState(false);

  const handleFork = async () => {
    const stamped = `${content}\n\n# Fork Notes\n- Forked from: ${slug}\n- Customize this block for your project.`;
    await navigator.clipboard.writeText(stamped);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };

  return (
    <Button type="button" variant="secondary" onClick={handleFork}>
      {done ? <Check className="mr-2 h-4 w-4" /> : <GitFork className="mr-2 h-4 w-4" />}
      {done ? "Fork copied" : "Fork this rule"}
    </Button>
  );
}
