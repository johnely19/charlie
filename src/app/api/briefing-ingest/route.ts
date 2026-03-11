import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const KEY = "briefings";

function normalizePayload(input: any) {
  if (!input || typeof input !== "object") {
    return { raw: input ?? null };
  }

  return {
    type: input.type ?? "unknown",
    source: input.source ?? "unknown",
      generatedAt: input.generatedAt ?? null,
    content: input.content ?? null,
    meta: input.meta ?? {},
    raw: input,
  };
}

function authOk(req: NextRequest) {
  const secret = process.env.OPENCLAW_WEBHOOK_SECRET || "";
  if (!secret) return false;

  const auth = req.headers.get("authorization") || "";
  const token = new URL(req.url).searchParams.get("token") || "";

  return auth === `Bearer ${secret}` || token === secret;
}

export async function POST(req: NextRequest) {
  try {
    if (!authOk(req)) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    // Tolerant parsing: supports empty/non-json bodies
    let body: any = null;
    try {
      const text = await req.text();
          body = text ? JSON.parse(text) : {};
    } catch {
      body = { raw: "non-json-or-empty" };
    }

    const payload = normalizePayload(body);

    const item = {
      id: crypto.randomUUID(),
      receivedAt: new Date().toISOString(),
      payload,
    };

    // Save newest first
    await kv.lpush(KEY, JSON.stringify(item));
        // Keep latest 200 only
    await kv.ltrim(KEY, 0, 199);

    return NextResponse.json({ ok: true, id: item.id });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "ingest_failed", detail: err?.message || "unknown" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const rows = ((await kv.lrange(KEY, 0, 49)) || []) as string[];
        const items = rows.map((r) => {
      try {
        return JSON.parse(r);
      } catch {
        return { id: "parse-error", receivedAt: null, payload: { raw: r } };
      }
    });

    return NextResponse.json({
      ok: true,
      count: items.length,
      items,
    });
  } catch (err: any) {
        return NextResponse.json(
      { ok: false, error: "read_failed", detail: err?.message || "unknown" },
      { status: 500 }
    );
  }
}