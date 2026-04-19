import crypto from "node:crypto";
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

export function verifyLemonSignature(rawBody: string, signatureHeader: string | null) {
  if (!webhookSecret || !signatureHeader) {
    return false;
  }

  const digest = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const digestBuffer = Buffer.from(digest);
  const signatureBuffer = Buffer.from(signatureHeader);
  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
}

export function initializeLemonSdk() {
  lemonSqueezySetup({
    apiKey: process.env.LEMON_SQUEEZY_API_KEY ?? "",
    onError: () => undefined,
  });
}

export function getLemonCheckoutUrl() {
  const rawProduct = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;

  if (!rawProduct) {
    return null;
  }

  if (rawProduct.startsWith("http")) {
    return rawProduct;
  }

  return `https://checkout.lemonsqueezy.com/buy/${rawProduct}?embed=1`;
}
