<script setup lang="ts">
// --- TAMBAHAN SOCKET.IO 1: Import onUnmounted ---
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

// --- TAMBAHAN SOCKET.IO 2: Import Alat Telepon ---
import { io } from 'socket.io-client'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

useHead({ title: 'Analytics — TaskFlow' })

const analytics = useAnalyticsStore()
const boards = useBoardsStore()

// --- TAMBAHAN SOCKET.IO 3: Hubungkan ke Backend (Port 8001) ---
const socket = io('http://localhost:8001', {
  withCredentials: true
})

const selectedBoardId = ref<string>('')
const trendDays = ref<7 | 14 | 30>(14)

const rangeOptions = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
  { value: 30, label: 'Last 30 days' },
]

const boardOptions = computed(() => [
  { value: '', label: 'All boards' },
  ...boards.boards.map((b) => ({ value: b.id, label: b.name })),
])

const activeBoardName = computed(() => {
  if (!selectedBoardId.value) return null
  return boards.boards.find((b) => b.id === selectedBoardId.value)?.name ?? null
})

const description = computed(() => {
  if (activeBoardName.value) return `Trends and mix for ${activeBoardName.value}.`
  return 'Trends and mix across every board you keep.'
})

onMounted(async () => {
  await boards.fetchAll().catch(() => {})
  await refresh()

  // --- TAMBAHAN SOCKET.IO 4: Pasang "Telinga" untuk me-refresh grafik ---
  socket.on('tugasBaru', () => {
    console.log('Tugas baru terdeteksi! Memperbarui grafik Analytics...')
    setTimeout(() => {
      refresh()
    }, 500)
  })

  socket.on('geserTask', () => {
    console.log('Pergeseran tugas terdeteksi! Memperbarui grafik Analytics...')
    setTimeout(() => {
      refresh()
    }, 500)
  })
})

// --- TAMBAHAN SOCKET.IO 5: Matikan telepon kalau pindah halaman ---
onUnmounted(() => {
  socket.disconnect()
})

watch([selectedBoardId, trendDays], () => {
  refresh()
})

async function refresh() {
  const boardId = selectedBoardId.value || undefined
  await analytics.fetchAll(boardId, trendDays.value).catch(() => {})
}

function onRangeChange(value: number) {
  trendDays.value = value as 7 | 14 | 30
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <template #header-actions>
      <div class="flex items-center gap-2">
        <span class="hidden sm:inline eyebrow">Scope</span>
        <select
          v-model="selectedBoardId"
          class="h-9 rounded-input border border-border bg-surface text-ink text-sm pl-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent dark:bg-surface-dark dark:border-border-dark dark:text-ink-dark"
        >
          <option v-for="opt in boardOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </template>

    <div class="space-y-8">
      <div class="border-b border-border dark:border-border-dark pb-5">
        <p class="eyebrow">Field notes</p>
        <h1 class="mt-2 font-display text-3xl sm:text-4xl font-normal leading-tight tracking-display-tight text-ink dark:text-ink-dark">
          The shape of your week
        </h1>
        <p class="mt-2 text-sm text-ink-muted max-w-2xl">{{ description }}</p>
      </div>

      <p v-if="analytics.error" class="text-sm text-danger">{{ analytics.error }}</p>

      <AnalyticsStats />

      <section>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="eyebrow">Throughput</p>
            <h2 class="mt-1 font-display text-2xl leading-tight tracking-display-tight text-ink dark:text-ink-dark">
              Trend &amp; distribution
            </h2>
          </div>

          <div class="inline-flex rounded-button border border-border dark:border-border-dark p-0.5 bg-surface dark:bg-surface-dark">
            <button
              v-for="opt in rangeOptions"
              :key="opt.value"
              type="button"
              :class="[
                'px-3 py-1.5 text-xs font-medium rounded-button transition-colors duration-200 ease-out-expo',
                trendDays === opt.value
                  ? 'bg-ink text-canvas dark:bg-ink-dark dark:text-canvas-dark'
                  : 'text-ink-muted hover:text-ink dark:hover:text-ink-dark',
              ]"
              @click="onRangeChange(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="mt-4 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <CompletionTrendChart :data="analytics.trend" :loading="analytics.loadingTrend" />
          <StatusDistributionChart
            :data="analytics.distribution"
            :loading="analytics.loadingDistribution"
          />
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>