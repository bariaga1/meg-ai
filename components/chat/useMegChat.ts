"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: Role;
  text: string;
};

export const STARTERS = [
  "What did Omega do at Medallia?",
  "Summarize the Can I Park Here? project",
  "Which skills show up across roles?",
  "How can I contact Omega?",
];

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type StreamEvent = {
  type?: string;
  index?: number;
  data?: {
    text?: string;
    delta?: string;
    result?: string;
  };
  text?: string;
  sessionId?: string;
  continuationToken?: string;
  mode?: string;
};

function extractAssistantDelta(ev: StreamEvent): string | null {
  if (ev.type === "message.appended") {
    return ev.data?.delta ?? ev.data?.text ?? ev.text ?? null;
  }
  if (ev.type === "message.completed") {
    return null;
  }
  return null;
}

function isTurnDone(ev: StreamEvent): boolean {
  return ev.type === "turn.completed" || ev.type === "turn.failed";
}

export function useMegChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [continuationToken, setContinuationToken] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [localMode, setLocalMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const hasThread = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const placeholder = useMemo(
    () => (hasThread ? "Ask a follow-up…" : "Ask Meg about Omega’s work…"),
    [hasThread],
  );

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setError(null);
    setBusy(true);
    const userMsg: ChatMessage = { id: uid(), role: "user", text: trimmed };
    const assistantId = uid();
    setMessages((m) => [...m, userMsg, { id: assistantId, role: "assistant", text: "" }]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          sessionId: sessionId ?? undefined,
          continuationToken: continuationToken ?? undefined,
          startIndex,
        }),
      });

      if (!res.ok || !res.body) {
        const json = (await res.json().catch(() => null)) as {
          message?: string;
          error?: string;
        } | null;
        throw new Error(json?.message || json?.error || `Chat failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let latestIndex = startIndex;
      let sawAssistant = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let ev: StreamEvent;
          try {
            ev = JSON.parse(line) as StreamEvent;
          } catch {
            continue;
          }

          if (ev.type === "session" && ev.sessionId && ev.continuationToken) {
            setSessionId(ev.sessionId);
            setContinuationToken(ev.continuationToken);
            if (ev.mode === "local" || ev.sessionId.startsWith("local_")) {
              setLocalMode(true);
            }
            continue;
          }

          if (typeof ev.index === "number") {
            latestIndex = Math.max(latestIndex, ev.index + 1);
          }

          const delta = extractAssistantDelta(ev);
          if (delta) {
            sawAssistant = true;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, text: `${m.text}${delta}` } : m,
              ),
            );
          }

          if (ev.type === "message.completed" && ev.data?.text) {
            sawAssistant = true;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId && !m.text ? { ...m, text: ev.data!.text! } : m,
              ),
            );
          }

          if (ev.type === "turn.failed") {
            throw new Error(ev.data?.result || "Meg could not finish that turn.");
          }

          if (isTurnDone(ev)) {
            await reader.cancel();
            break;
          }
        }
      }

      setStartIndex(latestIndex);
      if (!sawAssistant) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && !m.text
              ? {
                  ...m,
                  text: "I could not stream a reply. Is the Agent SDK server running?",
                }
              : m,
          ),
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && !m.text
            ? { ...m, text: `I hit a snag: ${message}` }
            : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return {
    messages,
    input,
    setInput,
    busy,
    error,
    localMode,
    hasThread,
    placeholder,
    bottomRef,
    listRef,
    send,
    onSubmit,
  };
}
