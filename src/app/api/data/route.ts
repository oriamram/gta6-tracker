import { NextResponse } from "next/server";

const WEBHOOK_URL =
  "https://oriamram.app.n8n.cloud/webhook/5ca654b3-c5c6-4bd0-835d-c8ff441b21b0";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

let cache: { data: unknown; fetchedAt: number } | null = null;

export async function GET() {
  // Return cached data if less than 24 hours old
  if (cache && Date.now() - cache.fetchedAt < ONE_DAY_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(WEBHOOK_URL, { cache: "no-store" });
    if (!res.ok) {
      // If fetch fails but we have stale cache, return it
      if (cache) return NextResponse.json(cache.data);
      return NextResponse.json(
        { error: `Webhook returned ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    cache = { data, fetchedAt: Date.now() };
    return NextResponse.json(data);
  } catch (e) {
    // Return stale cache on error
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Fetch failed" },
      { status: 502 }
    );
  }
}
