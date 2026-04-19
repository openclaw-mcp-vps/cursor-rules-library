import { NextRequest } from "next/server";
import { upsertPurchase } from "@/lib/database";
import { verifyLemonSignature } from "@/lib/lemonsqueezy";
import type { PurchaseRecord } from "@/types/rule";

function parsePayload(payload: unknown): PurchaseRecord | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const source = payload as {
    meta?: { event_name?: string };
    data?: {
      id?: string;
      attributes?: {
        status?: string;
        user_email?: string;
        customer_email?: string;
        product_id?: number;
        variant_id?: number;
        order_id?: number;
      };
    };
  };

  const eventName = source.meta?.event_name ?? "unknown";
  const attrs = source.data?.attributes ?? {};

  const rawOrderId =
    attrs.order_id ??
    (typeof source.data?.id === "string" || typeof source.data?.id === "number"
      ? source.data.id
      : undefined);

  if (!rawOrderId) {
    return null;
  }

  const normalizedStatus =
    attrs.status === "paid" || eventName.includes("order_created") || eventName.includes("subscription_payment_success")
      ? "paid"
      : eventName.includes("refund") || attrs.status === "refunded"
        ? "refunded"
        : "pending";

  const now = new Date().toISOString();

  return {
    orderId: String(rawOrderId),
    customerEmail: attrs.user_email ?? attrs.customer_email ?? "",
    status: normalizedStatus,
    productId: attrs.product_id ? String(attrs.product_id) : undefined,
    variantId: attrs.variant_id ? String(attrs.variant_id) : undefined,
    createdAt: now,
    updatedAt: now,
    sourceEvent: eventName,
  };
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-signature");
  const bodyText = await request.text();

  if (!verifyLemonSignature(bodyText, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const purchaseRecord = parsePayload(payload);

  if (!purchaseRecord) {
    return Response.json({ ok: true, skipped: true });
  }

  await upsertPurchase(purchaseRecord);

  return Response.json({ ok: true });
}
