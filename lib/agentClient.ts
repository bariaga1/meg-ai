export type AgentSessionStart = {
  ok: true;
  sessionId: string;
  continuationToken: string;
};

export type ChatProxyRequest = {
  message: string;
  sessionId?: string;
  continuationToken?: string;
  startIndex?: number;
};

function agentBaseUrl(): string {
  const base = process.env.AGENT_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error(
      "AGENT_BASE_URL is not set. Start the agent (`npm run dev:agent`) and set AGENT_BASE_URL=http://127.0.0.1:3001",
    );
  }
  return base;
}

function agentHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json",
  };
  const token = process.env.AGENT_BEARER_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

export async function startOrContinueSession(input: {
  message: string;
  sessionId?: string;
  continuationToken?: string;
}): Promise<AgentSessionStart> {
  const base = agentBaseUrl();
  const url = input.sessionId
    ? `${base}/v1/session/${encodeURIComponent(input.sessionId)}`
    : `${base}/v1/session`;

  const body: Record<string, string> = { message: input.message };
  if (input.sessionId && input.continuationToken) {
    body.continuationToken = input.continuationToken;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: agentHeaders(),
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    ok?: boolean;
    sessionId?: string;
    continuationToken?: string;
    error?: string;
    message?: string;
  };

  if (!res.ok || !json.ok || !json.sessionId || !json.continuationToken) {
    throw new Error(json.message || json.error || `Agent session failed (${res.status})`);
  }

  return {
    ok: true,
    sessionId: json.sessionId,
    continuationToken: json.continuationToken,
  };
}

export function openSessionStream(sessionId: string, startIndex = 0): Promise<Response> {
  const base = agentBaseUrl();
  const url = `${base}/v1/session/${encodeURIComponent(sessionId)}/stream?startIndex=${startIndex}`;
  const headers: Record<string, string> = { accept: "application/x-ndjson" };
  const token = process.env.AGENT_BEARER_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;
  return fetch(url, { headers });
}
