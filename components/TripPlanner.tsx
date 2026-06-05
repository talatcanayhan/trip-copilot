"use client";

import { useMemo, useState } from "react";
import { ACTIVITIES, DESTINATIONS, REGION_LABELS } from "@/lib/catalog";
import type { Intensity, Region } from "@/lib/types";

interface Props {
  selectedCodes: string[];
  days: number;
  intensity: Intensity;
  activityKeys: string[];
  tethering: boolean;
  onToggleDestination: (code: string) => void;
  onDaysChange: (days: number) => void;
  onIntensityChange: (i: Intensity) => void;
  onToggleActivity: (key: string) => void;
  onTetheringChange: (v: boolean) => void;
}

const INTENSITIES: { key: Intensity; label: string; sub: string }[] = [
  { key: "light", label: "Light", sub: "Maps & chat" },
  { key: "balanced", label: "Balanced", sub: "Typical day" },
  { key: "heavy", label: "Heavy", sub: "Always online" },
];

export default function TripPlanner(props: Props) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = DESTINATIONS.filter((d) =>
      q ? d.name.toLowerCase().includes(q) : true,
    );
    const byRegion = new Map<Region, typeof DESTINATIONS>();
    for (const d of filtered) {
      const arr = byRegion.get(d.region) ?? [];
      arr.push(d);
      byRegion.set(d.region, arr);
    }
    return [...byRegion.entries()];
  }, [query]);

  return (
    <div className="card p-5 sm:p-6">
      <SectionLabel step={1} title="Where are you going?" />

      {/* Selected chips */}
      {props.selectedCodes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {props.selectedCodes.map((code) => {
            const d = DESTINATIONS.find((x) => x.code === code)!;
            return (
              <button
                key={code}
                onClick={() => props.onToggleDestination(code)}
                className="group flex items-center gap-1 rounded-full bg-mint-500/15 px-2.5 py-1 text-xs font-medium text-mint-300 ring-1 ring-mint-400/30 transition hover:bg-mint-500/25"
              >
                <span>{d.flag}</span>
                {d.name}
                <span className="text-mint-300/60 group-hover:text-mint-300">✕</span>
              </button>
            );
          })}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search 200+ destinations…"
        className="mb-3 w-full rounded-lg border border-ink-600/60 bg-ink-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-mint-400/60 focus:ring-2 focus:ring-mint-400/20"
      />

      <div className="scroll-soft max-h-56 overflow-y-auto pr-1">
        {grouped.map(([region, dests]) => (
          <div key={region} className="mb-3">
            <div className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">
              {REGION_LABELS[region]}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dests.map((d) => {
                const active = props.selectedCodes.includes(d.code);
                return (
                  <button
                    key={d.code}
                    onClick={() => props.onToggleDestination(d.code)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-mint-500/20 text-mint-200 ring-1 ring-mint-400/50"
                        : "bg-ink-800/60 text-slate-300 ring-1 ring-ink-600/50 hover:bg-ink-700/60 hover:text-white"
                    }`}
                  >
                    <span>{d.flag}</span>
                    {d.name}
                    {d.popular && !active && (
                      <span className="ml-0.5 text-[0.6rem] text-cyan-400/80">★</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-500">
            No destinations match “{query}”.
          </p>
        )}
      </div>

      {/* Trip length */}
      <div className="mt-6">
        <SectionLabel step={2} title="How long is the trip?" />
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={60}
            value={props.days}
            onChange={(e) => props.onDaysChange(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-ink-700 accent-mint-400"
          />
          <div className="flex items-baseline gap-1 tabular-nums">
            <span className="font-display text-2xl font-bold text-white">
              {props.days}
            </span>
            <span className="text-sm text-slate-400">
              day{props.days > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Intensity */}
      <div className="mt-6">
        <SectionLabel step={3} title="How heavy a user are you?" />
        <div className="grid grid-cols-3 gap-2">
          {INTENSITIES.map((opt) => {
            const active = props.intensity === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => props.onIntensityChange(opt.key)}
                className={`rounded-lg px-2 py-2.5 text-center transition ${
                  active
                    ? "accent-gradient text-ink-950 shadow-lg shadow-mint-500/20"
                    : "bg-ink-800/60 text-slate-300 ring-1 ring-ink-600/50 hover:bg-ink-700/60"
                }`}
              >
                <div className="text-sm font-semibold">{opt.label}</div>
                <div
                  className={`text-[0.65rem] ${active ? "text-ink-900/70" : "text-slate-500"}`}
                >
                  {opt.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activities */}
      <div className="mt-6">
        <SectionLabel step={4} title="What will you do online?" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ACTIVITIES.map((a) => {
            const active = props.activityKeys.includes(a.key);
            return (
              <button
                key={a.key}
                onClick={() => props.onToggleActivity(a.key)}
                title={a.hint}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${
                  active
                    ? "bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-400/50"
                    : "bg-ink-800/60 text-slate-300 ring-1 ring-ink-600/50 hover:bg-ink-700/60"
                }`}
              >
                <span className="text-base">{a.icon}</span>
                <span className="leading-tight">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tethering */}
      <div className="mt-6 flex items-center justify-between rounded-lg bg-ink-800/50 px-3.5 py-3 ring-1 ring-ink-600/40">
        <div>
          <div className="text-sm font-medium text-slate-200">
            📡 Hotspot / tethering
          </div>
          <div className="text-[0.7rem] text-slate-500">
            Sharing data to a laptop or another phone
          </div>
        </div>
        <button
          role="switch"
          aria-checked={props.tethering}
          onClick={() => props.onTetheringChange(!props.tethering)}
          className={`relative h-6 w-11 rounded-full transition ${
            props.tethering ? "accent-gradient" : "bg-ink-600"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
              props.tethering ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-700 text-[0.65rem] font-bold text-mint-300 ring-1 ring-mint-400/30">
        {step}
      </span>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
    </div>
  );
}
