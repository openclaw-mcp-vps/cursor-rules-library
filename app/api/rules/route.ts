import Fuse from "fuse.js";
import { NextRequest } from "next/server";
import { getPurchaseByOrderId, getRuleBySlug, getRules } from "@/lib/database";

async function hasPaidAccess(request: NextRequest) {
  const hasCookie = request.cookies.get("crl_access")?.value === "1";
  if (hasCookie) {
    return true;
  }

  const orderId = request.nextUrl.searchParams.get("order_id");
  if (!orderId) {
    return false;
  }

  const purchase = await getPurchaseByOrderId(orderId);
  return Boolean(purchase && purchase.status === "paid");
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const framework = url.searchParams.get("framework");
  const query = url.searchParams.get("q") ?? "";
  const limit = Number(url.searchParams.get("limit") ?? "200");
  const format = url.searchParams.get("format");
  const canAccess = await hasPaidAccess(request);

  if (slug) {
    const rule = await getRuleBySlug(slug);
    if (!rule) {
      return Response.json({ error: "Rule not found" }, { status: 404 });
    }

    if (!canAccess && format === "raw") {
      return Response.json(
        { error: "Subscription required for full rule downloads" },
        { status: 403 }
      );
    }

    if (format === "raw") {
      return new Response(rule.content, {
        status: 200,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "content-disposition": `attachment; filename=\"${rule.slug}.cursorrules\"`,
          "cache-control": "public, max-age=600",
        },
      });
    }

    if (!canAccess) {
      const preview = rule.content.split("\n").slice(0, 14).join("\n");
      return Response.json({
        rule: { ...rule, content: preview },
        previewOnly: true,
      });
    }

    return Response.json({ rule, previewOnly: false });
  }

  let rules = await getRules();

  if (framework && framework !== "all") {
    rules = rules.filter((rule) => rule.framework === framework);
  }

  if (query.trim()) {
    const fuse = new Fuse(rules, {
      threshold: 0.32,
      keys: ["name", "framework", "description", "tags"],
    });
    rules = fuse.search(query.trim()).map((result) => result.item);
  }

  if (!canAccess) {
    rules = rules.filter((rule) => rule.featured || rule.weeklyNew).slice(0, 18);
  }

  return Response.json({
    total: rules.length,
    rules: rules.slice(0, Number.isFinite(limit) ? limit : 200),
    locked: !canAccess,
  });
}
