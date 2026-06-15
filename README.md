# JSONPlaceholder Explorer

A small full-stack application that proxies, enriches and presents data from the
public [JSONPlaceholder](https://jsonplaceholder.typicode.com) API.

The backend exposes a clean REST API over the upstream resources (users, posts,
comments), adds caching and error handling, and resolves the relationships
between resources so the frontend can render rich pages with a single request.

---

## Table of contents

- [Architecture overview](#architecture-overview)
- [Tech stack](#tech-stack)
- [Running locally](#running-locally)
- [Running with Docker](#running-with-docker)
- [API reference](#api-reference)
- [Architecture decisions & tradeoffs](#architecture-decisions--tradeoffs)
- [Testing](#testing)
- [Project structure](#project-structure)
- [What I'd do next](#what-id-do-next)

---

## Architecture overview

```
┌──────────────┐        ┌─────────────────────────┐        ┌──────────────────────┐
│   Frontend   │  HTTP  │        Backend          │  HTTP  │   JSONPlaceholder     │
│ React + Vite │ ─────▶ │   Express + TS API      │ ─────▶ │   (upstream REST)     │
│  (SPA)       │ ◀───── │  proxy · cache · enrich │ ◀───── │                       │
└──────────────┘  JSON  └─────────────────────────┘  JSON  └──────────────────────┘
```

The frontend never talks to JSONPlaceholder directly. It calls our backend,
which is the single point that:

1. **Proxies** the upstream API.
2. **Caches** responses (TTL) so we don't hit the upstream on every request.
3. **Enriches** data by resolving relationships (a post → its author + comments;
   a user → their posts).
4. **Normalises errors** into a single, predictable JSON shape.

This keeps the frontend simple and means the data-shaping logic lives in one
place that's easy to test.

---

## Tech stack

| Layer    | Choice                          | Why |
| -------- | ------------------------------- | --- |
| Backend  | Node.js 22 · Express · TypeScript | Minimal, ubiquitous, easy to reason about and explain. |
| Caching  | In-memory TTL cache (no dep)    | The requirement is "don't hit upstream every time" — a Map with per-entry expiry covers it without infra. |
| Frontend | React 18 · Vite · TypeScript    | Fast dev server, instant builds, strong typing end-to-end. |
| Styling  | Tailwind CSS                    | Responsive + dark mode with very little custom CSS. |
| Routing  | React Router 6                  | Standard SPA routing for the three+ pages. |
| Tests    | Vitest · Supertest              | Same runner front and back; Supertest exercises the Express app without a live port. |
| CI       | GitHub Actions                  | Typecheck + tests + build on every push/PR. |

---

## Running locally

**Prerequisites:** Node.js ≥ 20 (tested on 22).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # optional — sane defaults are baked in
npm run dev               # http://localhost:4000
```

Quick check:

```bash
curl http://localhost:4000/health
curl "http://localhost:4000/posts?page=1&pageSize=5"
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server proxies `/api/*` to the backend on port 4000, so you don't
need to configure anything — just run both.

---

## Running with Docker

A `docker-compose.yml` builds and runs both services:

```bash
docker compose up --build
```

- Frontend: <http://localhost:8080> (served by nginx, which proxies `/api` to the backend)
- Backend:  <http://localhost:4000>

---

## API reference

Base URL: `http://localhost:4000`

| Method | Endpoint        | Description |
| ------ | --------------- | ----------- |
| GET    | `/health`       | Liveness check + cache stats. |
| GET    | `/users`        | List all users. |
| GET    | `/users/:id`    | Single user **enriched with their posts**. |
| GET    | `/posts`        | Paginated posts. Query: `page`, `pageSize`, `userId`, `q` (title search). |
| GET    | `/posts/:id`    | Single post **enriched with its author and comments**. |

**Paginated response shape** (`/posts`):

```json
{
  "data": [ { "id": 1, "userId": 1, "title": "…", "body": "…" } ],
  "pagination": { "page": 1, "pageSize": 8, "total": 100, "totalPages": 13 }
}
```

**Error shape** (consistent across all failures):

```json
{ "error": { "code": "POST_NOT_FOUND", "message": "Post 9999 not found" } }
```

| Status | When |
| ------ | ---- |
| 400    | Invalid id or malformed param (`INVALID_ID`). |
| 404    | Unknown resource id / unmatched route. |
| 502    | Upstream failure or timeout (`UPSTREAM_UNAVAILABLE`). |
| 500    | Unexpected server error. |

---

## Architecture decisions & tradeoffs

**Backend-for-frontend, not a thin pass-through.** The backend resolves
relationships server-side (post → author + comments in parallel via
`Promise.all`). The alternative — letting the frontend make 3 calls and stitch
the data — would push orchestration into the UI and triple the round-trips.
Tradeoff: the backend is slightly more coupled to the frontend's needs, which is
the explicit point of a BFF.

**In-memory cache over Redis.** The brief asks to avoid hammering the upstream;
it doesn't ask for a distributed cache. A dependency-free TTL `Map` is enough,
trivial to reason about, and its `get/set/getOrSet` surface maps 1:1 onto Redis
if we ever scale horizontally. Tradeoff: the cache is per-process and lost on
restart — acceptable here, a deliberate non-goal.

**Pagination done in the backend, in memory.** JSONPlaceholder has no real
pagination, so we fetch the full (cached) collection and slice it. The public
API contract (`page`/`pageSize`/`total`/`totalPages`) is what a real DB-backed
service would expose, so swapping the data source later wouldn't change the
frontend. Tradeoff: wouldn't scale to millions of rows — but that's a property
of the upstream, not our design.

**Errors are typed and centralised.** A single `ApiError` class carries an HTTP
status + machine code; one error-handling middleware turns anything thrown into
the same JSON shape. The frontend can therefore handle every failure uniformly.

**Upstream timeout via `AbortController`.** A slow upstream can't hang our event
loop — requests abort after a configurable timeout and surface as a clean 502.

**TypeScript end-to-end.** The domain types are mirrored on both sides, so a
shape change is a compile error rather than a runtime surprise. Tradeoff: the
two type definitions are duplicated rather than shared via a monorepo package —
a reasonable simplification at this size.

**Debounced search.** The posts search debounces input (300 ms) before calling
the API, avoiding a request per keystroke.

---

## Testing

```bash
cd backend && npm test
```

Covers:

- **Cache unit tests** — hit/miss, TTL expiry, `getOrSet` calls the producer only on a miss.
- **API integration tests** (Supertest, upstream mocked) — pagination maths,
  `userId` filtering, post enrichment, invalid-id → 400, unknown route → 404.

CI (`.github/workflows/ci.yml`) runs typecheck + tests for the backend and a
production build for the frontend on every push and PR.

---

## Project structure

```
.
├── backend/
│   └── src/
│       ├── index.ts            # server bootstrap
│       ├── app.ts              # Express app (exported for tests)
│       ├── config.ts           # env-driven config
│       ├── cache.ts            # TTL cache
│       ├── upstream.ts         # JSONPlaceholder client (cache + timeout)
│       ├── types.ts            # domain types
│       ├── middleware/errorHandler.ts
│       ├── routes/             # users.routes, posts.routes
│       ├── services/           # users.service, posts.service (enrichment)
│       └── __tests__/api.test.ts
├── frontend/
│   └── src/
│       ├── api/client.ts       # typed API wrapper
│       ├── context/ThemeContext.tsx   # dark mode
│       ├── components/         # Navbar, SearchBar, Pagination, Spinner, ErrorMessage
│       └── pages/              # Posts (feed), PostDetail, Users, UserDetail
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## What I'd do next

Given more time, in rough priority order:

1. **React Query** on the frontend to dedupe requests, cache and handle loading/
   error states declaratively (currently done manually with `useState`/`useEffect`).
2. **Shared types package** so backend and frontend import one source of truth.
3. **Request-coalescing** in the cache (a "stampede lock") so concurrent misses
   for the same key trigger a single upstream call.
4. **Frontend tests** (React Testing Library) for the pages.
5. **Observability** — structured logs + a `/metrics` endpoint.

---

## Bonus checklist

- [x] Unit / integration tests (backend)
- [x] Containerisation (Docker + docker-compose)
- [x] Dark mode / theming
- [x] CI via GitHub Actions
- [ ] Deployed live demo *(instructions ready; see below)*
- [ ] Auth on a route *(see "What I'd do next")*

> **Deploying:** the frontend is a static Vite build (deploy to Vercel/Netlify,
> set `VITE_API_URL` to the backend origin). The backend runs anywhere Node 22
> runs (Render/Railway/Fly). Both Dockerfiles are production-ready.
