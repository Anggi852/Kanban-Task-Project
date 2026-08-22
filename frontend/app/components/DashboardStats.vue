<script setup lang="ts">
// Tambahkan onUnmounted untuk memutus koneksi
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

onMounted(() => {
  analytics.fetchSummary()

  // Kejadian 1: Ada tugas baru dibuat
  socket.on('adaTugasBaru', () => {
    console.log('Tunggu database 0.5 detik sebelum refresh tugas baru...')
    setTimeout(() => {
      analytics.fetchSummary() 
    }, 500) // 500 milidetik = 0.5 detik
  })

  // Kejadian 2: Ada tugas digeser
  socket.on('taskTelahDigeser', () => {
    console.log('Tunggu database 0.5 detik sebelum refresh geser tugas...')
    setTimeout(() => {
      analytics.fetchSummary() 
    }, 500)
  })
})

// --- TAMBAHAN SOCKET.IO 4: Putuskan koneksi jika user keluar dari halaman Dashboard ---
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
</script>

<template>
  <section aria-label="Productivity overview">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Boards"
        :value="stats.totalBoards"
        :icon="KanbanSquare"
        tone="accent"
        :loading="!analytics.summary"
      />
      <StatCard
        label="Total tasks"
        :value="stats.totalTasks"
        description="Across every board"
        :icon="ListTodo"
        tone="neutral"
        :loading="!analytics.summary"
      />
      <StatCard
        label="Completed"
        :value="stats.completedTasks"
        :description="`${stats.pending} still pending`"
        :icon="CheckCircle2"
        tone="success"
        :loading="!analytics.summary"
      />
      <StatCard
        label="Completion rate"
        :value="formatPercent(stats.completionRate)"
        description="Share of tasks in Done columns"
        :icon="TrendingUp"
        tone="warning"
        :loading="!analytics.summary"
      />
    </div>
  </section>
</template>