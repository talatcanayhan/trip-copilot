import {
  ACTIVITY_BY_KEY,
  DESTINATION_BY_CODE,
  PLANS_BY_SCOPE,
  REGION_LABELS,
} from "./catalog";
import type {
  Destination,
  Intensity,
  Plan,
  PlanPick,
  Recommendation,
  Region,
  TripInput,
  UsageLine,
} from "./types";

const INTENSITY_MULTIPLIER: Record<Intensity, number> = {
  light: 0.65,
  balanced: 1.0,
  heavy: 1.55,
};

const TETHERING_MULTIPLIER = 1.4;
const BUFFER_PCT = 0.15;

function uniqueRegions(destinations: Destination[]): Region[] {
  return [...new Set(destinations.map((d) => d.region))];
}

/**
 * Decide which plan scope to recommend:
 * - all destinations in one region  -> that regional plan
 * - destinations spanning regions    -> a single Global plan
 */
function resolveScope(destinations: Destination[]): {
  scope: Region;
  scopeLabel: string;
  multiRegion: boolean;
} {
  const regions = uniqueRegions(destinations);
  if (regions.length === 1) {
    return {
      scope: regions[0],
      scopeLabel: REGION_LABELS[regions[0]],
      multiRegion: false,
    };
  }
  return { scope: "global", scopeLabel: REGION_LABELS.global, multiRegion: true };
}

function buildBreakdown(trip: TripInput): { lines: UsageLine[]; dailyMb: number } {
  const mult = INTENSITY_MULTIPLIER[trip.intensity];
  const tether = trip.tethering ? TETHERING_MULTIPLIER : 1;
  const lines: UsageLine[] = trip.activityKeys
    .map((key) => ACTIVITY_BY_KEY[key])
    .filter(Boolean)
    .map((a) => ({
      key: a.key,
      label: a.label,
      icon: a.icon,
      mbPerDay: Math.round(a.mbPerDay * mult * tether),
    }));
  const dailyMb = lines.reduce((sum, l) => sum + l.mbPerDay, 0);
  return { lines, dailyMb };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function planGb(plan: Plan): number {
  return plan.dataGB === "unlimited" ? Infinity : plan.dataGB;
}

function describePick(plan: Plan, recommendedGB: number, days: number): PlanPick {
  const gb = planGb(plan);
  const headroom: number | "unlimited" =
    plan.dataGB === "unlimited" ? "unlimited" : round1(gb - recommendedGB);
  return {
    plan,
    reason: "",
    costPerDayUSD: round1(plan.priceUSD / Math.min(days, plan.validityDays || days)),
    headroom,
    fitsComfortably: gb >= recommendedGB,
  };
}

/** Core entry point: turn a trip into a data forecast + plan recommendation. */
export function recommend(trip: TripInput): Recommendation | null {
  const destinations = trip.destinationCodes
    .map((c) => DESTINATION_BY_CODE[c])
    .filter(Boolean);

  if (destinations.length === 0 || trip.days < 1 || trip.activityKeys.length === 0) {
    return null;
  }

  const { scope, scopeLabel, multiRegion } = resolveScope(destinations);
  const { lines, dailyMb } = buildBreakdown(trip);

  const estDailyGB = round1(dailyMb / 1024);
  const estTotalGB = round1((dailyMb * trip.days) / 1024);
  const recommendedGB = Math.max(1, round1(estTotalGB * (1 + BUFFER_PCT)));

  const plans = [...PLANS_BY_SCOPE[scope]].sort((a, b) => planGb(a) - planGb(b));

  // Primary: cheapest plan that comfortably covers the recommended amount,
  // and whose validity covers the trip length.
  const covering = plans.filter(
    (p) => planGb(p) >= recommendedGB && p.validityDays >= trip.days,
  );
  const primaryPlan =
    covering.sort((a, b) => a.priceUSD - b.priceUSD)[0] ??
    plans[plans.length - 1]; // fall back to the largest (unlimited)

  const primary = describePick(primaryPlan, recommendedGB, trip.days);
  primary.reason = primary.fitsComfortably
    ? `Covers your ~${estTotalGB} GB forecast with ${
        primary.headroom === "unlimited" ? "no cap" : `${primary.headroom} GB`
      } to spare across ${trip.days} day${trip.days > 1 ? "s" : ""}.`
    : `The largest single ${scopeLabel} pass — best fit for your usage.`;

  const alternatives: PlanPick[] = [];

  // 1) A cheaper, tighter option (one tier below primary) — flag the risk.
  const primaryIdx = plans.findIndex((p) => p.id === primaryPlan.id);
  const cheaper = plans
    .slice(0, primaryIdx)
    .filter((p) => p.validityDays >= trip.days)
    .pop();
  if (cheaper) {
    const pick = describePick(cheaper, recommendedGB, trip.days);
    const shortBy = round1(recommendedGB - planGb(cheaper));
    pick.reason =
      `Save $${round1(primaryPlan.priceUSD - cheaper.priceUSD)} if you stay lean — ` +
      `but it's ~${shortBy} GB under forecast, so trim video or back up photos on Wi-Fi.`;
    alternatives.push(pick);
  }

  // 2) The unlimited peace-of-mind option (if primary wasn't already unlimited).
  if (primaryPlan.dataGB !== "unlimited") {
    const unlimited = plans.find((p) => p.dataGB === "unlimited");
    if (unlimited) {
      const pick = describePick(unlimited, recommendedGB, trip.days);
      pick.reason = `Never think about data again — flat $${unlimited.priceUSD} for the whole trip.`;
      alternatives.push(pick);
    }
  }

  // 3) If the trip spans one region, surface Global as a flexibility upsell.
  if (!multiRegion && scope !== "global") {
    const globalPlans = [...PLANS_BY_SCOPE.global].sort((a, b) => planGb(a) - planGb(b));
    const globalCovering = globalPlans
      .filter((p) => planGb(p) >= recommendedGB && p.validityDays >= trip.days)
      .sort((a, b) => a.priceUSD - b.priceUSD)[0];
    if (globalCovering) {
      const pick = describePick(globalCovering, recommendedGB, trip.days);
      pick.reason = `Add-on regions later? A Global pass works across all 200+ destinations.`;
      alternatives.push(pick);
    }
  }

  const notes = buildNotes(trip, destinations, estDailyGB, scope);

  return {
    destinations,
    days: trip.days,
    scope,
    scopeLabel,
    estDailyGB,
    estTotalGB,
    recommendedGB,
    bufferPct: BUFFER_PCT,
    breakdown: lines,
    primary,
    alternatives,
    notes,
  };
}

function buildNotes(
  trip: TripInput,
  destinations: Destination[],
  estDailyGB: number,
  scope: Region,
): string[] {
  const notes: string[] = [];

  if (destinations.length > 1) {
    notes.push(
      `${destinations.length} destinations on one eSIM — no swapping SIMs at each border.`,
    );
  }

  const slow = destinations.filter((d) => d.network === "3G");
  const lte = destinations.filter((d) => d.network === "4G/LTE");
  if (slow.length) {
    notes.push(
      `${slow.map((d) => d.name).join(", ")} may top out at 3G — expect slower video.`,
    );
  } else if (lte.length && lte.length === destinations.length) {
    notes.push(`Coverage is 4G/LTE across your route — solid for everything but heavy 4K video.`);
  }

  if (trip.activityKeys.includes("video") && trip.intensity !== "light") {
    notes.push(`Video streaming is your biggest line item — downloading shows on hotel Wi-Fi saves the most.`);
  }

  if (trip.tethering) {
    notes.push(`Hotspot/tethering is factored in at +40% — plenty for a laptop on the side.`);
  }

  if (scope === "global") {
    notes.push(`A single Global plan keeps one number active across regions for the whole trip.`);
  }

  if (estDailyGB < 0.4) {
    notes.push(`You're a light user (~${Math.round(estDailyGB * 1024)} MB/day) — a small pass goes a long way.`);
  }

  return notes;
}
