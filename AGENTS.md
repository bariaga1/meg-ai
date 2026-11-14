# meg-ai

Notes for coding agents working in this repo. Human docs are in README.md.

## Loop

```bash
npm run lint
npm run typecheck
npm test          # retrieval grounding tests, no model calls
npm run build
```

## UI

`npm run dev`, then open http://127.0.0.1:3000 (port 3000). That host is in
`allowedDevOrigins`; other dev hosts get 403 on `/_next` assets and the
page never hydrates. Without Gateway credentials, `/api/chat` answers in
quick lookup mode (resume excerpts), which is fine for UI work.

## Layout

- `app/api/chat/route.ts`: guards, then retrieval + AI Gateway stream.
- `lib/megRetrieve.ts`: BM25 search plus intent rules. Every retrieval
  change must keep `tests/meg-retrieve.test.ts` passing.
- `lib/megPrompt.ts`: Meg's only system prompt.
- `content/*chunks.json`: Meg's knowledge. `lib/siteContent.ts` and
  `lib/siteProjects.ts`: the page copy. Keep both in sync with the resume.
- `components/chat/MegCharacter.tsx`: the animated Meg; respect
  `prefers-reduced-motion` in any new motion.

## Do not

- Copy wording from the sites that inspired this one.
- Send the whole resume to the model; retrieval exists to keep tokens down.
- Add npm dependencies without a clear need.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
