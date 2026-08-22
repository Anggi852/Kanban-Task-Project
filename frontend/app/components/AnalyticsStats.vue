<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { KanbanSquare, ListTodo, CheckCircle2, TrendingUp } from 'lucide-vue-next'
import { formatPercent } from '~/utils/format'

// --- TAMBAHAN SOCKET.IO 1: Import Alat Telepon ---
import { io } from 'socket.io-client'

const analytics = useAnalyticsStore()

// --- TAMBAHAN SOCKET.IO 2: Hubungkan ke Backend ---
const socket = io('http://localhost:8001', {
  withCredentials: true
})

// --- TAMBAHAN SOCKET.IO 3: Pasang Telinga ---
onMounted(() => {
  socket.on('adaTugasBaru', () => {
    console.log('Sihir Socket.IO di AnalyticsStats: Ada tugas baru! Refresh smooth...')
    setTimeout(() => {
      // Perbarui data angka statistiknya langsung ke database
      if (typeof analytics.fetchSummary === 'function') {
        analytics.fetchSummary().catch(() => {})
      }
      // Panggil juga event global (berjaga-jaga kalau ada komponen lain yang butuh refresh)
      window.dispatchEvent(new CustomEvent('refresh-data-dashboard'))
    }, 500)
  })

  socket.on('taskTelahDigeser', () => {
    console.log('Sihir Socket.IO di AnalyticsStats: Ada tugas digeser! Refresh smooth...')
    setTimeout(() => {
      if (typeof analytics.fetchSummary === 'function') {
        analytics.fetchSummary().catch(() => {})
      }
      window.dispatchEvent(new CustomEvent('refresh-data-dashboard'))
    }, 500)
  })
})

// --- TAMBAHAN SOCKET.IO 4: Matikan telepon saat pindah halaman ---
onUnmounted(() => {
  socket.disconnect()
})

const stats = computed(() => {
  const s = analytics.summary
  const totalTasks = s?.totalTasks ?? 0
  const completedTasks = s?.completedTasks ?? 0
  const pending = Math.max(totalTasks - completedTasks, 0)
  return {
    totalBoards: s?.totalBoards ?? 0,
    totalTasks,
    completedTasks,
    pending,
    completionRate: s?.completionRate ?? 0,
  }
})

const isLoading = computed(
  () => analytics.loadingSummary && !analytics.summary,
)
</script>

<template>
  <section aria-label="At-a-glance metrics">
    <p class="eyebrow">At a glance</p>
    <div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Boards"
        :value="stats.totalBoards"
        :icon="KanbanSquare"
        tone="accent"
        :loading="isLoading"
      />
      <StatCard
        label="Total tasks"
        :value="stats.totalTasks"
        description="In the selected scope"
        :icon="ListTodo"
        tone="neutral"
        :loading="isLoading"
      />
      <StatCard
        label="Completed"
        :value="stats.completedTasks"
        :description="`${stats.pending} still in flight`"
        :icon="CheckCircle2"
        tone="success"
        :loading="isLoading"
      />
      <StatCard
        label="Completion rate"
        :value="formatPercent(stats.completionRate)"
        description="Share parked in Done"
        :icon="TrendingUp"
        tone="warning"
        :loading="isLoading"
      />
    </div>
  </section>
</template>