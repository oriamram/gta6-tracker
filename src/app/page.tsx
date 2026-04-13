"use client";

import { useEffect, useState } from "react";
import { GameData } from "./data";
import Countdown from "./Countdown";

export default function Home() {
  const [data, setData] = useState<GameData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        const res = await fetch("/api/data");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // Validate that the response contains actual game data
        const item = Array.isArray(json) ? json[0] : json;
        if (!item?.title || !item?.dates) {
          throw new Error("Webhook did not return game data. Check n8n workflow responds with data.");
        }
        if (active) {
          setData(item);
          setLastFetched(new Date());
          setError(null);
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to fetch");
      }
    }

    fetchData();
    return () => { active = false; };
  }, []);

  if (error && !data) {
    return (
      <main className="min-h-screen bg-[#0c0c0e] flex items-center justify-center">
        <p className="text-red-400">Failed to load data: {error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#0c0c0e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#ff6b4a] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm tracking-widest uppercase">Loading</p>
        </div>
      </main>
    );
  }

  const currentDate = data.dates.find((d) => d.type === "current")!;
  const previousDate = data.dates.find((d) => d.type === "previous");

  return (
    <main className="min-h-screen bg-[#0c0c0e] relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,107,74,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(180,80,255,0.05)_0%,transparent_50%)]" />

      <div className="relative z-10 min-h-screen lg:h-screen flex flex-col px-4 sm:px-8 lg:px-16 py-4 sm:py-6">
        {/* Header */}
        <header className="flex items-center justify-between shrink-0">
          <span className="text-xl sm:text-2xl font-black tracking-wider text-white/90">VI</span>
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs tracking-[0.15em] text-emerald-400 uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Live
            </span>
            <span className="text-[10px] sm:text-xs tracking-[0.2em] text-white/40 uppercase">
              Release Tracker
            </span>
          </div>
        </header>

        {/* Main content grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 lg:gap-10 mt-4 sm:mt-6 min-h-0">
          {/* Left: Hero section */}
          <div className="flex flex-col justify-center min-h-0 items-center lg:items-start text-center lg:text-left">
            {/* Title */}
            <h1 className="text-xl sm:text-xl font-light tracking-[0.15em] text-white/60 uppercase">
              {data.developer}
            </h1>
            <h2 className="text-5xl sm:text-5xl lg:text-7xl font-black uppercase leading-[0.95] mt-2 sm:mt-2 glow-text text-transparent bg-clip-text bg-gradient-to-b from-[#ff6b4a] via-[#ff8c5a] to-[#ffb347]">
              Grand Theft
              <br />
              Auto VI
            </h2>

            {/* Release date */}
            <div className="mt-4 sm:mt-6">
              <p className="text-xs sm:text-xs tracking-[0.3em] text-white/40 uppercase mb-1">
                Release Date
              </p>
              <p className="text-3xl sm:text-3xl lg:text-4xl font-black text-white">
                {currentDate.date}
              </p>
              <div className="flex items-center gap-3 mt-1.5 justify-center lg:justify-start">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {Math.round(currentDate.confidence * 100)}% confidence
                </span>
                <span className="text-xs text-white/30">
                  {currentDate.sourceCount} sources
                </span>
              </div>
            </div>

            {/* Countdown */}
            <div className="mt-4 sm:mt-6">
              <Countdown targetDate="2026-11-19T00:00:00" />
            </div>

            {/* Platforms */}
            <div className="flex gap-4 mt-4 sm:mt-6 justify-center lg:justify-start">
              {data.platforms.map((p) => (
                <div
                  key={p.name}
                  className={`text-xs sm:text-sm px-3 py-1.5 rounded border ${
                    p.confirmed
                      ? "border-white/20 text-white/80"
                      : "border-white/10 text-white/30"
                  }`}
                >
                  {p.name}
                  {!p.confirmed && (
                    <span className="ml-1.5 text-[10px] text-yellow-500/70">TBD</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar: panels */}
          <div className="flex flex-col gap-3 lg:w-80 min-h-0 overflow-y-auto pb-4">
            {/* Timeline */}
            <Panel title="Timeline">
              <div className="space-y-2">
                {data.timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          i === data.timeline.length - 1
                            ? "bg-[#ff6b4a]"
                            : "bg-white/20"
                        }`}
                      />
                      {i < data.timeline.length - 1 && (
                        <div className="w-px h-4 bg-white/10 mt-1" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-white/40">{t.date}</p>
                      <p className="text-xs sm:text-sm text-white/80">{t.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Previous date */}
            {previousDate && (
              <Panel title="Previous Release Date">
                <p className="text-sm text-white/50 line-through">{previousDate.date}</p>
                <p className="text-[10px] text-white/30 mt-0.5">Delayed → {currentDate.date}</p>
              </Panel>
            )}

            {/* Predictions - dynamic */}
            {data.predictions.length > 0 && (
              <Panel title={`Predictions (${data.predictions.length})`}>
                <div className="space-y-3">
                  {data.predictions.map((prediction, i) => (
                    <div key={i} className={i > 0 ? "pt-3 border-t border-white/5" : ""}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white/80 pr-2">{prediction.title}</p>
                        <span
                          className={`text-lg font-black shrink-0 ${
                            prediction.probability > 0.5 ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {Math.round(prediction.probability * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            prediction.probability > 0.5
                              ? "bg-gradient-to-r from-red-500 to-red-400"
                              : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          }`}
                          style={{ width: `${prediction.probability * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-white/30 mt-1">
                        Updated {new Date(prediction.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* Sources */}
            <Panel title={`Sources (${data.totalSourcesAnalyzed})`}>
              <div className="flex flex-wrap gap-1.5">
                {currentDate.sources.slice(0, 5).map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                      s.isOfficial
                        ? "border-[#ff6b4a]/40 text-[#ff6b4a] hover:bg-[#ff6b4a]/10"
                        : "border-white/10 text-white/40 hover:bg-white/5"
                    }`}
                  >
                    {s.name}
                  </a>
                ))}
                {currentDate.sources.length > 5 && (
                  <span className="text-[10px] px-2 py-1 text-white/30">
                    +{currentDate.sources.length - 5} more
                  </span>
                )}
              </div>
            </Panel>
          </div>
        </div>

        {/* Footer */}
        <footer className="shrink-0 flex items-center justify-between text-[10px] text-white/20 pt-2 border-t border-white/5">
          <span>Data for informational purposes only</span>
          <span>
            {lastFetched
              ? `Last fetched: ${lastFetched.toLocaleTimeString()}`
              : `Last updated: ${data.lastUpdated}`}
          </span>
        </footer>
      </div>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 sm:p-4 backdrop-blur-sm">
      <h3 className="text-[10px] tracking-[0.25em] text-white/40 uppercase mb-2">{title}</h3>
      {children}
    </div>
  );
}
