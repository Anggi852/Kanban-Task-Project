<script setup lang="ts">
import type { Component } from 'vue'

type Tone = 'neutral' | 'accent' | 'success' | 'warning'

withDefaults(
  defineProps<{
    label: string
    value: string | number
    description?: string
    icon?: Component
    tone?: Tone
    loading?: boolean
  }>(),
  {
    tone: 'neutral',
    loading: false,
  },
)

const tones: Record<Tone, string> = {
  neutral: 'bg-canvas text-ink-muted dark:bg-canvas-dark',
  accent: 'bg-accent-soft text-accent dark:bg-accent-softDark',
  success: 'bg-success-soft text-success dark:bg-success-softDark',
  warning: 'bg-warning-soft text-warning dark:bg-warning-softDark',
}
</script>

<template>
  <AppCard>
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {{ label }}
        </p>
        <p
          v-if="loading"
          class="mt-2 h-7 w-16 rounded bg-canvas dark:bg-canvas-dark animate-pulse"
        />
        <p v-else class="mt-2 text-2xl font-semibold text-ink dark:text-ink-dark tabular-nums">
          {{ value }}
        </p>
        <p v-if="description" class="mt-1 text-xs text-ink-muted">
          {{ description }}
        </p>
      </div>
      <div
        v-if="icon"
        :class="['flex h-9 w-9 items-center justify-center rounded-button', tones[tone]]"
      >
        <component :is="icon" class="h-4 w-4" />
      </div>
    </div>
  </AppCard>
</template>
