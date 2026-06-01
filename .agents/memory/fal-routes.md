---
name: fal.ai Proxy Routes
description: How fal.ai generation is proxied through the backend
---

**Pattern:** Submit async → poll status → fetch result (3 separate calls)
- `POST /api/fal/submit` → fal.ai queue.fal.run/{model_id}
- `GET /api/fal/status?model_id=&request_id=` → polls status then fetches result when COMPLETED
- Frontend polls every 3s via `useEffect` in `GenerationStudio.tsx`
- Creations stored in localStorage via `useCreations` hook

**Model registry:** `artifacts/heygen-studio/src/lib/models.ts` — add new models there

**Why:** No DB needed; localStorage is sufficient for generation history. Backend proxy hides FAL_API_KEY from browser.

**Keys:** FAL_API_KEY and HEYGEN_API_KEY — neither set yet as of build time.
