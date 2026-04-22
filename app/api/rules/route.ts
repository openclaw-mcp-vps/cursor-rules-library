import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getTokenFromRequest, verifyAccessToken } from "@/lib/auth";
import {
  createRulePreview,
  findRuleBySlug,
  getFrameworks,
  getRuleStats,
  searchRules
} from "@/lib/database";

const querySchema = z.object({
  slug: z.string().min(1).optional(),
  q: z.string().optional(),
  framework: z.string().optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
  format: z.enum(["json", "raw"]).optional()
});

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query parameters" }, { status: 400 });
  }

  const token = getTokenFromRequest(request);
  const session = verifyAccessToken(token);
  const authenticated = Boolean(session);

  const { slug, q, framework, limit, format } = parsed.data;

  if (slug) {
    const rule = await findRuleBySlug(slug);

    if (!rule) {
      return NextResponse.json({ message: "Rule not found" }, { status: 404 });
    }

    if (rule.isPremium && !authenticated) {
      return NextResponse.json(
        {
          message: "Premium rule. Subscribe to install this framework.",
          authenticated,
          rule: {
            ...rule,
            content: createRulePreview(rule.content, 12),
            locked: true
          }
        },
        { status: 402 }
      );
    }

    if (format === "raw") {
      return new NextResponse(rule.content, {
        status: 200,
        headers: {
          "content-type": "text/plain; charset=utf-8"
        }
      });
    }

    return NextResponse.json({ authenticated, rule: { ...rule, locked: false } });
  }

  const rules = await searchRules({
    query: q,
    framework,
    includePremium: true,
    limit
  });

  const frameworks = await getFrameworks();
  const stats = await getRuleStats();

  return NextResponse.json({
    authenticated,
    frameworks,
    stats,
    total: rules.length,
    rules: rules.map((rule) => {
      const locked = rule.isPremium && !authenticated;
      return {
        ...rule,
        content: locked ? createRulePreview(rule.content, 8) : rule.content,
        locked
      };
    })
  });
}
