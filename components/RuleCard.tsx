import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Rule } from "@/types/rule";

type RuleCardProps = {
  rule: Rule;
  locked?: boolean;
};

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RuleCard({ rule, locked = false }: RuleCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge>{rule.framework}</Badge>
          {rule.weeklyNew ? <Badge variant="success">New this week</Badge> : null}
        </div>
        <CardTitle>{rule.name}</CardTitle>
        <CardDescription>{rule.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        {rule.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="accent">
            {tag}
          </Badge>
        ))}
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between text-sm text-[#9fb3c8]">
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-4 w-4" />
          Updated {formatDate(rule.updatedAt)}
        </span>
        <Link
          href={`/rule/${rule.slug}`}
          className="inline-flex items-center gap-1 font-medium text-[#79c0ff] transition hover:text-[#a5d6ff]"
        >
          {locked ? "Preview" : "Open"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
