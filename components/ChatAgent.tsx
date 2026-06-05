"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/chat";
import type { Recommendation } from "@/lib/types";

interface Props {
  rec: Recommendation | null;
}

const SUGGESTIONS = [
  "How much data do I really need?",
  "What's the cheapest option that still works?",
  "Will this handle daily video calls?",
  "How do I set up the eSIM?",
];

export default function ChatAgent({ rec }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [mode, setMode] = useState<"live" | "offline" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamText]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setStreamText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, recommendation: rec }),
      });

      const headerMode = res.headers.get("X-Copilot-Mode");
      if (headerMode === "live" || headerMode === "offline") setMode(headerMode);

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreamText(acc);
      }

      setMessages([...next, { role: "assistant", content: acc }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Sorry — I couldn't reach the concierge just now. Please try again.",
        },
      ]);
    } finally {
      setStreaming(false);
      setStreamText("");
    }
  }

  const empty = messages.length === 0 && !streaming;

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-600/40 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="accent-gradient flex h-8 w-8 items-center justify-center rounded-lg text-ink-950">
            <span className="text-base">✦</span>
          </div>
          <div>
            <div className="font-display text-sm font-bold text-white">
              Trip Copilot
            </div>
            <div className="text-[0.68rem] text-slate-500">
              Ask anything about your connectivity
            </div>
          </div>
        </div>
        {mode && (
          <span
            className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ring-1 ${
              mode === "live"
                ? "bg-mint-500/15 text-mint-300 ring-mint-400/30"
                : "bg-ink-800 text-slate-400 ring-ink-600/50"
            }`}
            title={
              mode === "live"
                ? "Streaming live from Groq (Llama 3.3 70B)"
                : "Built-in heuristic guide (no API key set)"
            }
          >
            {mode === "live" ? "● Live AI" : "○ Offline guide"}
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="scroll-soft flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {empty && (
          <div className="flex h-full flex-col justify-center">
            <p className="mb-3 text-center text-sm text-slate-500">
              {rec
                ? "Your plan's ready — ask me to explain or compare it."
                : "Build a trip on the left, then ask me about it."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={streaming}
                  className="rounded-full bg-ink-800/70 px-3 py-1.5 text-xs text-slate-300 ring-1 ring-ink-600/50 transition hover:bg-ink-700/70 hover:text-white disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} />
        ))}

        {streaming && (
          <Bubble role="assistant" content={streamText} streaming />
        )}
      </div>

      {/* Input */}
      <div className="border-t border-ink-600/40 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask about data, cost, coverage, setup…"
            className="scroll-soft max-h-28 flex-1 resize-none rounded-lg border border-ink-600/60 bg-ink-900/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-mint-400/60 focus:ring-2 focus:ring-mint-400/20"
          />
          <button
            onClick={() => send(input)}
            disabled={streaming || !input.trim()}
            className="accent-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send"
          >
            <span className="text-lg">↑</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  role,
  content,
  streaming,
}: {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex fade-up ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-cyan-500/15 text-cyan-50 ring-1 ring-cyan-400/25"
            : "rounded-bl-sm bg-ink-800/70 text-slate-200 ring-1 ring-ink-600/40"
        }`}
      >
        {content}
        {streaming && content.length === 0 ? (
          <span className="inline-flex gap-1 align-middle">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-mint-400" />
            <span
              className="typing-dot h-1.5 w-1.5 rounded-full bg-mint-400"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="typing-dot h-1.5 w-1.5 rounded-full bg-mint-400"
              style={{ animationDelay: "0.3s" }}
            />
          </span>
        ) : null}
        {streaming && content.length > 0 ? (
          <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-mint-400 align-middle" />
        ) : null}
      </div>
    </div>
  );
}
