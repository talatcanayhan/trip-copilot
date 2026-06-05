import Groq from "groq-sdk";
import type { NextRequest } from "next/server";
import { formatTripContext, type ChatRequestBody } from "@/lib/chat";
import { fallbackAnswer } from "@/lib/fallback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.TRIP_COPILOT_MODEL || "llama-3.3-70b-versatile";

/**
 * System prompt for the concierge. Nothing trip-specific lives here — the
 * per-trip context is sent as the first conversation turn instead, so this
 * stays a stable, reusable instruction block.
 */
const SYSTEM_PROMPT = `You are the Trip Copilot — a friendly, sharp travel-connectivity concierge for an eSIM service that gives travelers fast, secure mobile data in 200+ destinations with no roaming fees and no physical SIM.

Your job: help the traveler understand and act on the data-plan recommendation they've been given for their specific trip. The trip details, a data forecast, and the recommended plan are provided in the first message of the conversation — treat those numbers as ground truth and reason from them.

Style:
- Warm, concise, and concrete. Lead with the answer. Short paragraphs; bullets when listing plans or steps.
- Always ground claims in the traveler's actual numbers (their GB forecast, their destinations, the plan prices given). Never invent prices or plans that aren't in the context.
- When they ask "how much data", reference the forecast and the recommended GB. When they ask about cost, quote the plan prices from the context.
- Mention practical, money-saving tips (e.g. download video on Wi-Fi) when relevant, but don't lecture.
- If something genuinely depends on info you don't have, say so briefly and ask one focused question.
- This is a demo product — never claim to place an order, charge a card, or access their account. You advise; the eSIM provider's app transacts.

Keep answers tight — usually 2-5 sentences or a short bulleted list. Respond with your final answer only; do not narrate your reasoning.`;

export async function POST(req: NextRequest): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const rec = body.recommendation ?? null;
  const apiKey = process.env.GROQ_API_KEY;
  const encoder = new TextEncoder();

  // ---- Offline mode: no key configured -> stream the heuristic answer. ----
  if (!apiKey) {
    const text = fallbackAnswer(messages, rec);
    return streamWords(text, encoder, "offline");
  }

  // ---- Live mode: stream from Groq (OpenAI-compatible chat completions). ----
  const groq = new Groq({ apiKey });
  const contextTurn = formatTripContext(rec);

  const chatMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Here is everything about my current trip and the plan you recommended. Use it to answer my follow-up questions.\n\n${contextTurn}`,
    },
    {
      role: "assistant",
      content:
        "Got it — I've reviewed your trip, your data forecast, and the recommended plan. Ask me anything about it.",
    },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const completion = await groq.chat.completions.create({
          model: MODEL,
          messages: chatMessages,
          max_tokens: 1024,
          temperature: 0.4,
          stream: true,
        });

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch {
        // Live call failed (bad key, rate limit, network) -> graceful fallback.
        const note =
          "⚠️ Live AI is unavailable right now, so here's the built-in guide:\n\n";
        controller.enqueue(encoder.encode(note + fallbackAnswer(messages, rec)));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Copilot-Mode": "live",
    },
  });
}

/** Stream a fixed string out word-by-word for a natural typing effect. */
function streamWords(
  text: string,
  encoder: TextEncoder,
  mode: string,
): Response {
  const tokens = text.match(/\S+\s*/g) ?? [text];
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const tok of tokens) {
        controller.enqueue(encoder.encode(tok));
        await new Promise((r) => setTimeout(r, 16));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Copilot-Mode": mode,
    },
  });
}
