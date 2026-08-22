<script setup lang="ts">
import {
  BookOpenText,
  NotebookPen,
  FlaskConical,
  CalendarDays,
  Flag,
  CheckCircle2,
  GraduationCapIcon,
} from 'lucide-vue-next'

const madeFor = [
  { icon: GraduationCapIcon, label: 'Coursework & deadlines' },
  { icon: BookOpenText, label: 'Exam prep' },
  { icon: NotebookPen, label: 'Reading lists' },
  { icon: FlaskConical, label: 'Lab reports & theses' },
]

const focusedTask = {
  title: 'Finish CS-401 problem set',
  due: 'Wed, Jun 11',
  priority: 'High',
  description:
    'Three proofs and one runtime analysis. Show every step — partial credit lives in the margins.',
  subtasks: [
    { label: 'Review lecture 9 notes', done: true },
    { label: 'Solve problems 1–3', done: true },
    { label: 'Write up the analysis', done: false },
  ],
}

// fake-but-deterministic progress arc — 7 of 12 today
const total = 12
const completed = 7
const radius = 38
const circumference = 2 * Math.PI * radius
const dashOffset = circumference * (1 - completed / total)
</script>

<template>
  <section class="relative overflow-hidden grain">
    <!-- top hairline -->
    <div
      class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-border-dark" />

    <div class="mx-auto max-w-6xl px-6 pt-24 pb-32 sm:pt-32">
      <div class="grid lg:grid-cols-[1.08fr_1fr] gap-14 items-start">
        <!-- LEFT: editorial column -->
        <div class="stagger">
          <div class="flex items-center gap-3">
            <span class="h-px w-8 bg-ink/40 dark:bg-ink-dark/40" />
            <span class="eyebrow">Vol. 01 · For the Busy Student</span>
          </div>

          <h1
            class="mt-7 font-display text-[2.75rem] sm:text-[3.75rem] lg:text-[4.25rem] font-light leading-[1.02] tracking-display-tight text-ink dark:text-ink-dark">
            <span class="block">A quieter way</span>
            <span class="block">to <span class="display-em">move</span> your work</span>
            <span class="block">forward.</span>
          </h1>

          <p class="mt-7 text-base sm:text-lg text-ink-muted max-w-xl leading-relaxed">
            TaskFlow is a calm, focused Kanban workflow for students juggling
            <span class="text-ink dark:text-ink-dark">classes, assignments, and exams</span>
            in the same week. Made for one person — you. No teams, no pings, just your semester, sorted.
          </p>

          <div class="mt-9 flex flex-wrap items-center gap-3">
            <NuxtLink to="/register">
              <AppButton variant="primary" size="lg">Plan my week</AppButton>
            </NuxtLink>
            <NuxtLink to="/login"
              class="group inline-flex items-center gap-2 text-sm font-medium text-ink dark:text-ink-dark">
              <span
                class="border-b border-ink/30 group-hover:border-ink dark:border-ink-dark/30 dark:group-hover:border-ink-dark transition-colors pb-px">
                I already have an account
              </span>
              <span aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">→</span>
            </NuxtLink>
          </div>

          <!-- "Made for" chip row -->
          <div class="mt-12">
            <p class="eyebrow">Made for</p>
            <ul class="mt-3 flex flex-wrap gap-2">
              <li v-for="(item, idx) in madeFor" :key="item.label" :class="[
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors duration-300 ease-out-expo',
                idx === 0
                  ? 'border-ink/60 bg-ink text-canvas dark:bg-ink-dark dark:text-canvas-dark dark:border-ink-dark/60'
                  : 'border-border text-ink dark:border-border-dark dark:text-ink-dark hover:border-ink/40 dark:hover:border-ink-dark/40',
              ]">
                <component :is="item.icon" class="h-3.5 w-3.5" />
                <span>{{ item.label }}</span>
              </li>
            </ul>
          </div>

          <dl class="mt-10 grid grid-cols-3 gap-6 max-w-md border-t border-border dark:border-border-dark pt-6">
            <div>
              <dt class="eyebrow">Boards</dt>
              <dd class="mt-1 font-display text-2xl text-ink dark:text-ink-dark tabular">∞</dd>
            </div>
            <div>
              <dt class="eyebrow">Setup</dt>
              <dd class="mt-1 font-display text-2xl text-ink dark:text-ink-dark tabular">30s</dd>
            </div>
            <div>
              <dt class="eyebrow">Pings</dt>
              <dd class="mt-1 font-display text-2xl text-ink dark:text-ink-dark tabular">0</dd>
            </div>
          </dl>
        </div>

        <!-- RIGHT: layered composition -->
        <div class="relative hidden lg:block" aria-hidden="true">
          <!-- vertical editorial spine -->
          <div class="absolute -left-10 top-2 bottom-2 flex flex-col items-center justify-between">
            <span class="eyebrow rotate-180" style="writing-mode: vertical-rl;">Issue 01 · Taskflow</span>
            <span class="h-12 w-px bg-border dark:bg-border-dark" />
          </div>

          <!-- LEFT-of-kanban: editorial margin pull-quote -->
          <div class="absolute top-6 -left-2 w-44 rotate-[-3.5deg] origin-top-left">
            <p class="eyebrow">A note</p>
            <p class="mt-2 font-display text-[1.35rem] leading-[1.15] text-ink dark:text-ink-dark">
              <span class="display-em">"</span>Finally, a planner that survives finals week.<span
                class="display-em">"</span>
            </p>
            <div class="mt-3 flex items-center gap-2">
              <span class="h-px w-8 bg-ink/40 dark:bg-ink-dark/40" />
              <span class="eyebrow">A junior · week 9</span>
            </div>
          </div>

          <!-- LEFT-of-kanban (lower): small caption strip -->
          <div class="absolute top-[19rem] -left-4 w-40 rotate-[-2deg]">
            <div
              class="rounded-card border border-dashed border-border dark:border-border-dark bg-canvas/60 dark:bg-canvas-dark/60 px-3 py-2.5">
              <p class="eyebrow">Fig. 01</p>
              <p class="mt-1 text-[11px] leading-snug text-ink-muted">
                Three columns. Drag a card right as the week moves forward.
              </p>
            </div>
          </div>

          <!-- background blur wash -->
          <div
            class="absolute -inset-10 rounded-[36px] bg-gradient-to-tr from-accent-soft via-transparent to-warning-soft opacity-70 dark:from-accent-softDark dark:to-warning-softDark dark:opacity-40 blur-3xl" />

          <!-- main tilted kanban -->
          <div
            class="relative grid grid-cols-3 gap-3 p-3 rounded-modal bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-elevated rotate-[-1.5deg] origin-bottom-left transition-transform duration-700 ease-out-expo hover:rotate-0">
            <HomeColumnPreview title="Todo" :tasks="['Read chapter 7', 'CS-401 problem set', 'Review flashcards']"
              tone="neutral" />
            <HomeColumnPreview title="Doing" :tasks="['Lab report draft', 'Study for midterm']" tone="warning" />
            <HomeColumnPreview title="Done" :tasks="['Submit essay', 'Register for finals']" tone="success" />
          </div>

          <!-- TOP-RIGHT: focused-task card (floats above kanban) -->
          <div
            class="absolute -top-10 -right-4 w-72 rounded-card bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-elevated rotate-[2.5deg] origin-top-right p-4">
            <div class="flex items-center justify-between">
              <span class="eyebrow">In focus</span>
              <span
                class="inline-flex items-center gap-1 rounded-full bg-danger/10 text-danger px-2 py-0.5 text-[10px] font-medium">
                <Flag class="h-2.5 w-2.5" />
                {{ focusedTask.priority }}
              </span>
            </div>
            <p class="mt-2 font-display text-lg leading-tight text-ink dark:text-ink-dark">
              {{ focusedTask.title }}
            </p>
            <p class="mt-1.5 text-xs leading-relaxed text-ink-muted">
              {{ focusedTask.description }}
            </p>
            <ul class="mt-3 space-y-1.5">
              <li v-for="sub in focusedTask.subtasks" :key="sub.label" class="flex items-center gap-2 text-xs">
                <span :class="[
                  'flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border',
                  sub.done
                    ? 'bg-ink border-ink text-canvas dark:bg-ink-dark dark:border-ink-dark dark:text-canvas-dark'
                    : 'border-border dark:border-border-dark',
                ]">
                  <CheckCircle2 v-if="sub.done" class="h-2.5 w-2.5" />
                </span>
                <span :class="[
                  'text-ink dark:text-ink-dark',
                  sub.done ? 'line-through text-ink-muted' : '',
                ]">
                  {{ sub.label }}
                </span>
              </li>
            </ul>
            <div class="mt-3 flex items-center gap-1.5 text-[11px] text-ink-muted">
              <CalendarDays class="h-3 w-3" />
              <span class="tabular">{{ focusedTask.due }}</span>
            </div>
          </div>

          <!-- BOTTOM-LEFT: "Today" annotation -->
          <div
            class="absolute -bottom-8 -left-6 max-w-[15rem] rounded-card bg-surface dark:bg-surface-dark border border-border dark:border-border-dark px-4 py-3 shadow-card rotate-[-2.5deg]">
            <p class="eyebrow">Today</p>
            <p class="mt-1 text-sm text-ink dark:text-ink-dark">
              <span class="font-display italic">Three</span> assignments turned in.
            </p>
          </div>

          <!-- BOTTOM-RIGHT: progress arc -->
          <div
            class="absolute -bottom-10 -right-2 w-44 rounded-card bg-canvas dark:bg-canvas-dark border border-border dark:border-border-dark p-4 shadow-card rotate-[1.5deg]">
            <div class="flex items-center justify-between">
              <span class="eyebrow">Today's flow</span>
            </div>
            <div class="mt-2 flex items-center gap-3">
              <svg width="60" height="60" viewBox="0 0 90 90" class="-rotate-90">
                <circle cx="45" cy="45" :r="radius" fill="none" class="stroke-border dark:stroke-border-dark"
                  stroke-width="6" />
                <circle cx="45" cy="45" :r="radius" fill="none" class="stroke-accent dark:stroke-accent-ink"
                  stroke-width="6" stroke-linecap="round" :stroke-dasharray="circumference"
                  :stroke-dashoffset="dashOffset" />
              </svg>
              <div>
                <p class="font-display text-2xl leading-none text-ink dark:text-ink-dark tabular">
                  {{ completed }}<span class="text-ink-muted text-lg">/{{ total }}</span>
                </p>
                <p class="mt-1 text-[10px] text-ink-muted">tasks done</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- bottom hairline -->
    <div
      class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-border-dark" />
  </section>
</template>
