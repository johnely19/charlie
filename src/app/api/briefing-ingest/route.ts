import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.OPENCLAW_WEBHOOK_SECRET || "";

  const auth = req.headers.get("authorization") || "";
  const headerExpected = `Bearer ${secret}`;

  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";

  const authorized = auth === headerExpected || token === secret;

  if (!authorized) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  console.log("briefing payload", JSON.stringify(payload).slice(0, 2000));

  return NextResponse.json({ ok: true, receivedAt: new Date().toISOString() });
}
