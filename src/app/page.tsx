async function getData() {
  const res = await fetch("https://charlie-sepia.vercel.app/api/briefing-ingest", {
    cache: "no-store",
  });
  if (!res.ok) return { items: [] };
  return res.json();
}

export default async function Home() {
  const data = await getData();
  const items = data.items || [];

  return (
    <main style={{ maxWidth: 1000, margin: "32px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>Charlie Briefings</h1>
      <p>{items.length} items</p>

      {items.length === 0 && <p>No briefings yet.</p>}

      {items.map((x: any, i: number) => (
        <pre key={x.id || i} style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, marginBottom: 12 }}>
{JSON.stringify(x, null, 2)}
        </pre>
      ))}
          </main>
  );
}