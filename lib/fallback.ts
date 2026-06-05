import type { ChatMessage } from "./chat";
import type { Recommendation } from "./types";

/**
 * A heuristic stand-in for the live Claude concierge, used when no
 * ANTHROPIC_API_KEY is configured. It reads the latest question, matches
 * intent keywords, and answers from the live recommendation data so the
 * demo is always useful — no key required.
 */
export function fallbackAnswer(
  messages: ChatMessage[],
  rec: Recommendation | null,
): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const q = (last?.content ?? "").toLowerCase();

  if (!rec) {
    return "Pick a few destinations and what you'll do online over on the left, and I'll forecast your data and recommend the right eSIM plan. Then ask me anything about it.";
  }

  const primary = rec.primary.plan;
  const primaryData =
    primary.dataGB === "unlimited" ? "Unlimited data" : `${primary.dataGB} GB`;
  const destNames = rec.destinations.map((d) => d.name).join(", ");

  const match = (...words: string[]) => words.some((w) => q.includes(w));

  // How much data / how many GB
  if (match("how much", "how many gb", "enough", "run out", "data do i need")) {
    return `For ${rec.days} days across ${destNames}, I forecast about ${rec.estDailyGB} GB/day — roughly ${rec.estTotalGB} GB total. With a ${Math.round(
      rec.bufferPct * 100,
    )}% safety buffer that's ~${rec.recommendedGB} GB to buy. The ${primaryData} ${primary.scopeLabel} plan covers that comfortably. If you'll lean on hotel Wi-Fi for video, you could size down a tier.`;
  }

  // Cost / price / cheaper
  if (match("cost", "price", "cheap", "expensive", "budget", "save", "$")) {
    const altLines = rec.alternatives
      .map((a) => {
        const d = a.plan.dataGB === "unlimited" ? "Unlimited" : `${a.plan.dataGB} GB`;
        return `• ${d} — $${a.plan.priceUSD}`;
      })
      .join("\n");
    return `The recommended ${primaryData} plan is $${primary.priceUSD} (about $${rec.primary.costPerDayUSD}/day over your trip). Other options:\n${altLines}\nUnlimited is the move if you'd rather not watch the meter.`;
  }

  // Hotspot / tethering / laptop
  if (match("hotspot", "tether", "laptop", "work", "share")) {
    return `Yes — these eSIMs support hotspot/tethering, so you can share data to a laptop or a travel buddy's phone. ${
      rec.breakdown.some((b) => b.key === "work")
        ? "I've already factored remote-work usage into your forecast."
        : "Heavy tethering uses more, so consider one tier up if a laptop will be online all day."
    }`;
  }

  // Coverage / network / speed / 5G
  if (match("coverage", "network", "speed", "5g", "4g", "fast", "slow", "work in")) {
    const tiers = rec.destinations
      .map((d) => `${d.name}: ${d.network}`)
      .join(", ");
    return `Network you can expect: ${tiers}. The eSIM connects to local partner networks automatically, so you get the best available signal in each place without changing anything.`;
  }

  // Install / setup / esim / how to
  if (match("install", "set up", "set it up", "setup", "activate", "esim", "qr", "get started", "how do i start")) {
    return `Setup is quick: buy the plan in the provider's app, scan the eSIM QR (or tap install), and toggle it on when you land. Keep your home SIM for calls/texts and use the travel eSIM for data. Install before you fly — you'll be online the moment you land.`;
  }

  // Multiple countries / one plan
  if (match("multiple", "countries", "switch", "border", "both", "all of them")) {
    return `One eSIM covers your whole route (${destNames}) — no swapping at borders. ${
      rec.scope === "global"
        ? "Since your trip spans regions, I picked a Global plan so it just works everywhere."
        : `A single ${rec.scopeLabel} plan covers all of them.`
    }`;
  }

  // Default: summarize the recommendation
  return `Here's the short version for ${destNames} over ${rec.days} days: expect ~${rec.estTotalGB} GB total, so I'd get the ${primaryData} ${primary.scopeLabel} plan for $${primary.priceUSD}. ${rec.primary.reason} Ask me about cost, coverage, hotspot use, or setup and I'll go deeper.`;
}
