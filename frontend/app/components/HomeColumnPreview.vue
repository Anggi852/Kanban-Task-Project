<script setup lang="ts">
type Tone = 'neutral' | 'warning' | 'success'

withDefaults(
  defineProps<{
    title: string
    tasks: string[]
    tone?: Tone
  }>(),
  {
    tone: 'neutral',
  },
)

const dots: Record<Tone, string> = {
  neutral: 'bg-ink-muted/40',
  warning: 'bg-warning',
  success: 'bg-success',
}
</script>

<template>
  <div class="rounded-card bg-canvas dark:bg-canvas-dark p-3 flex flex-col gap-2">
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2">
        <span :class="['h-1.5 w-1.5 rounded-full', dots[tone]]" />
        <span class="text-xs font-medium text-ink dark:text-ink-dark">{{ title }}</span>
      </div>
      <span class="text-[10px] text-ink-muted">{{ tasks.length }}</span>
    </div>

    <div
      v-for="task in tasks"
      :key="task"
      class="rounded-button bg-surface dark:bg-surface-dark border border-border dark:border-border-dark px-3 py-2 shadow-card text-xs leading-snug text-ink dark:text-ink-dark"
    >
      {{ task }}
    </div>
  </div>
</template>
