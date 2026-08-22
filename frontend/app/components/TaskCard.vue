<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDays, Flag, AlignLeft, GripVertical, TrendingUp } from 'lucide-vue-next'
import type { Task, TaskPriority } from '~/types/api'
import { formatShortDate } from '~/utils/format'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ open: [task: Task] }>()

const priorityTone: Record<TaskPriority, string> = {
  HIGH: 'bg-danger-soft text-danger dark:bg-danger-softDark',
  MEDIUM: 'bg-warning-soft text-warning dark:bg-warning-softDark',
  LOW: 'bg-success-soft text-success dark:bg-success-softDark',
}

const priorityLabel: Record<TaskPriority, string> = {
  HIGH: 'High',
  MEDIUM: 'Med',
  LOW: 'Low',
}

const PRIORITY_RANK: Record<TaskPriority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 }

// True when the deadline-escalation job raised priority above what the user set.
const autoEscalated = computed(
  () => PRIORITY_RANK[props.task.priority] > PRIORITY_RANK[props.task.basePriority],
)

const due = computed(() => formatShortDate(props.task.dueDate))

const overdue = computed(() => {
  if (!props.task.dueDate) return false
  const d = new Date(props.task.dueDate).getTime()
  if (Number.isNaN(d)) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today.getTime()
})
</script>

<template>
  <article
    class="group/card relative cursor-grab active:cursor-grabbing rounded-card bg-canvas dark:bg-canvas-dark border border-border dark:border-border-dark p-3 shadow-[0_1px_0_rgba(26,24,20,0.03)] hover:border-ink/30 dark:hover:border-ink-dark/30 hover:shadow-card transition-all duration-200 ease-out-expo"
    @click="emit('open', task)"
  >
    <div class="flex items-start gap-2">
      <span
        class="mt-0.5 -ml-0.5 text-ink-muted/40 opacity-0 group-hover/card:opacity-100 transition-opacity"
        aria-hidden="true"
      >
        <GripVertical class="h-3.5 w-3.5" />
      </span>

      <div class="min-w-0 flex-1">
        <h4 class="text-sm font-medium leading-snug text-ink dark:text-ink-dark line-clamp-2">
          {{ task.title }}
        </h4>

        <p
          v-if="task.description"
          class="mt-1 flex items-start gap-1.5 text-[11px] text-ink-muted line-clamp-2 leading-snug"
        >
          <AlignLeft class="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{{ task.description }}</span>
        </p>

        <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            :class="[
              'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              priorityTone[task.priority],
            ]"
            :title="
              autoEscalated
                ? `Auto-raised to ${priorityLabel[task.priority]} — deadline approaching`
                : undefined
            "
          >
            <TrendingUp v-if="autoEscalated" class="h-2.5 w-2.5" />
            <Flag v-else class="h-2.5 w-2.5" />
            {{ priorityLabel[task.priority] }}
            <span v-if="autoEscalated" class="font-semibold normal-case opacity-70">· auto</span>
          </span>

          <span
            v-if="due"
            :class="[
              'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium tabular',
              overdue
                ? 'border-danger/30 bg-danger-soft text-danger dark:bg-danger-softDark'
                : 'border-border text-ink-muted dark:border-border-dark',
            ]"
          >
            <CalendarDays class="h-2.5 w-2.5" />
            {{ due }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
