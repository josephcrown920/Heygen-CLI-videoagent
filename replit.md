# HeyGen Studio

A full-featured HeyGen Studio clone — AI video production platform with Viral Content Engine, SI Director (OpenAI GPT-4o), fal.ai model generation (Kling, Seedance, FLUX), HuggingFace Inference, Avatar Shots, Urban Cuts, Lip Sync, App Library, GPU Hub, and a HeyGen-style dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (Express on `PORT` env)
- `pnpm --filter @workspace/heygen-studio run dev` — run the frontend (Vite/React on `PORT` env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Environment Variables (Secrets)

| Secret | Required | Used By | Description |
|--------|----------|---------|-------------|
| `FAL_API_KEY` | ✅ Required | `api-server /api/fal/*` | fal.ai API key for Kling, Seedance, FLUX generation |
| `OPENAI_API_KEY` | ✅ Required | `api-server /api/si/plan` | OpenAI GPT-4o for SI Director production planning |
| `HUGGINGFACE_TOKEN` | ⚡ Required | `api-server /api/hf/*` | HuggingFace Inference API token (read token from hf.co/settings/tokens) |

### Getting your HuggingFace Token
1. Go to [hf.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a new token with **Read** permissions
3. Add it as `HUGGINGFACE_TOKEN` in Replit Secrets

### Getting your fal.ai Key
1. Go to [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)
2. Create an API key
3. Add it as `FAL_API_KEY` in Replit Secrets

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **API:** Express 5 (`artifacts/api-server/`)
- **Frontend:** Vite + React + shadcn/ui (`artifacts/heygen-studio/`)
- **AI Generation:** fal.ai (`/api/fal/submit`, `/api/fal/status`) — async queue polling
- **HuggingFace:** `@huggingface/inference` (`/api/hf/text`, `/api/hf/image`, `/api/hf/embed`)
- **SI Director:** OpenAI GPT-4o JSON mode (`/api/si/plan`)
- **Validation:** Zod
- **Build:** esbuild (CJS bundle)

## Where Things Live

```
artifacts/
  api-server/src/routes/
    fal.ts          — POST /fal/submit, GET /fal/status (async queue)
    hf.ts           — POST /hf/text, /hf/image, /hf/embed + GET /hf/models
    si-director.ts  — POST /si/plan (GPT-4o production planner)
    kling.ts        — Kling-specific helpers
    heygen.ts       — HeyGen API proxy

  heygen-studio/src/pages/
    Dashboard.tsx      — "Say it with video" hero landing
    ViralEngine.tsx    — 300+ hooks × Kling/Seedance → fal.ai fire + Campaign Export
    GPUHub.tsx         — AI Orchestration Hub (HF live inference + provider dashboard)
    SIDirector.tsx     — GPT-4o production director
    AvatarShots.tsx    — Avatar video shots
    UrbanCuts.tsx      — Urban scene video generator
    LipSync.tsx        — Lip sync tool
    AppLibrary.tsx     — App marketplace
    Canvas.tsx         — Drawing canvas
    Creations.tsx      — Generated video library
    ModelHub.tsx       — fal.ai model browser
```

## Architecture Decisions

- **fal.ai async queue pattern:** Frontend fires `POST /api/fal/submit` → gets `request_id`, then polls `GET /api/fal/status?model_id=...&request_id=...` every 3s until COMPLETED. All video/image models go through this single pipeline.
- **BASE_URL pattern:** Frontend uses `import.meta.env.BASE_URL?.replace(/\/$/, "")` to prefix all API calls — required for Replit's path-based proxy routing.
- **HuggingFace returns base64:** `/api/hf/image` returns `{ base64, contentType, dataUrl }` so the frontend can render without a CDN URL.
- **Viral Engine is fully client-side:** All hook generation and vocab substitution runs in the browser — only the fal.ai submit call hits the server.

## Pages & Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | HeyGen-style hero with prompt box and feature grid |
| `/viral-engine` | Viral Engine | 8 angles × 300+ hooks + Kling/Seedance video generation + Campaign Export |
| `/gpu-hub` | GPU + AI Hub | AI orchestration dashboard — HuggingFace live inference + provider overview |
| `/si-director` | SI Director | GPT-4o multi-shot production planner |
| `/avatar-shots` | Avatar Shots | AI avatar video generator |
| `/urban-cuts` | Urban Cuts | Urban scene video cuts |
| `/lip-sync` | Lip Sync | Video lip sync tool |
| `/apps` | App Library | App marketplace with category filters |
| `/canvas` | Canvas | Creative canvas |
| `/creations` | Creations | Generated content library |
| `/models` | Model Hub | fal.ai model browser |

## User Preferences

- Dark theme, HeyGen-style UI (deep dark backgrounds, purple primary, clean card layout)
- All new pages use consistent nav badge system: NEW badge (primary color), SI badge (violet)
- pnpm only — no npm or yarn
