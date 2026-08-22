import { defineStore } from 'pinia'
import type { AnalyticsSummary, StatusDistributionPoint, TrendPoint } from '~/types/api'

interface AnalyticsState {
  summary: AnalyticsSummary | null
  trend: TrendPoint[]
  distribution: StatusDistributionPoint[]
  trendDays: number
  loadingSummary: boolean
  loadingTrend: boolean
  loadingDistribution: boolean
  error: string | null
}

export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    summary: null,
    trend: [],
    distribution: [],
    trendDays: 14,
    loadingSummary: true,
    loadingTrend: true,
    loadingDistribution: true,
    error: null,
  }),

  actions: {
    async fetchSummary(boardId?: string) {
      const api = useApi()
      this.loadingSummary = true
      this.error = null
      try {
        const query = boardId ? `?boardId=${encodeURIComponent(boardId)}` : ''
        this.summary = await api.get<AnalyticsSummary>(`/analytics/summary${query}`)
        return this.summary
      } catch (err: unknown) {
        this.error = (err as { message?: string })?.message ?? 'Failed to load summary'
        throw err
      } finally {
        this.loadingSummary = false
      }
    },

    async fetchTrend(days = 14, boardId?: string) {
      const api = useApi()
      this.loadingTrend = true
      try {
        const params = new URLSearchParams({ days: String(days) })
        if (boardId) params.set('boardId', boardId)
        const tz = browserTimezone()
        if (tz) params.set('tz', tz)
        this.trend = await api.get<TrendPoint[]>(`/analytics/trend?${params.toString()}`)
        this.trendDays = days
        return this.trend
      } finally {
        this.loadingTrend = false
      }
    },

    async fetchDistribution(boardId?: string) {
      const api = useApi()
      this.loadingDistribution = true
      try {
        const query = boardId ? `?boardId=${encodeURIComponent(boardId)}` : ''
        this.distribution = await api.get<StatusDistributionPoint[]>(
          `/analytics/distribution${query}`,
        )
        return this.distribution
      } finally {
        this.loadingDistribution = false
      }
    },

    async fetchAll(boardId?: string, days = 14) {
      await Promise.all([
        this.fetchSummary(boardId),
        this.fetchTrend(days, boardId),
        this.fetchDistribution(boardId),
      ])
    },
  },
})

function browserTimezone(): string | null {
  if (!import.meta.client) return null
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}
