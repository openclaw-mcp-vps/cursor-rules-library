import { Lock, ScrollText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RulePreviewProps = {
  framework: string;
  content: string;
  locked?: boolean;
};

export function RulePreview({ framework, content, locked = false }: RulePreviewProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">{framework} Rule</CardTitle>
          {locked ? <Badge variant="premium">Upgrade to unlock</Badge> : <Badge>Full rule</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <pre className="max-h-[420px] overflow-auto rounded-lg border border-[#273246] bg-[#050b18] p-4 text-sm leading-6 text-[#dbeafe]">
            {content}
          </pre>
          {locked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-[linear-gradient(to_bottom,rgba(5,11,24,0.15),rgba(5,11,24,0.92))]">
              <Lock className="h-6 w-6 text-[#f59e0b]" />
              <p className="max-w-xs text-center text-sm text-[#f3f4f6]">
                This framework is part of the subscriber catalog. Checkout, verify your purchase, and install instantly.
              </p>
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
          <ScrollText className="h-4 w-4" />
          Keeps output consistent across contributors and agents.
        </div>
      </CardContent>
    </Card>
  );
}
