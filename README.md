# Meg.ai

Interactive way to ask chat about **Omega Bariagaber** resume. Brand: **Meg**.

Meg answers only from Omega’s resume (lexical RAG over section chunks). Model
turns run on the **Cursor Agent SDK** — no OpenAI/Anthropic API keys.

## Stack

| Layer | Role |
| --- | --- |
| Next.js App Router + TypeScript + Tailwind | Muse-style chat UI on Vercel |
| `bot/` (`@grok/agent-sdk`) | Instructions, `retrieve_resume` tool, hooks |
| `content/resume.md` + `content/chunks.json` | Resume knowledge (phone omitted) |
| `app/api/chat` | Server proxy to Agent SDK HTTP (`AGENT_BASE_URL`) |

## Local demo

Requires **Node 22.13+** (not Bun).

```bash
git clone https://github.com/bariaga1/meg-ai.git
cd meg-ai
npm install
cp .env.example .env.local
# AGENT_BASE_URL=http://127.0.0.1:3001

# Terminal A — Agent SDK (playground also at :3001/playground)
npm run dev:agent

# Terminal B — UI
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

**Chat backends (first match wins):**

1. `MEG_FORCE_LOCAL=1` — lexical BM25 excerpts only  
2. `AGENT_BASE_URL` — Cursor Agent SDK HTTP  
3. AI Gateway on Vercel (OIDC) or `AI_GATEWAY_API_KEY` locally — organic model
   replies grounded by BM25 retrieve  
4. Otherwise lexical fallback  

Public deploy uses Gateway + BotID + rate limits (see `/api/chat`). Default
model is `google/gemini-2.5-flash`. Caps: **5 messages/min** and **30/day**
per IP (process-local backup), **12 user turns** per browser session, **1200**
max output tokens.

### Budget alerts (do this in the Vercel dashboard)

AI Gateway spend is not enforced in app code. In
[AI Gateway](https://vercel.com/dashboard) → your team → **AI Gateway** /
**Budgets**:

1. Set a monthly budget (start around **$10–20** for LinkedIn posts).
2. Enable alerts at **50% / 75% / 100%** (email or Slack if available).
3. Prefer **hard stop** at 100% so a scrape cannot run unbounded.
4. Keep `AI_GATEWAY_MODEL` on Flash — do not switch to Pro for public Q&A.

### Open Graph (LinkedIn link preview)

When someone pastes your URL on LinkedIn, LinkedIn fetches **Open Graph**
tags (`og:title`, `og:description`, `og:image`). This repo generates
`/opengraph-image` and wires metadata in `app/layout.tsx`.

After deploy, test with [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
(it caches aggressively — “Inspect” again after changes). Set
`NEXT_PUBLIC_SITE_URL` to your production URL (custom domain when ready).

### Custom domain

Current production host: `meg-ai-nine.vercel.app`. `meg.ai` is **not**
available to register. In Vercel → Project → **Domains**, add a domain you
own (or buy one), then set `NEXT_PUBLIC_SITE_URL=https://that.domain` and
redeploy so OG absolute URLs match.

### Useful checks (no model key required)

```bash
npm run smoke:retrieve
npm run validate:agent
npm run check:agent
npx @grok/agent-sdk tool call retrieve_resume --dir . --input '{"query":"Medallia","topK":2}' --json
```

With a Cursor credential:

```bash
npx @grok/agent-sdk run --dir . --message "What did Omega do at Medallia?"
npx @grok/agent-sdk eval --dir .
```

## Publish / push (if starting from a local copy)

Repo: [https://github.com/bariaga1/meg-ai](https://github.com/bariaga1/meg-ai)

```bash
cd /path/to/meg-ai
git remote add origin https://github.com/bariaga1/meg-ai.git   # once
git push -u origin main
```

## Deploy

### 1. Cursor-hosted agent

Needs a Cursor **service account** (or operator `agent-sdk login`) with deploy
rights. This cloud agent environment did **not** have
`CURSOR_SERVICE_ACCOUNT_KEY`.

1. Ensure `main` is pushed to GitHub.
2. On your machine (or a Cursor env with a service account attached):

```bash
cd meg-ai
npx @grok/agent-sdk@0.5.0 whoami --json
npx @grok/agent-sdk@0.5.0 validate --dir .
npx @grok/agent-sdk@0.5.0 deploy --dir . --dry-run
npx @grok/agent-sdk@0.5.0 deploy --dir .
```

3. Save the **one-time alias token** from the first deploy.
4. Copy the hosted HTTP base URL from the deploy output or
   [Deployed agents](https://cursor.com/dashboard/deployed-agents).
5. Smoke: `npx @grok/agent-sdk@0.5.0 session create --slug meg-ai --message "What did Omega do at Medallia?" --wait`

### 2. Vercel UI

Needs Vercel CLI auth (`vercel login`). Not available in this build environment.

```bash
npm i -g vercel
cd meg-ai
vercel link
vercel env add AGENT_BASE_URL          # Cursor-hosted agent URL, no trailing slash
# optional:
vercel env add AGENT_BEARER_TOKEN      # alias / bearer from Cursor deploy
vercel --prod
```

Never put the bearer/alias token in `NEXT_PUBLIC_*`.

## Layout

```
app/                 # UI + /api/chat
components/chat/     # MegChat
content/             # resume.md, chunks.json
bot/                 # Agent SDK agent
  agent.ts
  instructions.md
  tools/retrieve_resume.ts
  hooks/
lib/guardrails.ts
evals/
```

## PII

Phone is omitted from the public knowledge base. Email is shared only when the
user asks for contact details.
