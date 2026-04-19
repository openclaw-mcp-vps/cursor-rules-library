import { NextRequest, NextResponse } from "next/server";
import { getPurchaseByOrderId } from "@/lib/database";

const ACCESS_COOKIE = "crl_access";

function setAccessCookie(response: NextResponse, orderId: string) {
  response.cookies.set(ACCESS_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 31,
  });

  response.cookies.set("crl_order_id", orderId, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 31,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing order_id query parameter" },
      { status: 400 }
    );
  }

  const purchase = await getPurchaseByOrderId(orderId);

  if (!purchase || purchase.status !== "paid") {
    return NextResponse.json(
      { error: "Order not found or not paid yet" },
      { status: 403 }
    );
  }

  const redirectUrl = new URL("/browse", request.url);
  const response = NextResponse.redirect(redirectUrl);
  return setAccessCookie(response, orderId);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { orderId?: string };

  if (!body.orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const purchase = await getPurchaseByOrderId(body.orderId);
  if (!purchase || purchase.status !== "paid") {
    return NextResponse.json({ error: "Order invalid" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  return setAccessCookie(response, body.orderId);
}
