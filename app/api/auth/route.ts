import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  clearAccessCookie,
  createAccessToken,
  getTokenFromRequest,
  setAccessCookie,
  verifyAccessToken
} from "@/lib/auth";
import { hasPaidEmail } from "@/lib/database";

const verifySchema = z.object({
  email: z.string().email(),
  action: z.enum(["verify-purchase", "logout"]).optional()
});

const logoutSchema = z.object({
  action: z.literal("logout")
});

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const session = verifyAccessToken(token);

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
    expiresAt: session.exp
  });
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const logoutResult = logoutSchema.safeParse(payload);
  if (logoutResult.success) {
    const response = NextResponse.json({ authenticated: false });
    clearAccessCookie(response);
    return response;
  }

  const result = verifySchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json(
      {
        message: "Submit a valid checkout email to unlock access."
      },
      { status: 400 }
    );
  }

  const { email } = result.data;
  const hasAccess = await hasPaidEmail(email);

  if (!hasAccess) {
    return NextResponse.json(
      {
        message:
          "No purchase found for that email yet. Stripe webhooks can take a few seconds; try again shortly."
      },
      { status: 401 }
    );
  }

  const normalizedEmail = email.toLowerCase();
  const token = createAccessToken(normalizedEmail);

  const response = NextResponse.json({
    authenticated: true,
    email: normalizedEmail,
    accessToken: token
  });
  setAccessCookie(response, normalizedEmail, token);
  response.headers.set("x-access-token", token);
  return response;
}
