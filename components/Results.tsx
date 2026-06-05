"use client";

import type { PlanPick, Recommendation } from "@/lib/types";

interface Props {
  rec: Recommendation | null;
}

function dataLabel(dataGB: number | "unlimited"): string {
  return dataGB === "unlimited" ? "Unlimited" : `${dataGB} GB`;
}

export default function Results({ rec }: Props) {
  if (!rec) {
    return (
      <div className="card flex min-h-[20rem] flex-col items-center justify-center p-8 text-center">
        <div className="mb-3 text-4xl">🧭</div>
        <h3 className="font-display text-lg font-semibold text-slate-200">
          Build your trip to see a recommendation
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
          Pick at least one destination and one activity, and the Copilot will
          forecast your data and size the right eSIM plan.
        </p>
      </div>
    );
  }

  const maxLine = Math.max(...rec.breakdown.map((b) => b.mbPerDay), 1);

  return (
    <div className="space-y-4 fade-up">
      {/* Forecast card */}
      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-mint-300">
              Data forecast
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              {rec.destinations.map((d) => d.flag).join(" ")}{" "}
              <span className="text-slate-400">·</span> {rec.days} days
            </h2>
          </div>
          <span className="rounded-full bg-ink-800/80 px-2.5 py-1 text-[0.7rem] font-medium text-cyan-300 ring-1 ring-cyan-400/30">
            {rec.scopeLabel}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Per day" value={`${rec.estDailyGB}`} unit="GB" />
          <Stat label="Trip total" value={`${rec.estTotalGB}`} unit="GB" />
          <Stat
            label={`Buy (+${Math.round(rec.bufferPct * 100)}%)`}
            value={`${rec.recommendedGB}`}
            unit="GB"
            highlight
          />
        </div>

        {/* Usage breakdown */}
        <div className="mt-5 space-y-1.5">
          {rec.breakdown.map((b) => (
            <div key={b.key} className="flex items-center gap-2.5 text-xs">
              <span className="w-32 shrink-0 truncate text-slate-400">
                {b.icon} {b.label}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-800">
                <div
                  className="accent-gradient h-full rounded-full"
                  style={{ width: `${Math.max(4, (b.mbPerDay / maxLine) * 100)}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right tabular-nums text-slate-400">
                {b.mbPerDay} MB
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended plan */}
      <PrimaryPlan pick={rec.primary} />

      {/* Alternatives */}
      {rec.alternatives.length > 0 && (
        <div className="card p-5 sm:p-6">
          <div className="mb-3 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400">
            Other options
          </div>
          <div className="space-y-2.5">
            {rec.alternatives.map((a) => (
              <AltPlan key={a.plan.id} pick={a} />
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {rec.notes.length > 0 && (
        <div className="card p-5 sm:p-6">
          <div className="mb-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400">
            Good to know
          </div>
          <ul className="space-y-1.5">
            {rec.notes.map((n, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-mint-400">›</span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-3 text-center ${
        highlight
          ? "bg-mint-500/10 ring-1 ring-mint-400/40"
          : "bg-ink-800/50 ring-1 ring-ink-600/40"
      }`}
    >
      <div className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline justify-center gap-1">
        <span
          className={`font-display text-2xl font-bold tabular-nums ${
            highlight ? "accent-text" : "text-white"
          }`}
        >
          {value}
        </span>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

function PrimaryPlan({ pick }: { pick: PlanPick }) {
  const { plan } = pick;
  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <div className="accent-gradient absolute inset-x-0 top-0 h-1" />
      <div className="mb-3 flex items-center gap-2">
        <span className="accent-gradient rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink-950">
          ✦ Recommended
        </span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-display text-2xl font-bold text-white">
            {dataLabel(plan.dataGB)}
            <span className="ml-2 text-sm font-medium text-slate-400">
              {plan.scopeLabel}
            </span>
          </div>
          <div className="mt-0.5 text-sm text-slate-400">
            Valid {plan.validityDays} days · ~${pick.costPerDayUSD}/day
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-bold accent-text tabular-nums">
            ${plan.priceUSD}
          </div>
        </div>
      </div>
      <p className="mt-3 rounded-lg bg-ink-800/50 px-3.5 py-2.5 text-sm text-slate-300">
        {pick.reason}
      </p>
    </div>
  );
}

function AltPlan({ pick }: { pick: PlanPick }) {
  const { plan } = pick;
  return (
    <div className="flex items-center gap-3 rounded-lg bg-ink-800/40 px-3.5 py-2.5 ring-1 ring-ink-600/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-sm font-bold text-white">
            {dataLabel(plan.dataGB)}
          </span>
          <span className="text-xs text-slate-500">
            {plan.scopeLabel} · {plan.validityDays}d
          </span>
        </div>
        <p className="mt-0.5 truncate text-[0.72rem] text-slate-400" title={pick.reason}>
          {pick.reason}
        </p>
      </div>
      <div className="font-display text-base font-bold text-slate-200 tabular-nums">
        ${plan.priceUSD}
      </div>
    </div>
  );
}
