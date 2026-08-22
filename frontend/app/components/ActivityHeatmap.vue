<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { Activity } from '~/types/api'

// --- TAMBAHAN SOCKET.IO 1: Import Alat Telepon ---
import { io } from 'socket.io-client'

// --- TAMBAHAN SOCKET.IO 2: Hubungkan ke Backend ---
const socket = io('http://localhost:8001', {
  withCredentials: true
})

const props = defineProps<{
  activities: Activity[]
  weeks?: number
}>()

// --- TAMBAHAN SOCKET.IO 3: Pasang Telinga di onMounted ---
onMounted(() => {
  socket.on('adaTugasBaru', () => {
    console.log('Sihir Socket.IO di Heatmap: Ada tugas baru! Memicu refresh smooth...')
    // Beri jeda 0.5 detik agar database selesai menyimpan
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('refresh-data-dashboard'))
    }, 500)
  })

  socket.on('taskTelahDigeser', () => {
    console.log('Sihir Socket.IO di Heatmap: Ada tugas digeser! Memicu refresh smooth...')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('refresh-data-dashboard'))
    }, 500)
  })
})

// --- TAMBAHAN SOCKET.IO 4: Matikan telepon saat komponen ditutup ---
onUnmounted(() => {
  socket.disconnect()
})

const totalWeeks = computed(() => props.weeks ?? 8)

function dayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

interface Cell {
  key: string
  date: Date
  count: number
}

const grid = computed<Cell[][]>(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Align end column to today's column (last column ends on today).
  // Build a flat list of weeks*7 days, oldest first.
  const total = totalWeeks.value * 7
  const earliest = new Date(today)
  earliest.setDate(today.getDate() - (total - 1))

  // Map day key → count
  const counts = new Map<string, number>()
  for (const a of props.activities) {
    const k = dayKey(new Date(a.createdAt))
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }

  const days: Cell[] = []
  for (let i = 0; i < total; i++) {
    const d = new Date(earliest)
    d.setDate(earliest.getDate() + i)
    const k = dayKey(d)
    days.push({ key: k, date: d, count: counts.get(k) ?? 0 })
  }

  // Reshape into columns of 7 (week per column)
  const cols: Cell[][] = []
  for (let w = 0; w < totalWeeks.value; w++) {
    cols.push(days.slice(w * 7, w * 7 + 7))
  }
  return cols
})

function level(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}

const cellTone: Record<number, string> = {
  0: 'bg-canvas dark:bg-canvas-dark border border-border/60 dark:border-border-dark/60',
  1: 'bg-accent/15 dark:bg-accent-ink/20',
  2: 'bg-accent/35 dark:bg-accent-ink/40',
  3: 'bg-accent/65 dark:bg-accent-ink/70',
  4: 'bg-accent dark:bg-accent-ink',
}

function cellTitle(cell: Cell): string {
  const label = cell.date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  return `${label} — ${cell.count} ${cell.count === 1 ? 'event' : 'events'}`
}

const monthMarkers = computed(() => {
  const seen = new Set<number>()
  return grid.value.map((col) => {
    const first = col[0]
    if (!first) return ''
    const month = first.date.getMonth()
    if (seen.has(month)) return ''
    seen.add(month)
    return first.date.toLocaleDateString(undefined, { month: 'short' })
  })
})
</script>

<template>
  <div>
    <div class="flex gap-[3px] mb-1.5 pl-[18px]">
      <span
        v-for="(label, idx) in monthMarkers"
        :key="idx"
        class="text-[9px] uppercase tracking-wider text-ink-muted w-[14px] text-left"
      >
        {{ label }}
      </span>
    </div>

    <div class="flex gap-1">
      <div class="flex flex-col gap-[3px] mr-1 pt-[2px]">
        <span class="text-[9px] uppercase tracking-wider text-ink-muted h-[14px] leading-[14px]">M</span>
        <span class="text-[9px] uppercase tracking-wider text-ink-muted h-[14px] leading-[14px]" />
        <span class="text-[9px] uppercase tracking-wider text-ink-muted h-[14px] leading-[14px]">W</span>
        <span class="text-[9px] uppercase tracking-wider text-ink-muted h-[14px] leading-[14px]" />
        <span class="text-[9px] uppercase tracking-wider text-ink-muted h-[14px] leading-[14px]">F</span>
        <span class="text-[9px] uppercase tracking-wider text-ink-muted h-[14px] leading-[14px]" />
        <span class="text-[9px] uppercase tracking-wider text-ink-muted h-[14px] leading-[14px]" />
      </div>

      <div v-for="(col, ci) in grid" :key="ci" class="flex flex-col gap-[3px]">
        <span
          v-for="cell in col"
          :key="cell.key"
          :title="cellTitle(cell)"
          :class="['h-[14px] w-[14px] rounded-[3px]', cellTone[level(cell.count)]]"
        />
      </div>
    </div>

    <div class="mt-3 flex items-center gap-2 text-[10px] text-ink-muted">
      <span>Less</span>
      <span v-for="lvl in [0, 1, 2, 3, 4]" :key="lvl" :class="['h-3 w-3 rounded-[3px]', cellTone[lvl]]" />
      <span>More</span>
    </div>
  </div>
</template>