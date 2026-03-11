import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.OPENCLAW_WEBHOOK_SECRET || "";

  const auth = req.headers.get("authorization") || "";
  const token = new URL(req.url).searchParams.get("token") || "";

  const okAuth = auth === `Bearer ${secret}` || token === secret;
  if (!okAuth) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: any = null;
  try {
    const text = await req.text();
    payload = text ? JSON.parse(text) : { raw: "" };
  } catch {
    payload = { raw: "non-json-or-empty" };
  }

  console.log("briefing payload:", payload);

  return NextResponse.json({ ok: true, receivedAt: new Date().toISOString() });
}
