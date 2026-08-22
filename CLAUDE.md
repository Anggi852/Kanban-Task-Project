# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Kanban task tracking app — monorepo with two workspaces:

- `backend/` — NestJS 11 REST API, port **8000** (runtime: bun)
- `frontend/` — Nuxt 4 / Vue 3 SPA, port **3000** (dev)

Infrastructure: PostgreSQL 18 running inside WSL, managed with Podman (also in WSL). Compose files (`compose.yml`) are planned for future use.

---

## Commands

### Backend (`cd backend`)

```bash
bun run start:dev      # watch mode
bun run build          # compile to dist/
bun run start:prod     # run compiled output with bun
bun run test           # unit tests (jest, rootDir: src)
bun run test:e2e       # e2e tests
bun run test:cov       # coverage
bun run lint           # eslint --fix
bun run format         # prettier --write
```

Run a single test file:

```bash
bunx jest src/auth/auth.service.spec.ts
```

Prisma (run from `backend/`):

```bash
bunx prisma migrate dev       # apply migrations & regenerate client
bunx prisma generate          # regenerate client only
bunx prisma studio            # GUI for the database
```

### Frontend (`cd frontend`)

```bash
bun run dev            # dev server (port 3000)
bun run build          # production build
bun run preview        # preview production build
```

### Infrastructure

PostgreSQL 18 runs directly inside WSL via Podman. Compose files are planned but not yet in active use.

```bash
# Run from within WSL
podman start <postgres-container>   # start PostgreSQL
podman stop <postgres-container>    # stop
```

---

## Backend architecture

### Module structure

- use layering architecture

```
src/
  app.module.ts         # root module — imports AuthModule, TaskModule, PrismaModule
  auth/                 # authentication feature module
    auth.controller.ts  # POST /auth/register, login, refresh, logout; GET /auth/me
    auth.service.ts     # business logic, token generation
    dto/                # LoginDTO, RegisterDTO, RefreshDto (class-validator)
    strategies/         # LocalStrategy, JwtStrategy, JwtAuthGuard
    decorator/          # @Cookie() param decorator (reads from req.cookies)
  task/                 # task CRUD feature module (routes not yet implemented)
  prisma/               # PrismaService wraps PrismaClient via @prisma/adapter-pg
  generated/prisma/     # Prisma client output (non-default location — do not edit)
```

### Auth flow

- **Register / Login** returns both `accessToken` and `refreshToken` in the response body **and** sets them as `httpOnly` cookies (`access_token`, `refresh_token`).
- **Protected routes** use `@UseGuards(JwtAuthGuard)` which reads the JWT from the `Authorization` header via `JwtStrategy`.
- **Refresh token rotation**: on `POST /auth/refresh`, the old DB record is deleted and a new pair is issued. Tokens expire 7 days from creation in the DB.
- **Google OAuth**: `GET /auth/google` starts the flow; `GET /auth/google/callback` (both guarded by `AuthGuard('google')`, see `strategies/google.strategy.ts`) resolves/creates the user, issues the same token pair + cookies, then redirects to `${FRONTEND_URL}/dashboard` (or `/login?error=oauth` on failure). OAuth accounts have a `null` `password` (`provider`/`googleId`/`avatarUrl` columns on `user`); password login and `changePassword` reject them.
- `@Cookie('key')` decorator (in `src/auth/decorator/cookie.decorator.ts`) extracts a named cookie from the request.

### Prisma

`PrismaService` uses `PrismaPg` adapter (connection-string based, no connection pool config). The generated client lives at `src/generated/prisma/` — set via `prisma.config.ts`, not the default `node_modules/.prisma`.

### Key env vars (backend `.env`)

| Variable               | Purpose                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`         | PostgreSQL connection string                                                                                             |
| `PORT`                 | Server port (default 3000, set to 8000 in .env)                                                                         |
| `JWT_SECRET`           | JWT signing secret — read by `src/auth/contants.ts` (`process.env.JWT_SECRET`)                                          |
| `SALT_ROUND`           | bcrypt salt rounds                                                                                                       |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID (from Google Cloud Console → Credentials → OAuth Client, type "Web application")                  |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                                                                                              |
| `GOOGLE_CALLBACK_URL`  | OAuth redirect URI — **must match the URI registered in Google Console**. Dev default `http://localhost:8000/auth/google/callback`; Docker `http://localhost/api/auth/google/callback` (nginx strips `/api`) |
| `FRONTEND_URL`         | Origin the OAuth callback redirects to after login. Dev default `http://localhost:3000`; Docker `http://localhost`      |

Google OAuth vars are read in `src/auth/contants.ts` (`googleOAuthConstants`). `GOOGLE_CALLBACK_URL` and `FRONTEND_URL` have dev defaults, so only the client ID/secret are strictly required for local dev. For Docker, all four are templated in `.env.docker` and wired into the `backend` service in `compose.yml`.

---

## Frontend architecture

Nuxt 4 with the `app/` directory layout:

```
app/
  pages/         # file-based routing (login, register, dashboard, index)
  stores/        # Pinia stores (auth.ts)
  middleware/    # route middleware (guest.ts — redirects authenticated users away from login)
```

### Auth store (`app/stores/auth.ts`)

Persists `accessToken`, `refreshToken`, and `user` to `localStorage`. `loadFromStorage()` must be called at app init (done in `guest.ts` middleware). The API base URL is `http://localhost:8000`, configured via `nuxt.config.ts` `runtimeConfig.public.apiBase`.

### Modules

- `@nuxtjs/tailwindcss` — styling
- `@pinia/nuxt` — state management (auto-imports stores)
- `@morev/vue-transitions` — animation components
- `@nuxt/image` — optimized images

---

## Database schema

Enums: `TaskStatus` (TODO, IN_PROGRESS, DONE), `TaskPriority` (LOW, MEDIUM, HIGH), `NotificationType` (DEADLINE_REMINDER, TASK_UPDATED).

Tables: `user`, `refresh_tokens` (has `revoked` flag, FK to user), `tasks` (FK to user with CASCADE delete), `notifications` (FK to user and optionally task).
