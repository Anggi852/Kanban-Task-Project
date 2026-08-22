<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Pencil, ArrowRightLeft, Trash2, ArrowUpDown } from 'lucide-vue-next'
import type { Activity } from '~/types/api'
import { formatRelativeTime } from '~/utils/format'

const props = defineProps<{
  activity: Activity
  dense?: boolean
}>()

const meta = computed(() => {
  switch (props.activity.action) {
    case 'TASK_CREATED':
      return { icon: Plus, tone: 'success', label: 'created a task' }
    case 'TASK_UPDATED':
      return { icon: Pencil, tone: 'accent', label: 'updated a task' }
    case 'TASK_MOVED':
      return { icon: ArrowRightLeft, tone: 'warning', label: 'moved a task' }
    case 'TASK_DELETED':
      return { icon: Trash2, tone: 'danger', label: 'deleted a task' }
    case 'TASK_REORDERED':
      return { icon: ArrowUpDown, tone: 'neutral', label: 'reordered a task' }
    default:
      return { icon: Pencil, tone: 'neutral', label: props.activity.action }
  }
})

const tones: Record<string, string> = {
  success: 'bg-success-soft text-success dark:bg-success-softDark',
  accent: 'bg-accent-soft text-accent dark:bg-accent-softDark',
  warning: 'bg-warning-soft text-warning dark:bg-warning-softDark',
  danger: 'bg-danger-soft text-danger dark:bg-danger-softDark',
  neutral: 'bg-canvas text-ink-muted dark:bg-canvas-dark',
}

const detail = computed(() => {
  const m = props.activity.metadata as Record<string, unknown> | null
  if (!m) return null
  if (typeof m.title === 'string') return m.title
  if (typeof m.taskTitle === 'string') return m.taskTitle as string
  return null
})
</script>

<template>
  <div
    :class="[
      'flex items-start gap-3',
      dense ? 'py-2.5' : 'py-3',
    ]"
  >
    <span :class="['flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-button', tones[meta.tone]]">
      <component :is="meta.icon" class="h-4 w-4" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="text-sm text-ink dark:text-ink-dark">
        You {{ meta.label }}<span v-if="detail" class="text-ink-muted">: <span class="text-ink dark:text-ink-dark font-medium">{{ detail }}</span></span>
      </p>
      <p class="mt-0.5 text-xs text-ink-muted">
        {{ formatRelativeTime(activity.createdAt) }}
      </p>
    </div>
  </div>
</template>