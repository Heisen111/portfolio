# Aadi — Portfolio

Cinematic one-page portfolio for Devarshi Dave (Aadi). Japanese/samurai-inspired visual story:

`ARRIVAL → THE PATH → THE CRAFT → THE WORK → THE HUMAN → THE NEXT JOURNEY`

Aadi builds smart contract systems and autonomous AI agents. This site should feel like a film, not a website wearing a samurai skin.

## Stack

React 19 · TypeScript · Vite 6 · native CSS. Deploys to Vercel free tier.

## Scripts

```bash
npm run dev        # local dev server (serves /api/chat in-process for the portfolio guide)
npm run build      # typecheck (tsc --noEmit) + production build
npm run typecheck  # typecheck only
npm test           # vitest: validation, rate limiting, handler, secret hygiene
npm run preview    # preview the production build
```

## Structure

```text
api/                 Vercel serverless function (POST /api/chat — portfolio guide)
public/assets/       approved art: hero, backgrounds, decoratives, photography, self-hosted fonts
src/content/         all copy, typed by src/types/  — edit content here, never in components
src/components/ai/   portfolio guide conversation (lazy-loaded)
src/types/           shared content types
src/components/      layout, navigation, sections, projects, media, ui
src/hooks/           e.g. useReducedMotion
src/lib/             non-UI logic, e.g. navigation chapters
src/styles/          design tokens + base styles
tests/               vitest suites for the /api/chat gateway
docs/                STORYBOARD, DESIGN_SYSTEM, ANIMATION_SYSTEM, ASSET_MANIFEST, ARCHITECTURE, RELEASE
```

## Portfolio guide (AI Q&A)

THE NEXT JOURNEY ends with a quiet editorial Q&A. A same-origin Vercel serverless
function (`POST /api/chat`) talks to **Groq**; the API key stays server-side
(`GROQ_API_KEY`, model via `GROQ_MODEL`). Set both variables in `.env` for
local dev and in the Vercel dashboard for production. No RAG, no persistence,
rate-limited, plain-text answers only. See `docs/ARCHITECTURE.md`.

## Guiding rules

Read `AGENTS.md` before working. Content is separated from UI; assets are locked; no scroll-jacking; accessibility + reduced motion respected; no unnecessary dependencies; no secrets in the frontend.

## Status

Pre-release. Release-candidate sweep complete (Aug 2026): hero-b remuxed for
streaming (lossless), hero quote contrast fixed, links/assets verified,
typecheck + 42/42 tests + build green. Remaining: manual browser pass (console
errors, mobile, reduced motion) before deploy. Set `GROQ_API_KEY` /
`GROQ_MODEL` in `.env` and in the Vercel dashboard. See `PROJECT_CONTEXT.md`
for the living state and `docs/RELEASE.md` for the release checklist.
