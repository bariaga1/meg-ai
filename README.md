# Meg.ai

Employer-facing resume chat agent for **Omega Bariagaber**. Brand: **Meg**.

## Stack

- Next.js (App Router) + TypeScript + Tailwind — Muse-style UI
- Cursor Agent SDK (`@grok/agent-sdk`) under `bot/` — model turns via Cursor (no OpenAI/Anthropic API keys)
- Lexical BM25-style RAG over resume section chunks
- `/api/chat` server proxy to the Agent SDK HTTP API

## Status

Scaffold in progress. See commit history for slice-by-slice build.
