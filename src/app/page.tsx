type BriefingItem = {
  id?: string;
  receivedAt?: string;
  payload?: any;
  raw?: any;
};

async function getData(): Promise<{ items: BriefingItem[] }> {
  // Use absolute URL on server render
  const base =
    process.env.NEXT_PUBLIC_BASE_URL || "https://charlie-sepia.vercel.app";

  try {
      const res = await fetch(`${base}/api/briefing-ingest`, {
      cache: "no-store",
    });

    if (!res.ok) return { items: [] };

    const data = await res.json();
    return { items: data.items || [] };
  } catch {
    return { items: [] };
  }
}

export default async function Home() {
  const { items } = await getData();
    return (
    <main
      style={{
        maxWidth: 1000,
        margin: "32px auto",
        padding: "0 16px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Charlie Briefings</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>
        {items.length} item{items.length === 1 ? "" : "s"}
      </p>
            {items.length === 0 && (
        <p style={{ opacity: 0.8 }}>
          No briefings yet. Waiting for webhook ingest…
        </p>
      )}

      {items.map((x, i) => (
        <pre
          key={x.id || String(i)}
          style={{
            background: "#111",
            color: "#eee",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
                        overflowX: "auto",
            whiteSpace: "pre-wrap",
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >
{JSON.stringify(x.payload ?? x.raw ?? x, null, 2)}
        </pre>
      ))}
    </main>
  );
}