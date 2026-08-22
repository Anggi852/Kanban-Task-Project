<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const stages = [
  {
    name: 'Todo',
    description: 'Capture the work that\'s waiting. New ideas, course tasks, half-formed thoughts.',
    tone: 'neutral' as const,
  },
  {
    name: 'Doing',
    description: 'Move the few things you can actually finish today. Keep this column short.',
    tone: 'warning' as const,
  },
  {
    name: 'Done',
    description: 'Watch progress accumulate. The visible record of a productive week.',
    tone: 'success' as const,
  },
]

const dots = {
  neutral: 'bg-ink-muted/40',
  warning: 'bg-warning',
  success: 'bg-success',
}
</script>

<template>
  <section>
    <div class="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div class="max-w-2xl">
        <h2 class="text-3xl font-semibold tracking-tight text-ink dark:text-ink-dark">
          A simple workflow that scales with you.
        </h2>
        <p class="mt-3 text-ink-muted">
          Boards start with three columns. Add your own, rename them, reorder
          them — whatever fits the way you actually work.
        </p>
      </div>

      <ol class="mt-10 flex flex-col sm:flex-row items-stretch gap-4">
        <li
          v-for="(stage, idx) in stages"
          :key="stage.name"
          class="flex-1 flex items-stretch gap-4"
        >
          <AppCard class="flex-1 flex flex-col">
            <div class="flex items-center gap-2">
              <span :class="['h-1.5 w-1.5 rounded-full', dots[stage.tone]]" />
              <span class="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Stage {{ idx + 1 }}
              </span>
            </div>
            <h3 class="mt-3 text-base font-semibold text-ink dark:text-ink-dark">
              {{ stage.name }}
            </h3>
            <p class="mt-2 text-sm text-ink-muted leading-relaxed">
              {{ stage.description }}
            </p>
          </AppCard>

          <ArrowRight
            v-if="idx < stages.length - 1"
            class="hidden sm:block h-4 w-4 self-center text-ink-muted flex-shrink-0"
            aria-hidden="true"
          />
        </li>
      </ol>
    </div>
  </section>
</template>
