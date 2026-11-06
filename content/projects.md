# Personal side projects

These are not employers. Professional roles come first. The projects show newer technology Omega has been building on the side since October 2025. The resume keeps the short PDF lines. This file is the fuller picture when someone asks about a project. Phone numbers stay out.

## Can I Park Here?

A phone app that photographs a street parking sign, reads it with cloud OCR, and returns one verdict for a chosen local time: OK to Park, Do Not Park, or Uncertain. React Native, Expo, TypeScript. It is a ticket-avoidance scanner for confusing curb signs. The interesting part is the rule engine, not the camera.

One screen, three stages. Home offers Take a Photo and Import Photo, and the camera permission is requested only when the driver taps Take a Photo. The camera is the rear camera. Results show the photo, then a colored badge and the parser's reason. If the parser found a next safe time, that is shown too. Check another time lets the driver pick a weekday and a time in 15-minute steps. That re-runs the parser on the OCR text already stored for this scan. It does not take a new photo and does not call OCR again.

### Pipeline

A photo or library image goes to OCR.space (English, engine 2, orientation detection and scaling on). The returned text goes to a deterministic TypeScript parser with the phone's current local time, or with the time the driver picked. The parser splits the text into clauses, normalizes each one, and returns on the first matching rule. A merge step keeps the strictest status. The screen shows the badge, the reason, and an optional next safe time.

The parser is a regex cascade. It is not a grammar and not a model.

Clauses split when a new line starts with a known header: no parking, no standing, street cleaning, metered parking, loading zone, tow away, permit required, resident, handicap, fire, private, or an hour-parking header. A line without a header stays with the previous plaque. Normalization uppercases the clause, collapses whitespace, and turns a stray zero-looking letter into 0 only when it sits next to digits.

### Time and day rules

9AM is 9, 9:30AM is 9.5, 12AM is 0, and 12PM is 12. A window is active from the start up to but not including the end. No parking 9AM–6PM is restricted at 9:00 and safe at 6:00. If the start hour is later than the end hour, the window crosses midnight: 10PM–6AM is restricted at 11pm and at 3am, and safe at noon. Day ranges accept a hyphen, THRU, and TO. FRI–MON wraps the week. MON & THU and MON–FRI & SAT work. Only three-letter abbreviations are first-class. The next safe time is the posted end, labeled today or tomorrow.

The driver is assumed to have no resident, handicap, or other permit, and not to be in a commercial vehicle. Those signs come back Do Not Park.

Street cleaning matches one three-letter day. Two windows on the same plaque both apply, so no standing 7AM–10AM and 2PM–7PM is restricted at 3pm. Two-hour parking inside its window is OK to Park. The app does not start a countdown. A loading zone, fire zone, handicap-only space, or tow-away zone is Do Not Park. Permit required except Sundays is OK on Sunday and Do Not Park on other days. A commercial meter that says others may not stand is Do Not Park for this driver.

On a stacked pole, every plaque is evaluated. The strictest status wins, so one forbidding plaque makes the whole sign Do Not Park even when another plaque would have allowed parking. Rank is Do Not Park, then Uncertain, then OK to Park. The winning clause supplies the reason and the next safe time.

Uncertain means the text cannot be turned into a reliable rule: empty OCR, unrelated text, a time string that does not parse, or no parking pattern. A wrong OK can mean a ticket, so unreadable text does not become a confident yes. A conflicting stack does not become Uncertain. The stricter plaque wins.

Two limits belong in an accurate answer. Days must be three-letter abbreviations, so a raw OCR line that says "Monday" can miss the day. And a no-parking window followed by "except permit holders" is matched by an earlier generic no-parking pattern, so that exception does not become Uncertain. The debug panel shows a confidence of 90% or 60%. That number is only an OCR exit-code stand-in. It never changes the verdict.

### Stack

React Native on Expo SDK 54, React 19, TypeScript. Camera, photo library, and file bytes stay on the phone. OCR is one HTTPS call to OCR.space. Jest tests freeze a known week and run the parser without calling OCR. They cover window boundaries, overnight ranges, street cleaning, permits, tow, fire, handicap, loading, two-hour parking, and an abbreviated stacked pole.

## CareerOS

Job-search decision tool for mid-level professionals, about 3 to 10 years in. Next.js, TypeScript, SQLite, OpenAI.

Most job tools edit documents. CareerOS decides what to apply to, why, and what to do next. The artifact is a ranked, explained shortlist plus a pipeline. It treats the search like a CRM: discovered jobs are leads, applications are opportunities, interviews are meetings, offers are closed won, and rejections feed the analytics.

A profile is one career track, such as PM or Implementation / Customer Success. The user uploads a resume as PDF, text, or markdown, or pastes it, and can override the search query, target titles, keywords, and a remote-only flag. Refresh matches builds a live shortlist. Save to pipeline, or paste a job URL on the dashboard, creates an application in Considering. The board has seven columns: Considering, Applied, Screening, Interview, Offer, Rejected, and Skipped. The dashboard shows fit reasons, risk reasons, and actions to mark a role applied or skipped. Stats are the response rate and the interview rate across tracked applications. Response rate counts applied roles that reached screening, interview, offer, or rejection. Interview rate counts interview and offer over that same applied set.

### How a person uses it

User-supplied titles and keywords override extraction from the resume. The profile name is still split and merged into the title list, so "Implementation / Customer Success" contributes both phrases. CareerOS builds at most two API queries, adds at most one domain keyword (saas, healthcare, fintech, consulting, or implementation), and appends "remote" when that flag is on. Remotive is queried without that suffix because its catalog is already remote.

Three public sources run together, and a failed source does not drop the others. Remotive is always available. Adzuna and JSearch run when configured. Each source contributes up to 15 jobs. Cross-source duplicates collapse on company plus title.

### How relevance and fit are split

Discovery is a pipeline, not one model call. Deterministic code decides whether a job is the right kind of role. GPT-4o-mini judges how well the resume fits the posting. A fixed formula mixes the two numbers. The model never chooses which jobs enter the candidate set, and it never sees the alignment score. Hybrid fit scoring stays editable: changing titles and keywords changes both the API queries and the alignment math.

Alignment score, in code: the share of strong keyword hits times 55, plus 35 if the title matched, plus 10 when there are at least three strong keyword hits, capped at 100. Hits use word boundaries, so "java" does not match inside "javascript". The words api, java, node, and excel stay out of the strong count. A title matches when the intent title and the job title contain each other. For a multi-word title, at least two meaningful words must appear.

Alignment gate, in code: keep the job if the title matched, or if at least two strong keywords appear in the title and description. Jobs that fail are dropped before any model call.

Resume score: GPT-4o-mini at temperature 0.2 returns JSON with a 0–100 score, a one-sentence summary, fit reasons, and risk reasons. The resume and the posting are each truncated to 6000 characters. The band is computed in code from the score. If the model is unavailable, a keyword-overlap heuristic fills the same slot: 35 plus 60 times the share of job words that also appear in the resume, clamped between 25 and 95.

Combined discovery rank: round(resume score × 0.55 + alignment score × 0.45), then +12 when the title matched, capped at 100. Title matches sort first, then combined score. The list returns at most 25. Bands are Strong fit at 75–100, Moderate fit at 55–74, and Weak fit below 55.

Paste-a-URL is a separate path. The user already chose the job, so CareerOS parses the page and scores resume fit only. It skips the alignment gate and the 55/45 blend. Saving a discovered match stores that resume score on the application. The match card shows the combined rank. The pipeline stores the resume score. One job URL has one application. Pasting a URL that already exists re-scores that same application.

### Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4. SQLite via better-sqlite3. The OpenAI SDK calls GPT-4o-mini for the resume score. Cheerio parses job pages. pdf-parse reads uploaded resumes.

## Storefront Studio

Consulting intake for brick-and-mortar shops that are not online yet, or that are stuck with paper records and growth. Next.js, TypeScript, n8n, GitHub, Resend.

A shop owner fills out one public form. A successful submission creates a markdown client folder that a consultant and AI coding agents can work from. There is no database, CRM, client login, payments, or auto-built website. The folder is the product.

Built a Next.js/TypeScript intake platform that validates small-business inquiries and converts them into structured markdown context files committed to a private GitHub repo for downstream AI agent workflows, with an n8n webhook for a drafted first reply and consultant notification.

### Who it is for

Three kinds of shop problems:

- Getting online. A simple public page, maps listing, hours, and photos.
- Organizing data. Inventory, customers, or sales that currently live in notebooks or shoeboxes.
- Scaling. The owner is in every loop (orders, staffing, process) before tools are added.

The work stays the smallest change the owner can keep using. The brief uses only what the owner wrote. Missing facts stay as open questions.

### Architecture

The form is a React client component. It POSTs JSON to `/api/inquire`. The route is a thin orchestrator. Business logic lives in `src/lib`.

On submit, in order: rate limit (five submissions per IP per hour), parse the JSON, honeypot, field validation, optional Cloudflare Turnstile, then allocate a folder and write three markdown files. A Resend email and an n8n webhook can run after the folder exists. The shop owner sees a thank-you state. A folder is created only after a successful POST.

Required fields: name, email, business name, need type (presence, data, scaling, or other), and a description. Phone, city, and website are optional.

Spam controls: a hidden honeypot is always on. A filled honeypot returns success and writes nothing. Turnstile is an optional second check. Human approval lives in n8n.

### Client folder

Path: `clients/{business-slug}-{yyyy-mm-dd}/`. Ortega Hardware on 16 September 2026 becomes `ortega-hardware-2026-09-16`. The slug lowercases, strips accents, turns punctuation into hyphens, and caps length at 48 characters. If that name is already taken on disk or in the repo, the allocator adds a numeric suffix so a new inquiry does not overwrite an older folder.

Every folder has three files:

- `inquiry.md` is the contact info, need type, and the owner's words.
- `CONTEXT.md` is the agent brief: business facts, stated problem, likely workstreams, open questions, and working rules. Agents read this first.
- `notes.md` starts empty. Agents append dated entries and leave earlier notes in place.

Workstreams are templates, not facts about the shop: presence (how they show up today), data (what they already track), scaling (name the bottleneck, then add tools), other (restate the problem and separate must-do from later).

### Persistence

The three files are committed to one private GitHub repo with the Git Data API: read the branch tip, create a tree and commit, update the ref. The repo stays private because folders contain names, emails, and phone numbers.

### Automation

n8n runs in Docker, outside the Next.js process. The app POSTs the folder path and the inquiry. The workflow checks a shared secret, drafts a short first reply with OpenAI from facts in that payload, and ends the draft with two or three questions. A person approves, and the consultant email goes out only on yes. The client folder already exists before that approval. Approval gates the notify email. Resend, inside the app, is the email fallback. n8n is the path that drafts and notifies.

### Stack

TypeScript (strict), Next.js 16 App Router, React 19, Tailwind CSS 4. Storage is markdown plus the GitHub Git Data API. Email fallback is Resend. Automation is n8n. Vitest tests sit next to the code and cover parsing, folder writes, the inquire route, and the n8n client. Node 22, npm.
