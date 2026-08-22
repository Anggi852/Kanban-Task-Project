/**
 * Demo seed — provisions a single demonstration account with one board that
 * tells the story of TaskFlow's own Scrum-style development. Intended for
 * thesis / final-project presentations.
 *
 * Run:
 *   bun run db:seed
 *   bunx prisma db seed
 *
 * Login:
 *   email:    demo@taskflow.app
 *   password: Demo123!
 */

import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import type { TaskPriority, ColumnType } from '../src/generated/prisma/enums'

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'] as string,
})
const prisma = new PrismaClient({ adapter })

const DEMO_EMAIL = 'demo@taskflow.app'
const DEMO_PASSWORD = 'Demo123!'
const DEMO_NAME = 'Demo Student'
const BOARD_NAME = 'TaskFlow — Final Project Sprint Board'

// "Today" anchor (server local time). Past offsets land before, future offsets after.
const TODAY = new Date()
TODAY.setHours(9, 0, 0, 0)

function daysFromToday(offsetDays: number): Date {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + offsetDays)
  return d
}

interface SeedTask {
  title: string
  description: string
  priority: TaskPriority
  basePriority?: TaskPriority
  /** Days from today. Negative = past, positive = future. */
  createdOffset: number
  /** Days from today, only relevant for tasks in DONE — when it landed in Done. */
  completedOffset?: number
  dueOffset?: number | null
}

// ─── Backlog ─────────────────────────────────────────────────────────────────
// Future Scrum increments — sprint backlog & product backlog items the student
// can talk about as "next iterations" during their defense.
const TODO_TASKS: SeedTask[] = [
  {
    title: 'Add task labels and multi-label filtering',
    description:
      'Introduce a Label model and allow attaching multiple labels per task. Update board filters to AND/OR across labels.',
    priority: 'MEDIUM',
    createdOffset: -2,
    dueOffset: 21,
  },
  {
    title: 'Build calendar view for tasks with due dates',
    description:
      'Render tasks with dueDate on a month/week grid. Click a date to open the task modal in edit mode.',
    priority: 'MEDIUM',
    createdOffset: -4,
    dueOffset: 28,
  },
  {
    title: 'Implement subtasks / checklist per task',
    description:
      'Add a Subtask model (1:N to Task) with title and done flag. Show completion ratio on the task card.',
    priority: 'LOW',
    createdOffset: -6,
    dueOffset: 35,
  },
  {
    title: 'Board templates (Thesis, Coursework, Personal)',
    description:
      'Seed three opinionated column + task templates and offer them when creating a new board.',
    priority: 'LOW',
    createdOffset: -8,
    dueOffset: 42,
  },
  {
    title: 'End-to-end test suite with Playwright',
    description:
      'Cover the golden paths: register → create board → add task → drag across columns → see in analytics.',
    priority: 'MEDIUM',
    createdOffset: -10,
    dueOffset: 30,
  },
  {
    title: 'Export completed board to PDF',
    description:
      'Generate a printable summary of all DONE tasks in a board for academic record keeping.',
    priority: 'LOW',
    createdOffset: -3,
    dueOffset: null,
  },
  {
    title: 'Keyboard shortcuts for quick task creation',
    description:
      'Press "n" on the board page to open the new-task modal pre-targeted to the first column.',
    priority: 'LOW',
    createdOffset: -5,
    dueOffset: null,
  },
  {
    title: 'Soft-delete and board archiving',
    description:
      'Add archivedAt to Board. Hide archived boards from the main listing but make them browsable from a "Archive" section.',
    priority: 'LOW',
    createdOffset: -7,
    dueOffset: null,
  },
]

// ─── In progress ─────────────────────────────────────────────────────────────
// Active sprint items — what the student is presenting as "this sprint".
const DOING_TASKS: SeedTask[] = [
  {
    title: 'Polish responsive layouts on mobile breakpoints',
    description:
      'Audit dashboard, kanban, analytics and activities pages at <640px. Fix horizontal overflow and sticky-header overlap.',
    priority: 'MEDIUM',
    createdOffset: -5,
    dueOffset: 5,
  },
  {
    title: 'Write thesis chapter on system architecture',
    description:
      'Document the NestJS modular monolith, Prisma data model, JWT + httpOnly cookie auth, and Nuxt SPA decisions.',
    priority: 'HIGH',
    createdOffset: -8,
    dueOffset: 7,
  },
  {
    title: 'Prepare slide deck for final defense',
    description:
      'Tell the story across problem → approach → architecture → demo → reflection. Mirror the boards UI for the demo screens.',
    priority: 'HIGH',
    basePriority: 'MEDIUM',
    createdOffset: -3,
    dueOffset: 4,
  },
  {
    title: 'Record demo video walkthrough (3 min)',
    description:
      'Cover login, board creation, drag-and-drop, analytics, and activity log. Quiet voiceover, no music.',
    priority: 'MEDIUM',
    createdOffset: -2,
    dueOffset: 10,
  },
]

// ─── Done ────────────────────────────────────────────────────────────────────
// Completed Scrum work — the actual development story. Ordered roughly oldest
// → newest by completedOffset.
const DONE_TASKS: SeedTask[] = [
  {
    title: 'Bootstrap monorepo: NestJS backend + Nuxt 4 frontend',
    description:
      'Scaffold backend with NestJS 11, frontend with Nuxt 4, shared workspaces. Configure ports 8000 / 3000.',
    priority: 'HIGH',
    createdOffset: -110,
    completedOffset: -108,
  },
  {
    title: 'Provision PostgreSQL 18 under Podman in WSL',
    description:
      'Run a postgres:18-alpine container, set up DATABASE_URL, smoke-test Prisma connectivity.',
    priority: 'HIGH',
    createdOffset: -108,
    completedOffset: -106,
  },
  {
    title: 'Design ERD: users, boards, columns, tasks, activities',
    description:
      'Model relationships and cascade rules. Decide on ColumnType enum so analytics survive column renames.',
    priority: 'HIGH',
    createdOffset: -106,
    completedOffset: -103,
  },
  {
    title: 'Author Prisma schema and run initial migration',
    description:
      'Translate the ERD into schema.prisma with uuid primary keys, indexes, and onDelete rules.',
    priority: 'HIGH',
    createdOffset: -104,
    completedOffset: -101,
  },
  {
    title: 'JWT authentication module (register, login, refresh)',
    description:
      'Implement password hashing with bcrypt, access/refresh token generation, and rotating refresh tokens.',
    priority: 'HIGH',
    createdOffset: -100,
    completedOffset: -94,
  },
  {
    title: 'Google OAuth 2.0 sign-in flow',
    description:
      'Wire passport-google-oauth20 and provision local accounts on first login. Tokens issued identically to local auth.',
    priority: 'MEDIUM',
    createdOffset: -95,
    completedOffset: -90,
  },
  {
    title: 'Migrate auth to httpOnly cookies (security hardening)',
    description:
      'Backend sets access_token + refresh_token as httpOnly cookies. Frontend stops touching localStorage entirely.',
    priority: 'HIGH',
    createdOffset: -90,
    completedOffset: -85,
  },
  {
    title: 'Boards module: CRUD + default columns on create',
    description:
      'Every new board materialises Todo / In Progress / Done columns in one transaction.',
    priority: 'HIGH',
    createdOffset: -84,
    completedOffset: -80,
  },
  {
    title: 'Columns module with position-aware reorder',
    description:
      'Reorder transaction atomically shifts neighbouring positions. Guarded by ownership checks.',
    priority: 'MEDIUM',
    createdOffset: -80,
    completedOffset: -76,
  },
  {
    title: 'Tasks module: CRUD, move across columns, reorder',
    description:
      'Cross-column move adjusts both lists in one transaction. Reorder clamps positions within column bounds.',
    priority: 'HIGH',
    createdOffset: -75,
    completedOffset: -68,
  },
  {
    title: 'Activity log for audit trail',
    description:
      'Persist TASK_CREATED / UPDATED / MOVED / REORDERED / DELETED events with JSON metadata per action type.',
    priority: 'MEDIUM',
    createdOffset: -70,
    completedOffset: -65,
  },
  {
    title: 'Analytics endpoints: summary, trend, distribution',
    description:
      'Trend bucketed by activity log (not task.updatedAt) and timezone-aware via ?tz=. Distribution grouped by ColumnType.',
    priority: 'MEDIUM',
    createdOffset: -65,
    completedOffset: -55,
  },
  {
    title: 'Deadline-based priority auto-escalation job',
    description:
      'Scheduled job raises effective priority as dueDate approaches, while preserving basePriority.',
    priority: 'MEDIUM',
    createdOffset: -55,
    completedOffset: -48,
  },
  {
    title: 'Frontend visual system: Fraunces + Geist editorial design',
    description:
      'Tailwind tokens for canvas / surface / ink / accent. Optical-sized headings, grain texture, eyebrow labels.',
    priority: 'MEDIUM',
    createdOffset: -50,
    completedOffset: -42,
  },
  {
    title: 'Auth pages (login, register) with cookie-only store',
    description:
      'Pinia auth store reads /users/me. Middleware/plugin coordination prevents flashes through /login on refresh.',
    priority: 'HIGH',
    createdOffset: -48,
    completedOffset: -40,
  },
  {
    title: 'Dashboard layout: sidebar, header, dark mode toggle',
    description:
      'Color-mode composable persists to localStorage and applies before paint to avoid the FOUC.',
    priority: 'MEDIUM',
    createdOffset: -45,
    completedOffset: -38,
  },
  {
    title: 'Boards listing page with create / rename / delete',
    description:
      'Search-as-you-type filter, hover-revealed dropdown menu, destructive delete confirmation dialog.',
    priority: 'MEDIUM',
    createdOffset: -40,
    completedOffset: -34,
  },
  {
    title: 'Kanban board detail page with drag-and-drop',
    description:
      'vue-draggable-plus for task + column DnD. Optimistic UI, backend reconciles positions with refetch-on-fail.',
    priority: 'HIGH',
    createdOffset: -38,
    completedOffset: -28,
  },
  {
    title: 'Task modal: create / edit with priority, due date, notes',
    description:
      'Reactive form with client-side validation. Edit mode includes a delete action with confirmation.',
    priority: 'MEDIUM',
    createdOffset: -32,
    completedOffset: -25,
  },
  {
    title: 'Analytics page: stats, trend chart, status distribution',
    description:
      'Chart.js line + doughnut, palette-aligned dark mode, board scope and range filters.',
    priority: 'MEDIUM',
    createdOffset: -25,
    completedOffset: -18,
  },
  {
    title: 'Activities timeline with insight cards and heatmap',
    description:
      'Streak, busiest day, action mix, 8-week heatmap. Filter chips by action type.',
    priority: 'LOW',
    createdOffset: -18,
    completedOffset: -10,
  },
  {
    title: 'Profile page with name change and password rotation',
    description:
      'PATCH /users/me + POST /users/me/password (revokes other sessions on success). Identity card sidebar.',
    priority: 'MEDIUM',
    createdOffset: -15,
    completedOffset: -8,
  },
  {
    title: 'Unit tests for backend service modules',
    description:
      'Jest specs for auth, boards, columns, tasks, analytics services. Mock Prisma client per test.',
    priority: 'MEDIUM',
    createdOffset: -12,
    completedOffset: -6,
  },
  {
    title: 'OpenAPI / Swagger docs at /api',
    description:
      'Annotate controllers and DTOs with @nestjs/swagger. Bearer auth scheme for easy manual testing.',
    priority: 'LOW',
    createdOffset: -10,
    completedOffset: -4,
  },
  {
    title: 'Docker compose: nginx + frontend + backend + postgres',
    description:
      'Single-host deployable stack. Nginx strips /api before proxying to NestJS, serves Nuxt over the same origin.',
    priority: 'MEDIUM',
    createdOffset: -8,
    completedOffset: -2,
  },
]

async function main() {
  console.log('🌱 Seeding TaskFlow demo data…')

  const saltRound = Number(process.env['SALT_ROUND'] ?? 10)
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, saltRound)

  // Upsert demo user (idempotent on email)
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password: passwordHash, name: DEMO_NAME, provider: 'local' },
    create: {
      email: DEMO_EMAIL,
      password: passwordHash,
      name: DEMO_NAME,
      provider: 'local',
    },
  })
  console.log(`  · user upserted: ${user.email}`)

  // Wipe existing boards + cascade (columns, tasks, activities) for a clean slate
  const wiped = await prisma.board.deleteMany({ where: { userId: user.id } })
  if (wiped.count) console.log(`  · wiped ${wiped.count} previous board(s)`)

  // Create board with the three default columns
  const board = await prisma.board.create({
    data: {
      name: BOARD_NAME,
      userId: user.id,
      columns: {
        create: [
          { name: 'Backlog', type: 'TODO', position: 0 },
          { name: 'In progress', type: 'IN_PROGRESS', position: 1 },
          { name: 'Done', type: 'DONE', position: 2 },
        ],
      },
    },
    include: { columns: { orderBy: { position: 'asc' } } },
  })
  const [todoCol, doingCol, doneCol] = board.columns
  if (!todoCol || !doingCol || !doneCol) {
    throw new Error('Default columns failed to materialise')
  }
  console.log(`  · board "${board.name}" created`)

  // Helper that inserts a task + its activity records, returning the task
  async function insertTask(
    column: { id: string; type: ColumnType },
    spec: SeedTask,
    position: number,
  ) {
    const createdAt = daysFromToday(spec.createdOffset)
    const dueDate =
      spec.dueOffset == null ? null : daysFromToday(spec.dueOffset)

    const task = await prisma.task.create({
      data: {
        columnId: column.id,
        title: spec.title,
        description: spec.description,
        priority: spec.priority,
        basePriority: spec.basePriority ?? spec.priority,
        position,
        dueDate,
        createdAt,
        updatedAt: createdAt,
      },
    })

    // TASK_CREATED activity at task creation time
    await prisma.activity.create({
      data: {
        boardId: board.id,
        taskId: task.id,
        action: 'TASK_CREATED',
        createdAt,
        metadata: { columnId: column.id, title: task.title },
      },
    })

    // If task ended up in DONE, record a TASK_MOVED into Done on completedOffset
    if (column.type === 'DONE' && spec.completedOffset != null) {
      const movedAt = daysFromToday(spec.completedOffset)
      await prisma.activity.create({
        data: {
          boardId: board.id,
          taskId: task.id,
          action: 'TASK_MOVED',
          createdAt: movedAt,
          metadata: {
            fromColumnId: todoCol.id,
            toColumnId: column.id,
            fromPosition: 0,
            toPosition: position,
          },
        },
      })
    }

    // If task is currently in In Progress, also record a TASK_MOVED out of Todo
    if (column.type === 'IN_PROGRESS') {
      const movedAt = daysFromToday(spec.createdOffset + 1)
      await prisma.activity.create({
        data: {
          boardId: board.id,
          taskId: task.id,
          action: 'TASK_MOVED',
          createdAt: movedAt,
          metadata: {
            fromColumnId: todoCol.id,
            toColumnId: column.id,
            fromPosition: 0,
            toPosition: position,
          },
        },
      })
    }
  }

  let pos = 0
  for (const spec of TODO_TASKS) {
    await insertTask(todoCol, spec, pos++)
  }
  console.log(`  · ${TODO_TASKS.length} tasks added to Backlog`)

  pos = 0
  for (const spec of DOING_TASKS) {
    await insertTask(doingCol, spec, pos++)
  }
  console.log(`  · ${DOING_TASKS.length} tasks added to In progress`)

  pos = 0
  for (const spec of DONE_TASKS) {
    await insertTask(doneCol, spec, pos++)
  }
  console.log(`  · ${DONE_TASKS.length} tasks added to Done`)

  console.log('\n✅ Seed complete.')
  console.log(`   Login at /login with:`)
  console.log(`     email:    ${DEMO_EMAIL}`)
  console.log(`     password: ${DEMO_PASSWORD}`)
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
