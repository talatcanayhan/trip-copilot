# Trip Copilot

An AI travel-data concierge for eSIM travelers. Tell it
your trip — destinations, length, and what you do online — and it:

1. **Forecasts your data usage** with a transparent per-activity breakdown
2. **Recommends the right eSIM plan** (and shows cheaper / unlimited / global alternatives) with reasons
3. Gives you an **AI concierge** that knows *your* itinerary and answers connectivity questions in natural language

Built with **Next.js (App Router) · TypeScript · Tailwind CSS** — with the chat powered by **Groq** (Llama 3.3 70B), streamed token-by-token.

> Why this exists: own a customer problem end-to-end, with AI as the
> multiplier. This is that, in one screen.

---

## Quick start

```bash
cd trip-copilot
npm install
npm run dev
# open http://localhost:3000
```

The app is **fully functional with no API key** — the recommendation engine runs
locally and the concierge falls back to a built-in heuristic guide.

### Enable the live AI concierge (optional)

```bash
cp .env.example .env.local
# then add your key (free at https://console.groq.com/keys):
# GROQ_API_KEY=gsk_...
```

With a key set, the chat streams live answers from Groq. The badge in the chat
header shows **● Live AI** vs **○ Offline guide** so you can see which path is active.

---

## How it works

### 1. The recommendation engine (`lib/recommend.ts`)

Pure, deterministic TypeScript — no API call needed:

- **Usage model** — each activity has a baseline MB/day; scaled by an
  intensity multiplier (light/balanced/heavy) and a tethering uplift, summed
  into a daily and trip-total GB forecast, plus a 15% safety buffer.
- **Scope resolution** — single-region trips get that regional plan;
  multi-region trips get a single **Global** plan that covers all 200+ destinations.
- **Plan selection** — picks the cheapest plan that comfortably covers the
  forecast *and* whose validity covers the trip, then surfaces a tighter/cheaper
  option, an unlimited option, and (for single-region trips) a Global upsell —
  each with a one-line rationale.

### 2. The AI concierge (`app/api/chat/route.ts`)

- Streams from **Groq** (OpenAI-compatible chat completions) with
  `groq.chat.completions.create({ stream: true })`, forwarded to the browser as
  a `ReadableStream`.
- **Stable system prompt**: nothing trip-specific lives in it; the per-trip
  context is sent as the first conversation turn, keeping the instruction block
  reusable.
- **Graceful fallback**: if there's no API key — or the live call errors — it
  serves a keyword-routed heuristic answer built from the same recommendation
  data, so the demo never dead-ends.

---

## Project structure

```
trip-copilot/
├── app/
│   ├── api/chat/route.ts   # streaming Groq endpoint + offline fallback
│   ├── layout.tsx
│   ├── page.tsx            # state + 3-column layout
│   └── globals.css         # Tailwind v4 theme
├── components/
│   ├── TripPlanner.tsx     # destinations / days / intensity / activities
│   ├── Results.tsx         # forecast + recommended plan + alternatives
│   └── ChatAgent.tsx       # streaming chat UI
└── lib/
    ├── catalog.ts          # destinations, activities, generated plan catalog
    ├── recommend.ts        # the recommendation engine
    ├── chat.ts             # trip-context serialization for the model
    ├── fallback.ts         # offline heuristic concierge
    └── types.ts
```

## Tech

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · `groq-sdk`

## Notes

The destination list, network tiers, and plan pricing are realistic but
**illustrative** — this is a portfolio demo, not a live pricing integration.
