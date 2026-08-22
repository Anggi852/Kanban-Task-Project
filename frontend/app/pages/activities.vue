<script setup lang="ts">
// --- TAMBAHAN SOCKET.IO 1: Import onUnmounted ---
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Activity, Flame, CalendarHeart, KanbanSquare } from 'lucide-vue-next'
import type { Activity as ActivityRecord, ActivityAction } from '~/types/api'

// --- TAMBAHAN SOCKET.IO 2: Import Alat Telepon ---
import { io } from 'socket.io-client'

// --- TAMBAHAN SOCKET.IO 3: Hubungkan ke Backend (Port 8001) ---
const socket = io('http://localhost:8001', {
  withCredentials: true
})

definePageMeta({
  layout: false,
  middleware: 'auth',
})

useHead({ title: 'Activities — TaskFlow' })

const activities = useActivitiesStore()

onMounted(() => {
  if (!activities.items.length) {
    activities.fetchInitial().catch(() => {})
  }

  // --- TAMBAHAN SOCKET.IO 4: Pasang "Telinga" untuk me-refresh log aktivitas ---
  socket.on('tugasBaru', () => {
    console.log('Tugas baru terdeteksi! Memperbarui log aktivitas...')
    setTimeout(() => {
      activities.fetchInitial().catch(() => {})
    }, 500)
  })

  socket.on('geserTask', () => {
    console.log('Pergeseran tugas terdeteksi! Memperbarui log aktivitas...')
    setTimeout(() => {
      activities.fetchInitial().catch(() => {})
    }, 500)
  })
})

// --- TAMBAHAN SOCKET.IO 5: Matikan telepon kalau pindah halaman ---
onUnmounted(() => {
  socket.disconnect()
})

function loadMore() {
  activities.fetchMore().catch(() => {})
}

// ─── Filter state ─────────────────────────────────────────────────────────────
const actionFilters: ActivityAction[] = [
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_MOVED',
  'TASK_REORDERED',
  'TASK_DELETED',
]
const activeActions = ref<Set<ActivityAction>>(new Set())

function toggleAction(action: ActivityAction) {
  const next = new Set(activeActions.value)
  if (next.has(action)) next.delete(action)
  else next.add(action)
  activeActions.value = next
}

function clearActionFilter() {
  activeActions.value = new Set()
}

const actionLabel: Record<ActivityAction, string> = {
  TASK_CREATED: 'Created',
  TASK_UPDATED: 'Updated',
  TASK_MOVED: 'Moved',
  TASK_REORDERED: 'Reordered',
  TASK_DELETED: 'Deleted',
}

const filteredItems = computed<ActivityRecord[]>(() => {
  if (!activeActions.value.size) return activities.items
  return activities.items.filter((a) => activeActions.value.has(a.action))
})

// ─── Derived insights ─────────────────────────────────────────────────────────
function dayKey(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

const weeklyCount = computed(() => {
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(now.getDate() - 6)
  cutoff.setHours(0, 0, 0, 0)
  return activities.items.filter((a) => new Date(a.createdAt) >= cutoff).length
})

const streak = computed(() => {
  if (!activities.items.length) return 0
  const seen = new Set(activities.items.map((a) => dayKey(a.createdAt)))
  let count = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  while (seen.has(dayKey(cursor))) {
    count++
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
})

const busiestDay = computed<{ key: string; label: string; count: number }>(() => {
  const counts = new Map<string, number>()
  for (const a of activities.items) {
    const k = dayKey(a.createdAt)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  let best: { key: string; count: number } = { key: '', count: 0 }
  for (const [k, c] of counts) {
    if (c > best.count) best = { key: k, count: c }
  }
  if (!best.key) return { key: '', label: '—', count: 0 }
  const d = new Date(`${best.key}T00:00:00`)
  return {
    key: best.key,
    label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
    count: best.count,
  }
})

const boardMix = computed(() => {
  const m = new Map<string, { name: string; count: number }>()
  for (const a of activities.items) {
    if (!a.board) continue
    const entry = m.get(a.board.id)
    if (entry) entry.count++
    else m.set(a.board.id, { name: a.board.name, count: 1 })
  }
  return Array.from(m.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count)
})

const mostActiveBoard = computed(() => boardMix.value[0] ?? null)

const actionMix = computed(() => {
  const counts: Record<ActivityAction, number> = {
    TASK_CREATED: 0,
    TASK_UPDATED: 0,
    TASK_MOVED: 0,
    TASK_REORDERED: 0,
    TASK_DELETED: 0,
  }
  for (const a of activities.items) counts[a.action]++
  const total = Object.values(counts).reduce((acc, c) => acc + c, 0)
  return actionFilters.map((action) => ({
    action,
    label: actionLabel[action],
    count: counts[action],
    share: total === 0 ? 0 : Math.round((counts[action] / total) * 100),
  }))
})

const totalAll = computed(() => activities.items.length)
</script>

<template>
  <NuxtLayout name="dashboard">
    <div class="space-y-8">
      <div class="border-b border-border dark:border-border-dark pb-5">
        <p class="eyebrow">The log</p>
        <h1 class="mt-2 font-display text-3xl sm:text-4xl font-normal leading-tight tracking-display-tight text-ink dark:text-ink-dark">
          A timeline of small wins
        </h1>
        <p class="mt-2 text-sm text-ink-muted max-w-2xl">
          Everything you've moved, edited, finished, or scrapped — newest first, grouped by day. Filter, scan, or just enjoy the receipts.
        </p>
      </div>

      <p v-if="activities.error" class="text-sm text-danger">{{ activities.error }}</p>

      <section aria-label="Activity insights">
        <p class="eyebrow">Highlights</p>
        <div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="This week"
            :value="weeklyCount"
            :description="`${weeklyCount === 1 ? 'event' : 'events'} in the last 7 days`"
            :icon="Activity"
            tone="accent"
            :loading="activities.loading && !activities.items.length"
          />
          <StatCard
            label="Streak"
            :value="streak"
            :description="streak === 0 ? 'No streak yet — work today' : streak === 1 ? 'day with activity' : 'days in a row'"
            :icon="Flame"
            tone="warning"
            :loading="activities.loading && !activities.items.length"
          />
          <StatCard
            label="Busiest day"
            :value="busiestDay.label"
            :description="busiestDay.count ? `${busiestDay.count} events` : 'awaiting your first move'"
            :icon="CalendarHeart"
            tone="success"
            :loading="activities.loading && !activities.items.length"
          />
          <StatCard
            label="Most active"
            :value="mostActiveBoard?.name ?? '—'"
            :description="mostActiveBoard ? `${mostActiveBoard.count} events` : 'no board events yet'"
            :icon="KanbanSquare"
            tone="neutral"
            :loading="activities.loading && !activities.items.length"
          />
        </div>
      </section>

      <section aria-label="Filter activities" class="flex flex-wrap items-center gap-2">
        <p class="eyebrow mr-1">Filter</p>
        <button
          type="button"
          :class="[
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors duration-200 ease-out-expo',
            !activeActions.size
              ? 'border-ink/60 bg-ink text-canvas dark:bg-ink-dark dark:text-canvas-dark dark:border-ink-dark/60'
              : 'border-border text-ink dark:border-border-dark dark:text-ink-dark hover:border-ink/40 dark:hover:border-ink-dark/40',
          ]"
          @click="clearActionFilter"
        >
          All
        </button>
        <button
          v-for="opt in actionMix"
          :key="opt.action"
          type="button"
          :class="[
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors duration-200 ease-out-expo',
            activeActions.has(opt.action)
              ? 'border-ink/60 bg-ink text-canvas dark:bg-ink-dark dark:text-canvas-dark dark:border-ink-dark/60'
              : 'border-border text-ink dark:border-border-dark dark:text-ink-dark hover:border-ink/40 dark:hover:border-ink-dark/40',
          ]"
          @click="toggleAction(opt.action)"
        >
          <span>{{ opt.label }}</span>
          <span class="tabular text-[10px] opacity-70">{{ opt.count }}</span>
        </button>

        <p class="ml-auto text-xs text-ink-muted tabular">
          {{ filteredItems.length }} of {{ totalAll }} event{{ totalAll === 1 ? '' : 's' }}
        </p>
      </section>

      <div class="grid gap-6 lg:grid-cols-[2.4fr_1fr] items-start">
        <ActivityTimeline
          :activities="filteredItems"
          :loading="activities.loading"
          :loading-more="activities.loadingMore"
          :has-more="activities.hasMore && !activeActions.size"
          @load-more="loadMore"
        />

        <aside class="space-y-5 lg:sticky lg:top-20">
          <div class="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
            <header>
              <p class="eyebrow">Last 8 weeks</p>
              <h3 class="mt-1 font-display text-base leading-tight text-ink dark:text-ink-dark tracking-display-tight">
                Daily heat
              </h3>
            </header>
            <div class="mt-4 overflow-x-auto">
              <ActivityHeatmap :activities="activities.items" :weeks="8" />
            </div>
          </div>

          <div class="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
            <header>
              <p class="eyebrow">Action mix</p>
              <h3 class="mt-1 font-display text-base leading-tight text-ink dark:text-ink-dark tracking-display-tight">
                What you tend to do
              </h3>
            </header>
            <ul class="mt-4 space-y-3">
              <li v-for="opt in actionMix" :key="opt.action" class="space-y-1">
                <div class="flex items-baseline justify-between text-xs">
                  <span class="text-ink dark:text-ink-dark">{{ opt.label }}</span>
                  <span class="tabular text-ink-muted">{{ opt.count }} · {{ opt.share }}%</span>
                </div>
                <div class="h-1 rounded-full bg-canvas dark:bg-canvas-dark overflow-hidden">
                  <span
                    class="block h-full bg-ink/70 dark:bg-ink-dark/70 transition-all duration-500 ease-out-expo"
                    :style="{ width: `${opt.share}%` }"
                  />
                </div>
              </li>
            </ul>
          </div>

          <div
            v-if="boardMix.length"
            class="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5"
          >
            <header>
              <p class="eyebrow">By board</p>
              <h3 class="mt-1 font-display text-base leading-tight text-ink dark:text-ink-dark tracking-display-tight">
                Where work happens
              </h3>
            </header>
            <ul class="mt-4 space-y-2">
              <li v-for="b in boardMix.slice(0, 6)" :key="b.id" class="flex items-baseline justify-between gap-3 text-xs">
                <NuxtLink
                  :to="`/boards/${b.id}`"
                  class="text-ink dark:text-ink-dark truncate hover:underline"
                >
                  {{ b.name }}
                </NuxtLink>
                <span class="tabular text-ink-muted shrink-0">{{ b.count }}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </NuxtLayout>
</template>