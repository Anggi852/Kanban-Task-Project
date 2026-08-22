<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { Plus, Pencil, ArrowRightLeft, Trash2, ArrowUpDown } from 'lucide-vue-next'
import type { Activity, ActivityAction } from '~/types/api'
import { formatDate, formatRelativeTime } from '~/utils/format'

// --- TAMBAHAN SOCKET.IO 1: Import Alat Telepon ---
import { io } from 'socket.io-client'

// --- TAMBAHAN SOCKET.IO 2: Hubungkan ke Backend ---
const socket = io('http://localhost:8001', {
  withCredentials: true
})

const props = defineProps<{
  activities: Activity[]
  loading?: boolean
  loadingMore?: boolean
  hasMore?: boolean
}>()

const emit = defineEmits<{ loadMore: [] }>()

// --- TAMBAHAN SOCKET.IO 3: Pasang Telinga di onMounted ---
onMounted(() => {
  socket.on('adaTugasBaru', () => {
    console.log('Sihir Socket.IO di Timeline: Ada tugas baru! Memicu refresh smooth...')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('refresh-data-dashboard'))
    }, 500)
  })

  socket.on('taskTelahDigeser', () => {
    console.log('Sihir Socket.IO di Timeline: Ada tugas digeser! Memicu refresh smooth...')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('refresh-data-dashboard'))
    }, 500)
  })
})

// --- TAMBAHAN SOCKET.IO 4: Matikan telepon saat komponen ditutup ---
onUnmounted(() => {
  socket.disconnect()
})

interface ActionMeta {
  icon: typeof Plus
  tone: 'success' | 'accent' | 'warning' | 'danger' | 'neutral'
  label: string
}

const actionMeta: Record<ActivityAction, ActionMeta> = {
  TASK_CREATED: { icon: Plus, tone: 'success', label: 'created a task' },
  TASK_UPDATED: { icon: Pencil, tone: 'accent', label: 'updated a task' },
  TASK_MOVED: { icon: ArrowRightLeft, tone: 'warning', label: 'moved a task' },
  TASK_DELETED: { icon: Trash2, tone: 'danger', label: 'deleted a task' },
  TASK_REORDERED: { icon: ArrowUpDown, tone: 'neutral', label: 'reordered a task' },
}

const tones: Record<ActionMeta['tone'], string> = {
  success: 'bg-success-soft text-success border-success/30 dark:bg-success-softDark',
  accent: 'bg-accent-soft text-accent border-accent/30 dark:bg-accent-softDark',
  warning: 'bg-warning-soft text-warning border-warning/30 dark:bg-warning-softDark',
  danger: 'bg-danger-soft text-danger border-danger/30 dark:bg-danger-softDark',
  neutral: 'bg-canvas text-ink-muted border-border dark:bg-canvas-dark dark:border-border-dark',
}

function metaOf(action: ActivityAction): ActionMeta {
  return actionMeta[action] ?? actionMeta.TASK_UPDATED
}

function detail(activity: Activity): string | null {
  const m = activity.metadata as Record<string, unknown> | null
  if (!m) return null
  if (typeof m.title === 'string') return m.title
  if (typeof m.taskTitle === 'string') return m.taskTitle as string
  return null
}

function dayKey(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

function dayLabel(key: string): string {
  const d = new Date(`${key}T00:00:00`)
  if (Number.isNaN(d.getTime())) return key

  const today = new Date()
  const todayKey = dayKey(today.toISOString())
  const yest = new Date(today)
  yest.setDate(today.getDate() - 1)
  const yestKey = dayKey(yest.toISOString())

  if (key === todayKey) return 'Today'
  if (key === yestKey) return 'Yesterday'
  return formatDate(d)
}

const grouped = computed(() => {
  const map = new Map<string, Activity[]>()
  for (const a of props.activities) {
    const key = dayKey(a.createdAt)
    const list = map.get(key)
    if (list) list.push(a)
    else map.set(key, [a])
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: dayLabel(key),
    items,
  }))
})
</script>

<template>
  <div>
    <div v-if="loading && !activities.length" class="space-y-3">
      <div
        v-for="i in 4"
        :key="i"
        class="h-14 rounded-card bg-surface dark:bg-surface-dark border border-border dark:border-border-dark animate-pulse"
      />
    </div>

    <div
      v-else-if="!activities.length"
      class="rounded-card border border-dashed border-border dark:border-border-dark px-6 py-12 text-center"
    >
      <p class="eyebrow">Quiet week</p>
      <p class="mt-2 text-sm text-ink-muted">
        Activity lands here as soon as you move, edit, or finish a task.
      </p>
    </div>

    <div v-else class="space-y-10">
      <section v-for="group in grouped" :key="group.key">
        <div class="flex items-center gap-3 mb-4">
          <p class="eyebrow">{{ group.label }}</p>
          <span class="h-px flex-1 bg-border dark:bg-border-dark" />
        </div>

        <ol class="relative">
          <span
            class="absolute left-[15px] top-2 bottom-2 w-px bg-border dark:bg-border-dark"
            aria-hidden="true"
          />

          <li
            v-for="activity in group.items"
            :key="activity.id"
            class="relative grid grid-cols-[32px_1fr] gap-4 py-2"
          >
            <span
              :class="[
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border',
                tones[metaOf(activity.action).tone],
              ]"
            >
              <component :is="metaOf(activity.action).icon" class="h-3.5 w-3.5" />
            </span>

            <div class="min-w-0 pt-0.5">
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p class="text-sm text-ink dark:text-ink-dark">
                  You {{ metaOf(activity.action).label }}<span
                    v-if="detail(activity)"
                    class="text-ink-muted"
                  >: <span class="text-ink dark:text-ink-dark font-medium">{{ detail(activity) }}</span></span>
                </p>
                <NuxtLink
                  v-if="activity.board"
                  :to="`/boards/${activity.board.id}`"
                  class="inline-flex items-center gap-1 rounded-full border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-2 py-0.5 text-[10px] font-medium text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
                >
                  {{ activity.board.name }}
                </NuxtLink>
              </div>
              <p class="mt-0.5 text-xs text-ink-muted tabular">
                {{ formatRelativeTime(activity.createdAt) }}
              </p>
            </div>
          </li>
        </ol>
      </section>

      <div v-if="hasMore" class="flex justify-center pt-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-button border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-2 text-sm text-ink dark:text-ink-dark hover:border-ink/40 dark:hover:border-ink-dark/40 transition-colors disabled:opacity-50"
          :disabled="loadingMore"
          @click="emit('loadMore')"
        >
          {{ loadingMore ? 'Loading…' : 'Show more' }}
        </button>
      </div>
    </div>
  </div>
</template>