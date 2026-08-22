<script setup lang="ts">
import { KanbanSquare, ListTodo, BarChart3, History } from 'lucide-vue-next'

const features = [
  {
    icon: KanbanSquare,
    title: 'Kanban Board',
    body: 'Drag tasks across columns. Watch your week move from idea to shipped.',
  },
  {
    icon: ListTodo,
    title: 'Task Management',
    body: 'Title, description, priority and due date — the essentials, nothing extra.',
  },
  {
    icon: BarChart3,
    title: 'Productivity Analytics',
    body: 'Track your completion rate and see your finishing-rhythm over time.',
  },
  {
    icon: History,
    title: 'Activity History',
    body: 'Replay what you actually did this week. A quiet log, not a feed.',
  },
]
</script>

<template>
  <section class="border-t border-border dark:border-border-dark bg-canvas dark:bg-canvas-dark">
    <div class="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div class="max-w-2xl">
        <h2 class="text-3xl font-semibold tracking-tight text-ink dark:text-ink-dark">
          Just enough to stay focused.
        </h2>
        <p class="mt-3 text-ink-muted">
          A small set of carefully chosen features. Everything you need to plan
          and finish work — nothing that gets in the way.
        </p>
      </div>

      <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppCard v-for="f in features" :key="f.title">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-button bg-accent-soft text-accent dark:bg-accent-softDark">
            <component :is="f.icon" class="h-4 w-4" />
          </div>
          <h3 class="mt-4 text-xl tracking-wide font-semibold text-ink dark:text-ink-dark">
            {{ f.title }}
          </h3>
          <p class="mt-1.5 text-sm text-ink-muted leading-relaxed">
            {{ f.body }}
          </p>
        </AppCard>
      </div>
    </div>
  </section>
</template>
