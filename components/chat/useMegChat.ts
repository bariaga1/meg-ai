"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { MegMood } from "./MegCharacter";

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: Role;
  text: string;
};

export const STARTERS = [
  "What did you do at Medallia?",
  "Which skills show up across roles?",
  "How can I contact you?",
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
  };
  /** On the "session" event: "gateway" (model reply) or "local" (lexical excerpts). */
  mode?: string;
};

export function useMegChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localMode, setLocalMode] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const pendingRef = useRef("");
  const revealIdRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  const appendVisible = (id: string, chunk: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text: `${m.text}${chunk}` } : m)),
    );
  };

  const stopRevealLoop = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const pumpReveal = (now: number) => {
    const id = revealIdRef.current;
    if (!id || !pendingRef.current) {
      rafRef.current = null;
      return;
    }

    if (now - lastTickRef.current < 16) {
      rafRef.current = requestAnimationFrame(pumpReveal);
      return;
    }
    lastTickRef.current = now;

    const leftover = pendingRef.current.length;
    const take = leftover > 180 ? 16 : leftover > 60 ? 9 : leftover > 24 ? 5 : 3;
    const chunk = pendingRef.current.slice(0, take);
    pendingRef.current = pendingRef.current.slice(take);
    appendVisible(id, chunk);

    if (pendingRef.current) {
      rafRef.current = requestAnimationFrame(pumpReveal);
    } else {
      rafRef.current = null;
    }
  };

  const enqueueReveal = (id: string, delta: string) => {
    if (!delta) return;
    // Small deltas (token/word sized) paint immediately for smoothness.
    if (delta.length <= 28 && !pendingRef.current) {
      appendVisible(id, delta);
      return;
    }
    revealIdRef.current = id;
    pendingRef.current += delta;
    if (rafRef.current == null) {
      lastTickRef.current = performance.now();
      rafRef.current = requestAnimationFrame(pumpReveal);
    }
  };

  const flushReveal = () => {
    const id = revealIdRef.current;
    const rest = pendingRef.current;
    stopRevealLoop();
    pendingRef.current = "";
    if (id && rest) appendVisible(id, rest);
  };

  const waitForRevealIdle = async () => {
    if (!pendingRef.current && rafRef.current == null) return;
    await new Promise<void>((resolve) => {
      const start = performance.now();
      const tick = () => {
        if ((!pendingRef.current && rafRef.current == null) || performance.now() - start > 2500) {
          flushReveal();
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };

  useEffect(() => () => stopRevealLoop(), []);

  const hasThread = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy, streamingId]);

  // Thinking until the first words land, then speaking until the reveal ends.
  const streamingText = streamingId
    ? messages.find((m) => m.id === streamingId)?.text ?? ""
    : "";
  const mood: MegMood = !streamingId ? "idle" : streamingText ? "speaking" : "thinking";

  const placeholder = useMemo(
    () => (hasThread ? "Ask a follow-up…" : "Ask Meg…"),
    [hasThread],
  );

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const priorUserTurns = messages.filter((m) => m.role === "user").length;
    const userTurnCount = priorUserTurns + 1;
    if (userTurnCount > 12) {
      setError("This chat session is full. Refresh the page to start a new one.");
      return;
    }

    setError(null);
    setBusy(true);
    flushReveal();
    const userMsg: ChatMessage = { id: uid(), role: "user", text: trimmed };
    const assistantId = uid();
    revealIdRef.current = assistantId;
    setStreamingId(assistantId);
    setMessages((m) => [...m, userMsg, { id: assistantId, role: "assistant", text: "" }]);
    setInput("");

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.role === "user" || m.role === "assistant")
        .filter((m) => m.text.trim())
        .slice(-8)
        .map((m) => ({ role: m.role as "user" | "assistant", text: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          userTurnCount,
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

          if (ev.type === "session") {
            setLocalMode(ev.mode === "local");
            continue;
          }

          const delta = ev.type === "message.appended" ? ev.data?.delta : undefined;
          if (delta) {
            sawAssistant = true;
            enqueueReveal(assistantId, delta);
          }

          if (ev.type === "message.completed" && ev.data?.text) {
            sawAssistant = true;
            // Prefer streamed reveal; hard-fill only if the assistant bubble is still empty.
            const completedText = ev.data.text;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId && !m.text && !pendingRef.current
                  ? { ...m, text: completedText }
                  : m,
              ),
            );
          }

          if (ev.type === "turn.completed") {
            await reader.cancel();
            break;
          }
        }
      }

      await waitForRevealIdle();
      if (!sawAssistant) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && !m.text
              ? {
                  ...m,
                  text: "I could not stream a reply. Try again in a moment.",
                }
              : m,
          ),
        );
      }
    } catch (err) {
      flushReveal();
      const message =
        err instanceof Error ? err.message : "Couldn't reach Meg. Check your connection and try again.";
      setError(message);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && !m.text
            ? { ...m, text: `I hit a snag: ${message}` }
            : m,
        ),
      );
    } finally {
      await waitForRevealIdle();
      setStreamingId(null);
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
    streamingId,
    mood,
    placeholder,
    bottomRef,
    listRef,
    send,
    onSubmit,
  };
}

export type MegChatState = ReturnType<typeof useMegChat>;
