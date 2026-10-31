# Meg.ai

Employer-facing resume chat agent for **Omega Bariagaber**. Brand: **Meg**.

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
cp .env.example .env.local
# AGENT_BASE_URL=http://127.0.0.1:3001

# Terminal A — Agent SDK (playground also at :3001/playground)
npm run dev:agent

# Terminal B — UI
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

Model turns need a Cursor credential (`npx @grok/agent-sdk login`, or
`CURSOR_API_KEY` / `CURSOR_SERVICE_ACCOUNT_KEY`). Without one, the UI still
loads; chat returns an agent error until you sign in.

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

## Deploy

### 1. Cursor-hosted agent

1. Push this repo to GitHub (`bariaga1/meg-ai`).
2. Attach a Cursor service account for the team that can deploy agents.
3. From a trusted operator terminal:

```bash
npx @grok/agent-sdk@0.5.0 validate --dir .
npx @grok/agent-sdk@0.5.0 deploy --dir . --dry-run
npx @grok/agent-sdk@0.5.0 deploy --dir .
```

4. Save the one-time alias token from the first deploy.
5. Note the hosted HTTP base URL from the deploy output / dashboard:
   [https://cursor.com/dashboard/deployed-agents](https://cursor.com/dashboard/deployed-agents)

### 2. Vercel UI

```bash
npm i -g vercel
vercel link
vercel env add AGENT_BASE_URL
# optional: vercel env add AGENT_BEARER_TOKEN
vercel --prod
```

Set `AGENT_BASE_URL` to the Cursor-hosted agent URL (no trailing slash).
Never expose the bearer/alias token as `NEXT_PUBLIC_*`.

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
