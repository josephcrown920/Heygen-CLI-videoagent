---
name: Replit Auth wiring
description: How Replit Auth is set up in this monorepo — DB schema, auth routes, frontend hook, auth gating, and Vite proxy.
---

# Replit Auth wiring

## Key decisions

**AuthUser defined inline, not from api-zod.**
The codegen doesn't produce a named `AuthUser` export; the type is embedded inside `GetCurrentAuthUserResponse`. All auth files define `AuthUser` locally:
- `artifacts/api-server/src/lib/auth.ts` — source of truth (interface + SessionData)
- `artifacts/api-server/src/middlewares/authMiddleware.ts` — imports from `../lib/auth`

**Why:** Importing `AuthUser` from `@workspace/api-zod` caused TS errors because the generated schema embeds the type inside a response object, not as a standalone export.

**Mobile auth endpoints use inline validation.**
`ExchangeMobileAuthorizationCodeBody` and `LogoutMobileSessionResponse` Zod schemas do not exist in generated code. Routes use manual `req.body` destructuring + early-return guards.

**How to apply:** If adding new auth-related Zod types, define them in `lib/api-spec/openapi.yaml` as top-level named schemas so Orval generates standalone exports.

## DB schema
- `lib/db/src/schema/auth.ts` — sessionsTable + usersTable (copied from skill template)
- `lib/db/src/schema/index.ts` — exports `./auth`
- Run `pnpm --filter @workspace/db run push` after any schema change

## Vite proxy
- `artifacts/heygen-studio/vite.config.ts` has `server.proxy: { "/api": { target: "http://localhost:8080" } }`
- This routes all `/api/*` dev requests to the Express server on port 8080

## Frontend auth hook
- `artifacts/heygen-studio/src/hooks/useAuth.ts` — standalone hook, no dependency on `@workspace/replit-auth-web`
- Fetches `GET /api/auth/user`, exposes `{ user, isLoading, isAuthenticated, login, logout }`
- `login()` → redirects to `/api/login?returnTo=<base>`
- `logout()` → redirects to `/api/logout`

## Auth gating in App.tsx
- `Router()` calls `useAuth()`; while loading shows spinner; if not authenticated shows `<Landing />`; otherwise renders full `<AppLayout>` with routes

## AppLayout
- Calls `useAuth()` directly; passes `user`, `login`, `logout` into `SidebarContent`
- Shows profile avatar + name + logout button in sidebar footer when authenticated
- Shows "Sign in" button when not authenticated
