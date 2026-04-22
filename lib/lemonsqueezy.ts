import { createHmac, timingSafeEqual } from "node:crypto";

export type StripeWebhookEvent = {
  id?: string;
  type: string;
  data?: {
    object?: {
      id?: string;
      customer_email?: string;
      customer_details?: {
        email?: string;
      };
      payment_status?: string;
      metadata?: Record<string, string>;
    };
  };
};

function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function verifyStripeSignature(args: {
  payload: string;
  signatureHeader: string | null;
  secret: string;
  toleranceSeconds?: number;
}) {
  const { payload, signatureHeader, secret, toleranceSeconds = 300 } = args;

  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestampPart = parts.find((part) => part.startsWith("t="));
  const signatureParts = parts.filter((part) => part.startsWith("v1="));

  if (!timestampPart || signatureParts.length === 0) {
    return false;
  }

  const timestamp = Number(timestampPart.slice(2));
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");

  return signatureParts.some((part) => {
    const candidate = part.slice(3);
    return safeEqualHex(expected, candidate);
  });
}

export function extractPaidEmail(event: StripeWebhookEvent) {
  if (event.type !== "checkout.session.completed") {
    return null;
  }

  const object = event.data?.object;
  if (!object) {
    return null;
  }

  if (object.payment_status && object.payment_status !== "paid") {
    return null;
  }

  return object.customer_details?.email || object.customer_email || null;
}
