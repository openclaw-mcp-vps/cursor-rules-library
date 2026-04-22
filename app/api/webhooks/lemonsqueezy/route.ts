import { NextRequest, NextResponse } from "next/server";

import { recordPaidEmail } from "@/lib/database";
import { extractPaidEmail, verifyStripeSignature, type StripeWebhookEvent } from "@/lib/lemonsqueezy";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "POST Stripe webhook events here to unlock paid user access."
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await request.text();

  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        message: "STRIPE_WEBHOOK_SECRET is not configured."
      },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  const valid = verifyStripeSignature({
    payload,
    signatureHeader: signature,
    secret
  });

  if (!valid) {
    return NextResponse.json({ ok: false, message: "Invalid Stripe signature." }, { status: 400 });
  }

  let event: StripeWebhookEvent;

  try {
    event = JSON.parse(payload) as StripeWebhookEvent;
  } catch {
    return NextResponse.json({ ok: false, message: "Malformed event payload." }, { status: 400 });
  }

  const email = extractPaidEmail(event);

  if (!email) {
    return NextResponse.json({ ok: true, ignored: true, eventType: event.type });
  }

  await recordPaidEmail({
    email,
    source: "stripe-webhook",
    checkoutSessionId: event.data?.object?.id
  });

  return NextResponse.json({
    ok: true,
    eventType: event.type,
    unlockedEmail: email.toLowerCase()
  });
}
