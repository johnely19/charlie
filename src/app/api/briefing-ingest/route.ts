import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "briefings";

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
  const item = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    payload,
  };

  await redis.lpush(KEY, JSON.stringify(item));
  await redis.ltrim(KEY, 0, 199);

  return NextResponse.json({ ok: true, id: item.id });
}

export async function GET() {
  const rows = (await redis.lrange<string[]>(KEY, 0, 49)) || [];
  const items = rows.map((r: string) => {
    try { return JSON.parse(r); } catch { return { raw: r }; }
  });
  return NextResponse.json({ ok: true, count: items.length, items });
}