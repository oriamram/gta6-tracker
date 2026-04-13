"use client";

import { useEffect, useState } from "react";

function getTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState(getTimeLeft(new Date(targetDate)));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(new Date(targetDate))), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: "DAYS", value: time.days },
    { label: "HRS", value: time.hours },
    { label: "MIN", value: time.minutes },
    { label: "SEC", value: time.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-5">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <span className="text-3xl sm:text-5xl lg:text-6xl font-black tabular-nums tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#ff6b4a] to-[#ffb347]">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs tracking-[0.3em] text-white/50 mt-1">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
