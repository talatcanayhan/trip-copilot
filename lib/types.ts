export type Region =
  | "europe"
  | "asia"
  | "north-america"
  | "south-america"
  | "africa"
  | "oceania"
  | "middle-east"
  | "global";

export type NetworkTier = "5G" | "4G/LTE" | "3G";

export interface Destination {
  /** ISO 3166-1 alpha-2 code, lowercased. */
  code: string;
  name: string;
  flag: string;
  region: Region;
  /** Typical best network available to travelers. */
  network: NetworkTier;
  popular?: boolean;
}

export type PlanScope = Region;

export interface Plan {
  id: string;
  scope: PlanScope;
  scopeLabel: string;
  /** Number of GB, or "unlimited". */
  dataGB: number | "unlimited";
  validityDays: number;
  priceUSD: number;
}

export type Intensity = "light" | "balanced" | "heavy";

export interface ActivityDef {
  key: string;
  label: string;
  icon: string;
  /** Baseline MB/day for a "balanced" traveler doing this regularly. */
  mbPerDay: number;
  hint: string;
}

export interface TripInput {
  destinationCodes: string[];
  days: number;
  intensity: Intensity;
  activityKeys: string[];
  tethering: boolean;
}

export interface UsageLine {
  key: string;
  label: string;
  icon: string;
  mbPerDay: number;
}

export interface PlanPick {
  plan: Plan;
  reason: string;
  costPerDayUSD: number;
  /** GB of headroom over the recommended amount (or "unlimited"). */
  headroom: number | "unlimited";
  fitsComfortably: boolean;
}

export interface Recommendation {
  destinations: Destination[];
  days: number;
  scope: PlanScope;
  scopeLabel: string;
  estDailyGB: number;
  estTotalGB: number;
  /** Total GB we recommend buying, including a safety buffer. */
  recommendedGB: number;
  bufferPct: number;
  breakdown: UsageLine[];
  primary: PlanPick;
  alternatives: PlanPick[];
  notes: string[];
}
