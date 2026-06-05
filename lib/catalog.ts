import type {
  ActivityDef,
  Destination,
  Plan,
  Region,
} from "./types";

/**
 * A representative slice of an eSIM provider's 200+ destinations. Network tiers and
 * regions are realistic but illustrative — this is a demo catalog, not a
 * live price feed.
 */
export const DESTINATIONS: Destination[] = [
  { code: "fr", name: "France", flag: "🇫🇷", region: "europe", network: "5G", popular: true },
  { code: "it", name: "Italy", flag: "🇮🇹", region: "europe", network: "5G", popular: true },
  { code: "es", name: "Spain", flag: "🇪🇸", region: "europe", network: "5G", popular: true },
  { code: "de", name: "Germany", flag: "🇩🇪", region: "europe", network: "5G" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧", region: "europe", network: "5G", popular: true },
  { code: "pt", name: "Portugal", flag: "🇵🇹", region: "europe", network: "5G" },
  { code: "gr", name: "Greece", flag: "🇬🇷", region: "europe", network: "4G/LTE" },
  { code: "ch", name: "Switzerland", flag: "🇨🇭", region: "europe", network: "5G" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱", region: "europe", network: "5G" },

  { code: "jp", name: "Japan", flag: "🇯🇵", region: "asia", network: "5G", popular: true },
  { code: "th", name: "Thailand", flag: "🇹🇭", region: "asia", network: "5G", popular: true },
  { code: "sg", name: "Singapore", flag: "🇸🇬", region: "asia", network: "5G" },
  { code: "kr", name: "South Korea", flag: "🇰🇷", region: "asia", network: "5G" },
  { code: "id", name: "Indonesia", flag: "🇮🇩", region: "asia", network: "4G/LTE", popular: true },
  { code: "vn", name: "Vietnam", flag: "🇻🇳", region: "asia", network: "4G/LTE" },
  { code: "in", name: "India", flag: "🇮🇳", region: "asia", network: "4G/LTE" },

  { code: "us", name: "United States", flag: "🇺🇸", region: "north-america", network: "5G", popular: true },
  { code: "ca", name: "Canada", flag: "🇨🇦", region: "north-america", network: "5G" },
  { code: "mx", name: "Mexico", flag: "🇲🇽", region: "north-america", network: "4G/LTE", popular: true },

  { code: "br", name: "Brazil", flag: "🇧🇷", region: "south-america", network: "4G/LTE" },
  { code: "ar", name: "Argentina", flag: "🇦🇷", region: "south-america", network: "4G/LTE" },
  { code: "pe", name: "Peru", flag: "🇵🇪", region: "south-america", network: "4G/LTE" },
  { code: "cl", name: "Chile", flag: "🇨🇱", region: "south-america", network: "4G/LTE" },

  { code: "za", name: "South Africa", flag: "🇿🇦", region: "africa", network: "4G/LTE" },
  { code: "ma", name: "Morocco", flag: "🇲🇦", region: "africa", network: "4G/LTE" },
  { code: "eg", name: "Egypt", flag: "🇪🇬", region: "africa", network: "4G/LTE" },
  { code: "ke", name: "Kenya", flag: "🇰🇪", region: "africa", network: "4G/LTE" },

  { code: "ae", name: "United Arab Emirates", flag: "🇦🇪", region: "middle-east", network: "5G", popular: true },
  { code: "tr", name: "Turkey", flag: "🇹🇷", region: "middle-east", network: "4G/LTE", popular: true },
  { code: "il", name: "Israel", flag: "🇮🇱", region: "middle-east", network: "5G" },
  { code: "sa", name: "Saudi Arabia", flag: "🇸🇦", region: "middle-east", network: "5G" },

  { code: "au", name: "Australia", flag: "🇦🇺", region: "oceania", network: "5G", popular: true },
  { code: "nz", name: "New Zealand", flag: "🇳🇿", region: "oceania", network: "4G/LTE" },
];

export const DESTINATION_BY_CODE: Record<string, Destination> = Object.fromEntries(
  DESTINATIONS.map((d) => [d.code, d]),
);

export const REGION_LABELS: Record<Region, string> = {
  europe: "Europe",
  asia: "Asia",
  "north-america": "North America",
  "south-america": "South America",
  africa: "Africa",
  oceania: "Oceania",
  "middle-east": "Middle East",
  global: "Global (200+ destinations)",
};

export const ACTIVITIES: ActivityDef[] = [
  { key: "maps", label: "Maps & navigation", icon: "🗺️", mbPerDay: 60, hint: "Turn-by-turn directions, offline-light" },
  { key: "social", label: "Social media", icon: "📱", mbPerDay: 320, hint: "Scrolling, stories, posting photos" },
  { key: "messaging", label: "Messaging & email", icon: "✉️", mbPerDay: 90, hint: "WhatsApp, iMessage, inbox" },
  { key: "browsing", label: "Web & search", icon: "🔎", mbPerDay: 160, hint: "Bookings, reviews, general browsing" },
  { key: "music", label: "Music streaming", icon: "🎧", mbPerDay: 130, hint: "Spotify / Apple Music on the go" },
  { key: "video", label: "Video streaming", icon: "🎬", mbPerDay: 1400, hint: "Netflix / YouTube — the big one" },
  { key: "calls", label: "Video calls", icon: "📹", mbPerDay: 520, hint: "FaceTime, Zoom, Google Meet" },
  { key: "work", label: "Remote work", icon: "💼", mbPerDay: 280, hint: "Docs, Slack, cloud sync, VPN" },
  { key: "photos", label: "Photo / cloud backup", icon: "☁️", mbPerDay: 240, hint: "Auto-uploading your camera roll" },
];

export const ACTIVITY_BY_KEY: Record<string, ActivityDef> = Object.fromEntries(
  ACTIVITIES.map((a) => [a.key, a]),
);

/** Relative pricing factor per region (Europe = baseline). */
const REGION_PRICE_FACTOR: Record<Region, number> = {
  europe: 1.0,
  asia: 1.12,
  "north-america": 1.22,
  "south-america": 1.32,
  africa: 1.5,
  oceania: 1.38,
  "middle-east": 1.28,
  global: 1.85,
};

interface TierDef {
  dataGB: number | "unlimited";
  validityDays: number;
}

const TIERS: TierDef[] = [
  { dataGB: 1, validityDays: 7 },
  { dataGB: 3, validityDays: 30 },
  { dataGB: 5, validityDays: 30 },
  { dataGB: 10, validityDays: 30 },
  { dataGB: 20, validityDays: 30 },
  { dataGB: "unlimited", validityDays: 30 },
];

/** End a price on .99 for that storefront feel. */
function toStorePrice(raw: number): number {
  return Math.max(2.99, Math.round(raw) - 0.01);
}

function tierPrice(tier: TierDef, factor: number): number {
  if (tier.dataGB === "unlimited") {
    // Anchor unlimited a bit above the 20GB tier.
    const twentyGb = 1.5 + Math.pow(20, 0.78) * 1.15;
    return toStorePrice(twentyGb * factor * 1.55);
  }
  const base = 1.5 + Math.pow(tier.dataGB, 0.78) * 1.15;
  // Short 7-day passes carry a small convenience premium per GB.
  const validityAdj = tier.validityDays <= 7 ? 1.25 : 1;
  return toStorePrice(base * factor * validityAdj);
}

function buildRegionPlans(region: Region): Plan[] {
  const factor = REGION_PRICE_FACTOR[region];
  return TIERS.map((tier) => ({
    id: `${region}-${tier.dataGB}gb-${tier.validityDays}d`,
    scope: region,
    scopeLabel: REGION_LABELS[region],
    dataGB: tier.dataGB,
    validityDays: tier.validityDays,
    priceUSD: tierPrice(tier, factor),
  }));
}

/** Full plan catalog, keyed by scope. Global plans cover every destination. */
export const PLANS_BY_SCOPE: Record<Region, Plan[]> = {
  europe: buildRegionPlans("europe"),
  asia: buildRegionPlans("asia"),
  "north-america": buildRegionPlans("north-america"),
  "south-america": buildRegionPlans("south-america"),
  africa: buildRegionPlans("africa"),
  oceania: buildRegionPlans("oceania"),
  "middle-east": buildRegionPlans("middle-east"),
  global: buildRegionPlans("global"),
};
