<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import type { StatusDistributionPoint } from '~/types/api'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps<{
  data: StatusDistributionPoint[]
  loading?: boolean
}>()

const { theme } = useColorMode()

const statusLabel: Record<string, string> = {
  TODO: 'Backlog',
  IN_PROGRESS: 'In motion',
  DONE: 'Complete',
}

const palette = computed(() => {
  const dark = theme.value === 'dark'
  return {
    todo: dark ? '#736E63' : '#9A9384',
    inProgress: '#C57A2E',
    done: '#4F6D3F',
    track: dark ? '#1C1B16' : '#FBF8EF',
    tooltipBg: dark ? '#1C1B16' : '#FBF8EF',
    tooltipText: dark ? '#EFEAD9' : '#1A1814',
    tooltipBorder: dark ? '#2E2B23' : '#E5DECC',
  }
})

const orderedData = computed<StatusDistributionPoint[]>(() => {
  const order = ['TODO', 'IN_PROGRESS', 'DONE'] as const
  return order
    .map((status) => props.data.find((d) => d.status === status) ?? { status, count: 0 })
})

const total = computed(() => orderedData.value.reduce((acc, d) => acc + d.count, 0))
const isEmpty = computed(() => !props.loading && total.value === 0)

const chartData = computed<ChartData<'doughnut'>>(() => {
  const p = palette.value
  return {
    labels: orderedData.value.map((d) => statusLabel[d.status] ?? d.status),
    datasets: [
      {
        data: orderedData.value.map((d) => d.count),
        backgroundColor: [p.todo, p.inProgress, p.done],
        borderColor: p.track,
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'doughnut'>>(() => {
  const p = palette.value
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    animation: { duration: 500 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: p.tooltipBg,
        titleColor: p.tooltipText,
        bodyColor: p.tooltipText,
        borderColor: p.tooltipBorder,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed
            const share = total.value === 0 ? 0 : Math.round((value / total.value) * 100)
            return `${ctx.label}: ${value} (${share}%)`
          },
        },
      },
    },
  }
})

const legendItems = computed(() =>
  orderedData.value.map((d, i) => ({
    status: d.status,
    label: statusLabel[d.status] ?? d.status,
    count: d.count,
    share: total.value === 0 ? 0 : Math.round((d.count / total.value) * 100),
    dot: [palette.value.todo, palette.value.inProgress, palette.value.done][i] ?? '#000',
  })),
)
</script>

<template>
  <div class="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
    <header>
      <p class="eyebrow">Status mix</p>
      <h3 class="mt-1 font-display text-lg leading-tight text-ink dark:text-ink-dark tracking-display-tight">
        Where your tasks live
      </h3>
    </header>

    <div class="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div class="relative h-44 w-44 shrink-0">
        <div
          v-if="loading"
          class="absolute inset-0 rounded-full bg-canvas/40 dark:bg-canvas-dark/40 animate-pulse"
        />
        <div
          v-else-if="isEmpty"
          class="absolute inset-0 flex items-center justify-center rounded-full border border-dashed border-border dark:border-border-dark"
        >
          <p class="text-xs text-ink-muted">No tasks yet</p>
        </div>
        <template v-else>
          <Doughnut :data="chartData" :options="chartOptions" />
          <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p class="font-display text-2xl text-ink dark:text-ink-dark tabular leading-none">
              {{ total }}
            </p>
            <p class="mt-0.5 text-[10px] text-ink-muted">tasks total</p>
          </div>
        </template>
      </div>

      <ul class="flex-1 space-y-2.5 w-full">
        <li
          v-for="item in legendItems"
          :key="item.status"
          class="flex items-center gap-3 text-sm"
        >
          <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: item.dot }" />
          <span class="flex-1 text-ink dark:text-ink-dark">{{ item.label }}</span>
          <span class="tabular text-ink-muted text-xs">
            {{ item.count }} <span class="text-ink-muted/60">·</span> {{ item.share }}%
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
