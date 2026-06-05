"use client";

import { useMemo, useState } from "react";
import ChatAgent from "@/components/ChatAgent";
import Results from "@/components/Results";
import TripPlanner from "@/components/TripPlanner";
import { recommend } from "@/lib/recommend";
import type { Intensity } from "@/lib/types";

export default function Home() {
  // Sensible starting trip so the page is alive on first load.
  const [selectedCodes, setSelectedCodes] = useState<string[]>(["jp", "th"]);
  const [days, setDays] = useState(10);
  const [intensity, setIntensity] = useState<Intensity>("balanced");
  const [activityKeys, setActivityKeys] = useState<string[]>([
    "maps",
    "social",
    "messaging",
    "browsing",
  ]);
  const [tethering, setTethering] = useState(false);

  const rec = useMemo(
    () =>
      recommend({
        destinationCodes: selectedCodes,
        days,
        intensity,
        activityKeys,
        tethering,
      }),
    [selectedCodes, days, intensity, activityKeys, tethering],
  );

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <div className="accent-gradient flex h-9 w-9 items-center justify-center rounded-xl text-ink-950 shadow-lg shadow-mint-500/20">
              <span className="text-lg font-bold">T</span>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Trip <span className="accent-text">Copilot</span>
            </span>
          </div>
          <h1 className="max-w-2xl font-display text-2xl font-bold leading-tight text-white sm:text-[1.75rem]">
            Tell it your trip. Get the right eSIM plan — and an AI concierge that
            actually knows your itinerary.
          </h1>
        </div>
        <div className="hidden shrink-0 text-right text-xs text-slate-500 sm:block">
          <div>200+ destinations · no roaming fees</div>
          <div className="mt-0.5">Next.js · TypeScript · Groq</div>
        </div>
      </header>

      {/* Layout: planner | results | chat */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <TripPlanner
            selectedCodes={selectedCodes}
            days={days}
            intensity={intensity}
            activityKeys={activityKeys}
            tethering={tethering}
            onToggleDestination={(c) => setSelectedCodes((p) => toggle(p, c))}
            onDaysChange={setDays}
            onIntensityChange={setIntensity}
            onToggleActivity={(k) => setActivityKeys((p) => toggle(p, k))}
            onTetheringChange={setTethering}
          />
        </div>

        <div className="lg:col-span-4">
          <Results rec={rec} />
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <ChatAgent rec={rec} />
        </div>
      </div>

      <footer className="mt-10 border-t border-ink-700/40 pt-5 text-center text-xs text-slate-600">
        Demo project · plan catalog & network tiers are illustrative. The
        concierge streams from Groq when{" "}
        <code className="rounded bg-ink-800 px-1.5 py-0.5 text-slate-400">
          GROQ_API_KEY
        </code>{" "}
        is set, with a built-in offline guide otherwise.
      </footer>
    </main>
  );
}
