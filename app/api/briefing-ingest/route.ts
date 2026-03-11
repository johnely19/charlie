import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.OPENCLAW_WEBHOOK_SECRET}`;

  if (auth !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  console.log("briefing payload", JSON.stringify(payload).slice(0, 2000));

  return NextResponse.json({ ok: true, receivedAt: new Date().toISOString() });
}
