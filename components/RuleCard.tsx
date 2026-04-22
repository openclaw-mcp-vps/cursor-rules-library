import Link from "next/link";
import { Download, LockKeyhole, Terminal } from "lucide-react";

import type { Rule } from "@/lib/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type RuleCardProps = {
  rule: Rule;
  locked?: boolean;
  active?: boolean;
};

export function RuleCard({ rule, locked = false, active = false }: RuleCardProps) {
  return (
    <Card className={active ? "border-[#4fd1c5]" : ""}>
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{rule.framework}</CardTitle>
            <p className="mt-1 text-sm text-[var(--muted)]">{rule.summary}</p>
          </div>
          {rule.isPremium ? <Badge variant="premium">Premium</Badge> : <Badge variant="success">Free</Badge>}
        </div>
        <div className="flex flex-wrap gap-2">
          {rule.tags.slice(0, 3).map((tag) => (
            <Badge variant="secondary" key={`${rule.slug}-${tag}`}>
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-[var(--muted)]">
        <p>{rule.whenToUse}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {rule.downloads.toLocaleString()} installs
          </span>
          <span>Updated {new Date(rule.updatedAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/browse?slug=${rule.slug}`}>
            <Terminal className="mr-2 h-4 w-4" />
            Preview
          </Link>
        </Button>
        {locked ? (
          <Button variant="outline" size="sm" className="cursor-default" disabled>
            <LockKeyhole className="mr-2 h-4 w-4" />
            Locked
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href={`/browse?slug=${rule.slug}`}>Install</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
