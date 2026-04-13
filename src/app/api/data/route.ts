import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WEBHOOK_URL =
  "https://oriamram.app.n8n.cloud/webhook/5ca654b3-c5c6-4bd0-835d-c8ff441b21b0";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CACHE_FILE = path.join(
  process.env.VERCEL ? "/tmp" : process.cwd(),
  "cache.json"
);

interface CacheFile {
  fetchedAt: number;
  data: unknown;
}

function readCache(): CacheFile | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as CacheFile;
  } catch {
    return null;
  }
}

function writeCache(data: unknown) {
  const cache: CacheFile = { fetchedAt: Date.now(), data };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), "utf-8");
}

export async function GET() {
  const cache = readCache();

  // Return cached data if less than 24 hours old
  if (cache && Date.now() - cache.fetchedAt < ONE_DAY_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(WEBHOOK_URL, { cache: "no-store" });
    if (!res.ok) {
      if (cache) return NextResponse.json(cache.data);
      return NextResponse.json(
        { error: `Webhook returned ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    writeCache(data);
    return NextResponse.json(data);
  } catch (e) {
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Fetch failed" },
      { status: 502 }
    );
  }
}
