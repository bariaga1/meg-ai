/** Shared input guardrails for the Meg UI proxy and optional bot-side checks. */

export const MAX_MESSAGE_CHARS = 2000;

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(your|the)\s+(system|instructions)/i,
  /you\s+are\s+now\s+/i,
  /system\s*prompt/i,
  /reveal\s+(your|the)\s+(system|hidden)\s+prompt/i,
  /jailbreak/i,
];

const PII_HARVEST_PATTERNS: RegExp[] = [
  /\b(ssn|social\s+security)\b/i,
  /\bpassport\s*(number|no\.?)?\b/i,
  /\bhome\s+address\b/i,
  /\bdate\s+of\s+birth\b|\bdob\b/i,
  /\bcredit\s+card\b/i,
  /\bbank\s+account\b/i,
  /\bmother'?s\s+maiden\b/i,
];

export type GuardrailResult =
  | { ok: true; text: string }
  | { ok: false; reason: string; code: "too_long" | "injection" | "pii_harvest" | "empty" };

/** Strip zero-width / control chars and collapse odd whitespace. */
export function sanitizeMessage(raw: string): string {
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function checkUserMessage(raw: unknown): GuardrailResult {
  if (typeof raw !== "string") {
    return { ok: false, reason: "Message must be a string.", code: "empty" };
  }
  const text = sanitizeMessage(raw);
  if (!text) {
    return { ok: false, reason: "Message is empty.", code: "empty" };
  }
  if (text.length > MAX_MESSAGE_CHARS) {
    return {
      ok: false,
      reason: `Message exceeds ${MAX_MESSAGE_CHARS} characters.`,
      code: "too_long",
    };
  }
  for (const re of INJECTION_PATTERNS) {
    if (re.test(text)) {
      return {
        ok: false,
        reason: "That request looks like a prompt-injection attempt.",
        code: "injection",
      };
    }
  }
  for (const re of PII_HARVEST_PATTERNS) {
    if (re.test(text)) {
      return {
        ok: false,
        reason:
          "Meg only shares public resume details. Ask about work history, skills, or projects instead.",
        code: "pii_harvest",
      };
    }
  }
  return { ok: true, text };
}
