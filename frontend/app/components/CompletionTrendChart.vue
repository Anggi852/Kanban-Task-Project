<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import type { TrendPoint } from '~/types/api'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Filler,
)

const props = defineProps<{
  data: TrendPoint[]
  loading?: boolean
}>()

const { theme } = useColorMode()

const palette = computed(() => {
  const dark = theme.value === 'dark'
  return {
    line: dark ? '#7BB6BC' : '#1F4F58',
    fill: dark ? 'rgba(123, 182, 188, 0.18)' : 'rgba(31, 79, 88, 0.12)',
    grid: dark ? 'rgba(46, 43, 35, 0.6)' : 'rgba(229, 222, 204, 0.7)',
    text: dark ? '#9A9384' : '#736E63',
    tooltipBg: dark ? '#1C1B16' : '#FBF8EF',
    tooltipText: dark ? '#EFEAD9' : '#1A1814',
    tooltipBorder: dark ? '#2E2B23' : '#E5DECC',
  }
})

const chartData = computed<ChartData<'line'>>(() => {
  const labels = props.data.map((p) => formatLabel(p.date))
  const values = props.data.map((p) => p.completed)
  const p = palette.value
  return {
    labels,
    datasets: [
      {
        label: 'Tasks completed',
        data: values,
        borderColor: p.line,
        backgroundColor: p.fill,
        pointBackgroundColor: p.line,
        pointBorderColor: p.line,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
        tension: 0.35,
        fill: true,
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'line'>>(() => {
  const p = palette.value
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { mode: 'index', intersect: false },
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
        displayColors: false,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} task${ctx.parsed.y === 1 ? '' : 's'}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: p.text, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 16 },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: p.grid, drawTicks: false },
        ticks: { color: p.text, font: { size: 11 }, precision: 0, padding: 8 },
        border: { display: false },
      },
    },
  }
})

const total = computed(() => props.data.reduce((acc, p) => acc + p.completed, 0))
const isEmpty = computed(() => !props.loading && total.value === 0)

function formatLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
    <header class="flex items-end justify-between gap-3">
      <div>
        <p class="eyebrow">Completion trend</p>
        <h3 class="mt-1 font-display text-lg leading-tight text-ink dark:text-ink-dark tracking-display-tight">
          Tasks shipped over time
        </h3>
      </div>
      <p class="text-xs text-ink-muted tabular">
        <span class="font-display text-xl text-ink dark:text-ink-dark">{{ total }}</span>
        in window
      </p>
    </header>

    <div class="relative mt-5 h-64">
      <div
        v-if="loading"
        class="absolute inset-0 rounded-card bg-canvas/40 dark:bg-canvas-dark/40 animate-pulse"
      />
      <div
        v-else-if="isEmpty"
        class="absolute inset-0 flex flex-col items-center justify-center text-center"
      >
        <p class="eyebrow text-ink-muted">No completions yet</p>
        <p class="mt-2 max-w-xs text-xs text-ink-muted">
          Move a card into a Done column — your trend line writes itself from there.
        </p>
      </div>
      <Line v-else :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
