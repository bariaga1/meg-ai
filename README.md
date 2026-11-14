# Meg.ai

Portfolio site for **Omega Bariagaber**, with **Meg**: a chat guide that
answers recruiters' questions from Omega's resume and side projects only.

Live: https://itsomega.com

## How Meg answers

```
question ──► retrieval (lib/megRetrieve.ts)
               ├─ BM25 keyword search over resume + project sections
               └─ intent rules for questions keywords miss
                  (strengths, follow-ups, "other roles", career order)
         ──► AI Gateway model (lib/megGatewayChat.ts)
               system prompt (lib/megPrompt.ts) + retrieved sections
         ──► streamed reply (NDJSON) ──► chat panel
```

Retrieval keeps each request to roughly 3k input tokens instead of sending
the whole resume (about 6.5k). Without Gateway credentials, `/api/chat`
answers with plain resume excerpts instead (quick lookup mode).

## Stack

| Layer | Where |
| --- | --- |
| Next.js 16 App Router, React 19, Tailwind | `app/`, `components/` |
| Chat API (guards, retrieval, streaming) | `app/api/chat/route.ts`, `lib/` |
| Resume knowledge | `content/resume.md`, `content/projects.md`, chunked into `content/*chunks.json` |
| Model | Vercel AI Gateway, default `google/gemini-2.5-flash` |
| Abuse limits | BotID, Vercel Firewall rate limit, per-IP and per-session caps |

## Run locally

Requires Node 22.13+.

```bash
npm install
cp .env.example .env.local
npm run dev            # http://127.0.0.1:3000
```

For real AI answers locally, give the app a Gateway credential, either:

- `vercel link` then `vercel env pull .env.local` (uses the project's OIDC token), or
- set `AI_GATEWAY_API_KEY` in `.env.local`.

Without one, Meg runs in quick lookup mode, which is fine for UI work.

## Checks

```bash
npm run lint
npm run typecheck
npm test               # retrieval grounding tests, no model calls
npm run smoke:retrieve
npm run smoke:local
npm run build
```

## Limits and spend

Caps: 5 messages/minute and 30/day per IP, 12 user turns per browser
session, 1200 max output tokens.

Gateway spend is not capped in code. In the Vercel dashboard under
**AI Gateway → Budgets**, set a monthly budget with alerts at 50/75/100%
and a hard stop at 100%. Keep `AI_GATEWAY_MODEL` on a Flash-class model
for public traffic.

## Link previews

`app/opengraph-image.tsx` and the metadata in `app/layout.tsx` produce the
LinkedIn/Slack preview card. Set `NEXT_PUBLIC_SITE_URL` to the production
URL (custom domain when there is one) so absolute URLs match, then
re-check with LinkedIn Post Inspector, which caches aggressively.

## Updating the resume

Edit `content/resume.md` / `content/projects.md`, then update the matching
sections in `content/chunks.json` / `content/project-chunks.json` (Meg's
knowledge) and `lib/siteContent.ts` / `lib/siteProjects.ts` (the page).
Run `npm test` afterwards.

## Privacy

Phone number is not in Meg's knowledge. Email is shared only when someone
asks how to reach Omega or when the resume can't answer a question.
