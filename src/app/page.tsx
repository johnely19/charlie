type Item = {
  id?: string;
  receivedAt?: string;
  payload?: {
    type?: string;
    source?: string;
    generatedAt?: string;
    content?: string;
    [k: string]: any;
  };
  [k: string]: any;
};

async function getData(): Promise<{ items: Item[] }> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://charlie-sepia.vercel.app";

  try {
    const res = await fetch(`${base}/api/briefing-ingest`, { cache: "no-store" });
    if (!res.ok) return { items: [] };
    return res.json();
  } catch {
    return { items: [] };
  }
}

function fmt(ts?: string) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString();
}

export default async function Home() {
  const data = await getData();
  const items = data.items || [];

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "28px auto",
        padding: "0 16px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 6 }}>Charlie Briefings</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>
        {items.length} item{items.length === 1 ? "" : "s"}
      </p>

      {items.length === 0 && <p>No briefings yet.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((item, i) => {
          const p = item.payload || {};
          return (
            <article
              key={item.id || String(i)}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 14,
                background: "#fff",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 8 }}>
                {p.type || "briefing"} • {p.source || "unknown"} • {fmt(p.generatedAt || item.receivedAt)}
              </div>

              <div style={{ fontSize: 16, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
                {p.content || "(no content)"}
              </div>

              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: "pointer", opacity: 0.75 }}>Show raw payload</summary>
                <pre
                  style={{
                    marginTop: 10,
                    background: "#111",
                    color: "#eee",
                    padding: 10,
                    borderRadius: 8,
                    overflowX: "auto",
                    fontSize: 12,
                  }}
                >
{JSON.stringify(item, null, 2)}
                </pre>
              </details>
            </article>
          );
        })}
      </div>
    </main>
  );
}
