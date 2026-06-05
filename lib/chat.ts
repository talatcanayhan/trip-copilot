import type { Recommendation } from "./types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  recommendation: Recommendation | null;
}

/**
 * A compact, human-readable snapshot of the current trip + recommendation.
 * Sent as the opening turn of the conversation (NOT in the system prompt),
 * keeping the system instruction block stable and reusable.
 */
export function formatTripContext(rec: Recommendation | null): string {
  if (!rec) {
    return "The traveler has not configured a trip yet. Encourage them to pick destinations and activities on the left, then help once a recommendation exists.";
  }

  const dests = rec.destinations
    .map((d) => `${d.name} (${d.network})`)
    .join(", ");
  const breakdown = rec.breakdown
    .map((b) => `${b.label}: ~${b.mbPerDay} MB/day`)
    .join("; ");
  const primary = rec.primary.plan;
  const primaryData =
    primary.dataGB === "unlimited" ? "Unlimited" : `${primary.dataGB} GB`;
  const alts = rec.alternatives
    .map((a) => {
      const data = a.plan.dataGB === "unlimited" ? "Unlimited" : `${a.plan.dataGB} GB`;
      return `${data} ${a.plan.scopeLabel} / ${a.plan.validityDays}d — $${a.plan.priceUSD} (${a.reason})`;
    })
    .join("\n  - ");

  return [
    "=== CURRENT TRIP ===",
    `Destinations: ${dests}`,
    `Trip length: ${rec.days} days`,
    `Recommended plan scope: ${rec.scopeLabel}`,
    "",
    "=== DATA FORECAST ===",
    `Estimated usage: ~${rec.estDailyGB} GB/day, ~${rec.estTotalGB} GB total`,
    `Recommended to buy (incl. ${Math.round(rec.bufferPct * 100)}% buffer): ${rec.recommendedGB} GB`,
    `Per-activity: ${breakdown}`,
    "",
    "=== RECOMMENDED PLAN ===",
    `Primary: ${primaryData} ${primary.scopeLabel} / ${primary.validityDays}d — $${primary.priceUSD}`,
    `Why: ${rec.primary.reason}`,
    "Alternatives:",
    `  - ${alts}`,
    "",
    "=== NOTES ===",
    ...rec.notes.map((n) => `- ${n}`),
  ].join("\n");
}
