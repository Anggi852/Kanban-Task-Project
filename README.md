# TaskFlow — Kanban Task Tracking

A personal Kanban task tracker with a clean, focused workflow. Boards → columns → tasks, with drag-and-drop reordering, activity history, and per-user analytics. Ships as a monorepo with a NestJS API and a Nuxt SPA.

---

## Features

**Boards & workflow**
- Multi-board, per-user workspaces
- Custom columns per board (name, position, semantic type: `TODO` / `IN_PROGRESS` / `DONE`)
- Drag-and-drop task move + reorder, drag-and-drop column reorder
- Task fields: title, description, priority (`LOW` / `MEDIUM` / `HIGH`), due date

**Priority automation**
- Tasks carry both a user-set `basePriority` and an effective `priority`
- A scheduled job auto-escalates `priority` as the due date approaches, without lowering it below what the user set
- The gap between `priority` and `basePriority` surfaces auto-raised items in the UI

**Activity & analytics**
- Every create / update / move / reorder / delete is recorded as an `Activity` with a JSON metadata payload
- Per-board activity feed and per-user activity feed
- Analytics endpoints: summary counters, completion trend, status distribution
- Activity heatmap and charts on the frontend

**Auth**
- Local email + password (bcrypt) with JWT access + refresh token pair
- Refresh-token rotation with per-token revoke, IP + device recorded
- Google OAuth 2.0 (accounts are provider-tagged; password login is rejected for OAuth users)
- Tokens returned in the response body **and** set as `httpOnly` cookies (`access_token`, `refresh_token`)

**Ops**
- OpenAPI/Swagger docs auto-generated at `/doc`
- `/health` endpoint runs a live DB check
- Docker + Podman compatible compose files for both dev and prod

---

## Tech stack

| Layer            | Choice                                                    |
| ---------------- | --------------------------------------------------------- |
| Backend runtime  | Bun 1.x                                                   |
| Backend framework| NestJS 11                                                 |
| ORM              | Prisma 7 (`@prisma/adapter-pg`, generated client under `src/generated/prisma`) |
| Database         | PostgreSQL 18                                             |
| Auth             | Passport (local, JWT, google-oauth20) + `@nestjs/jwt`     |
| API docs         | `@nestjs/swagger`                                         |
| Scheduling       | `@nestjs/schedule` (priority escalation)                  |
| Frontend         | Nuxt 4 + Vue 3 (SPA mode, landing page is SSR)            |
| State            | Pinia                                                     |
| Styling          | Tailwind CSS, `@nuxt/image`, dark mode via localStorage   |
| Charts / DnD     | Chart.js + vue-chartjs, vue-draggable-plus                |
| Reverse proxy    | nginx (prod compose only)                                 |

---

## Repository layout

```
kanban_task_tracking_app/
├── backend/                    NestJS 11 API (bun)
│   ├── src/
│   │   ├── auth/               local + JWT + Google OAuth, refresh rotation
│   │   ├── users/              /users/me profile + password change
│   │   ├── boards/             board CRUD + reorder
│   │   ├── columns/            column CRUD + reorder
│   │   ├── task/               task CRUD, move, reorder, priority-escalation job
│   │   ├── activities/         per-board and per-user activity feeds
│   │   ├── analytics/          summary / trend / distribution
│   │   ├── health/             DB liveness check
│   │   ├── prisma/             PrismaService (pg adapter)
│   │   └── generated/prisma/   Prisma client output (do not edit)
│   ├── prisma/
│   │   ├── schema.prisma       User, RefreshToken, Board, Column, Task, Activity
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── test/                   e2e tests (jest)
│   ├── Dockerfile              production image (multi-stage, bun)
│   ├── Dockerfile.dev          dev image (watch mode)
│   └── entrypoint.sh           runs `prisma migrate deploy` then boots the app
│
├── frontend/                   Nuxt 4 SPA (bun)
│   ├── app/
│   │   ├── pages/              index, login, register, dashboard, boards/, profile, analytics, activities
│   │   ├── layouts/            dashboard, public
│   │   ├── components/         KanbanBoard, ColumnCard, TaskCard, charts, stats, activity feed, ...
│   │   ├── stores/             auth, boards, board, activities, analytics
│   │   ├── composables/        useApi, useColorMode, useSidebar
│   │   ├── middleware/         auth (guard), guest (redirect authed users)
│   │   └── plugins/            auth.client.ts (hydrate auth on boot)
│   ├── Dockerfile              production image (Nuxt SSR output on node:22)
│   └── Dockerfile.dev          dev image (bun + HMR)
│
├── nginx/                      reverse proxy config (prod compose)
├── compose.yml                 production stack (nginx + backend + frontend + postgres)
├── compose.override.yml        prod host-port override (Windows-friendly 8080)
├── compose.dev.yml             dev stack (direct ports, bind-mounted source)
├── .env.docker                 template for prod
├── .env.dev                    template for dev
└── scripts/                    setup helpers + docgen tooling
```

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.x (for local, non-docker runs)
- Docker **or** Podman with compose support (either works — see [compatibility notes](#docker-vs-podman))
- A PostgreSQL 18 instance if you don't want to run the DB via compose

### Option A — Full dev stack in containers (recommended)

Runs postgres + backend + frontend with source bind-mounted so your editor
(Neovim, VS Code, whatever) triggers hot reload inside the container.

```bash
cp .env.dev .env.development

# Docker
docker compose --env-file .env.development -f compose.dev.yml up

# Podman
podman compose --env-file .env.development -f compose.dev.yml up
```

Services will be at:
- Frontend: <http://localhost:3000>
- Backend:  <http://localhost:8000>
- Swagger:  <http://localhost:8000/doc>
- Postgres: `localhost:5432` (user `kanban`, db `kanban_dev`)

Prisma `migrate deploy` runs on backend container start. To generate a new
migration during dev:

```bash
docker compose -f compose.dev.yml exec backend bunx prisma migrate dev
```

### Option B — Local bun, external postgres

If you already have a Postgres running (e.g. Podman-in-WSL) and just want to
run backend + frontend on the host.

```bash
# Backend
cd backend
cp .env.example .env   # or write your own with DATABASE_URL etc.
bun install
bunx prisma migrate dev
bun run start:dev      # http://localhost:8000

# Frontend (in a second terminal)
cd frontend
bun install
bun run dev            # http://localhost:3000
```

### Option C — Production stack

Full nginx-fronted stack (browser talks to nginx on port 80 / 8080, nginx
proxies `/api` → backend, everything else → frontend).

```bash
./scripts/setup.sh          # generates .env from .env.docker, fills random secrets
# (Windows: .\scripts\setup.ps1)

docker compose up -d --build
```

Then open <http://localhost:8080> (or whatever `HTTP_PORT` you set).

---

## Environment variables

The dev and prod stacks read from different templates; keep them separate.

| Variable                 | Where used | Purpose                                                                 |
| ------------------------ | ---------- | ----------------------------------------------------------------------- |
| `POSTGRES_USER`          | postgres   | DB user                                                                 |
| `POSTGRES_PASSWORD`      | postgres   | DB password                                                             |
| `POSTGRES_DB`            | postgres   | DB name (`kanban_db` in prod, `kanban_dev` in dev)                      |
| `DATABASE_URL`           | backend    | Assembled from the three above in compose files                         |
| `PORT`                   | backend    | Backend listen port (8000)                                              |
| `JWT_SECRET`             | backend    | JWT signing key — generate with `openssl rand -hex 64`                  |
| `SALT_ROUND`             | backend    | bcrypt rounds (10 dev / 12 prod)                                        |
| `CORS_ORIGIN`            | backend    | Allowed browser origin                                                  |
| `GOOGLE_CLIENT_ID`       | backend    | Google OAuth client ID                                                  |
| `GOOGLE_CLIENT_SECRET`   | backend    | Google OAuth client secret                                              |
| `GOOGLE_CALLBACK_URL`    | backend    | Must match the URI registered in Google Cloud Console                   |
| `FRONTEND_URL`           | backend    | Where the OAuth callback redirects after login                          |
| `NUXT_API_BASE`          | frontend   | Server-side (SSR) API base — inside compose, `http://backend:8000`      |
| `NUXT_PUBLIC_API_BASE`   | frontend   | Browser-visible API base (`/api` in prod, `http://localhost:8000` dev)  |
| `HTTP_PORT`              | nginx      | Host port nginx binds to (prod only)                                    |

Dev-only: `BACKEND_PORT`, `FRONTEND_PORT`, `POSTGRES_PORT` in `.env.dev` let
you remap host ports if they collide with something else on your machine.

---

## API surface

Swagger UI: `GET /doc` (once the backend is running).

| Method  | Route                                      | Notes                              |
| ------- | ------------------------------------------ | ---------------------------------- |
| POST    | `/auth/register`                           |                                    |
| POST    | `/auth/login`                              |                                    |
| POST    | `/auth/refresh`                            | rotates the refresh token          |
| POST    | `/auth/logout`                             |                                    |
| GET     | `/auth/me`                                 | current user                       |
| GET     | `/auth/google`                             | start OAuth flow                   |
| GET     | `/auth/google/callback`                    | redirects to `${FRONTEND_URL}`     |
| GET/PATCH | `/users/me`                              | profile                            |
| POST    | `/users/me/password`                       | change password (local users only) |
| GET/POST | `/boards`                                 |                                    |
| GET/PATCH/DELETE | `/boards/:id`                     |                                    |
| POST    | `/boards/:id/reorder`                      | reorder columns within a board     |
| GET/POST/PATCH/DELETE | `/columns/:id`               |                                    |
| GET/POST | `/tasks`                                  |                                    |
| GET/PATCH/DELETE | `/tasks/:id`                      |                                    |
| POST    | `/tasks/:id/move`                          | move to another column             |
| POST    | `/tasks/:id/reorder`                       | reorder within a column            |
| GET     | `/boards/:boardId/activities`              | board activity feed                |
| GET     | `/activities`                              | current user's activity feed       |
| GET     | `/analytics/summary`                       |                                    |
| GET     | `/analytics/trend`                         | completion trend                   |
| GET     | `/analytics/distribution`                  | status distribution                |
| GET     | `/health`                                  | liveness + DB check                |

All routes except the `/auth/*` public ones and `/health` are guarded by
`JwtAuthGuard` (reads the `Authorization: Bearer <token>` header).

---

## Testing

Backend:

```bash
cd backend
bun run test          # unit
bun run test:e2e      # e2e (spins up a real DB per test — configure via test/setup-env.ts)
bun run test:cov      # coverage
bunx jest src/auth/auth.service.spec.ts   # a single file
```

---

## Docker vs Podman

Both compose files are written to work with either engine.

- Bind mounts use the `:z` shared-SELinux label. Podman on Fedora/RHEL needs
  this; Docker silently ignores it.
- No `container_name` on dev services, so `compose.yml` and `compose.dev.yml`
  can run side-by-side without name collisions.
- `deploy.resources.limits` in `compose.yml` is honored by Docker Swarm and
  ignored by plain `docker compose` and `podman compose` — treat those limits
  as documentation, not enforcement.
- Podman-in-WSL: file watchers need polling (already enabled via
  `CHOKIDAR_USEPOLLING=true` in the dev Dockerfiles and compose).

Rough equivalents:

| Task              | Docker                                    | Podman                                    |
| ----------------- | ----------------------------------------- | ----------------------------------------- |
| Dev up            | `docker compose -f compose.dev.yml up`    | `podman compose -f compose.dev.yml up`    |
| Prod up           | `docker compose up -d --build`            | `podman compose up -d --build`            |
| Shell in backend  | `docker compose … exec backend sh`        | `podman compose … exec backend sh`        |

---

## Database schema (quick reference)

- **User** — `id`, `email`, `password?`, `name?`, `provider` (`local` / `google`), `googleId?`, `avatarUrl?`
- **RefreshToken** — per-issued token, `revoked` flag, IP + device, 7-day expiry
- **Board** — user-owned, has many columns and activities
- **Column** — named + positioned + typed (`TODO` / `IN_PROGRESS` / `DONE`)
- **Task** — belongs to a column; effective `priority` + user-set `basePriority`; `dueDate?`
- **Activity** — action enum + JSON metadata; linked to a board (and optionally a task)

Cascade rules delete a user's boards, a board's columns, and a column's tasks together. Activities keep the board FK on task-delete (`SetNull` on `taskId`) so the audit trail survives.

---

## License

UNLICENSED — private project.
