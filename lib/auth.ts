import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const ACCESS_COOKIE_NAME = "cursor_rules_access";
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

type AccessPayload = {
  email: string;
  iat: number;
  exp: number;
};

function getAccessSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-dev-secret-change-me";
}

function signPayload(payload: string) {
  return createHmac("sha256", getAccessSecret()).update(payload).digest("base64url");
}

export function createAccessToken(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccessPayload = {
    email,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAccessToken(token?: string | null): AccessPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8")) as AccessPayload;
    const now = Math.floor(Date.now() / 1000);

    if (!payload.email || typeof payload.exp !== "number" || payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function setAccessCookie(
  response: NextResponse,
  email: string,
  token = createAccessToken(email)
) {
  response.cookies.set(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
    path: "/"
  });

  return token;
}

export function clearAccessCookie(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export function getTokenFromRequest(request: NextRequest) {
  return (
    request.cookies.get(ACCESS_COOKIE_NAME)?.value ||
    request.headers.get("x-access-token") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    null
  );
}
