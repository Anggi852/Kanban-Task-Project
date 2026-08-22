<script setup lang="ts">
import { Compass, Gauge, Eye, Sparkles } from 'lucide-vue-next'

const benefits = [
  {
    icon: Compass,
    title: 'Better organization',
    body: 'One board per project. One column per stage. Nothing slips through.',
  },
  {
    icon: Gauge,
    title: 'Increased productivity',
    body: 'A short Doing column is a forcing function. Finish what you start.',
  },
  {
    icon: Eye,
    title: 'Progress visibility',
    body: 'Glance at a board and know exactly where the work stands.',
  },
  {
    icon: Sparkles,
    title: 'Simple workflow',
    body: 'No statuses, swimlanes, or epics. Just columns and cards.',
  },
]
</script>

<template>
  <section class="border-t border-border dark:border-border-dark bg-canvas dark:bg-canvas-dark">
    <div class="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div class="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:items-center">
        <div>
          <h2 class="text-3xl font-semibold tracking-tight text-ink dark:text-ink-dark">
            Built for the work only you can do.
          </h2>
          <p class="mt-3 text-ink-muted leading-relaxed">
            TaskFlow is single-player by design. No team setup, no inbox, no
            shared boards. The interface gets out of the way so you can think
            about the work — not the tool.
          </p>
        </div>

        <ul class="grid sm:grid-cols-2 gap-4">
          <li
            v-for="benefit in benefits"
            :key="benefit.title"
            class="rounded-card bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-5"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-button bg-accent-soft text-accent dark:bg-accent-softDark">
              <component :is="benefit.icon" class="h-4 w-4" />
            </div>
            <h3 class="mt-4 text-sm font-semibold text-ink dark:text-ink-dark">
              {{ benefit.title }}
            </h3>
            <p class="mt-1 text-sm text-ink-muted leading-relaxed">
              {{ benefit.body }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
