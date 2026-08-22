import { defineStore } from 'pinia'
import type { Activity } from '~/types/api'

interface ActivitiesState {
  items: Activity[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: string | null
}

const PAGE_SIZE = 50

export const useActivitiesStore = defineStore('activities', {
  state: (): ActivitiesState => ({
    items: [],
    loading: false,
    loadingMore: false,
    hasMore: false,
    error: null,
  }),

  actions: {
    async fetchInitial() {
      const api = useApi()
      this.loading = true
      this.error = null
      try {
        const items = await api.get<Activity[]>(`/activities?limit=${PAGE_SIZE}`)
        this.items = items
        this.hasMore = items.length === PAGE_SIZE
      } catch (err: unknown) {
        this.error = errorMessage(err, 'Could not load activities')
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchMore() {
      if (this.loadingMore || !this.hasMore) return
      const last = this.items[this.items.length - 1]
      if (!last) return
      const api = useApi()
      this.loadingMore = true
      try {
        const next = await api.get<Activity[]>(
          `/activities?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(last.id)}`,
        )
        this.items = this.items.concat(next)
        this.hasMore = next.length === PAGE_SIZE
      } catch (err: unknown) {
        this.error = errorMessage(err, 'Could not load more activities')
      } finally {
        this.loadingMore = false
      }
    },
  },
})

function errorMessage(err: unknown, fallback: string): string {
  const m =
    (err as { data?: { message?: string | string[] }; message?: string })?.data
      ?.message ?? (err as { message?: string })?.message
  if (!m) return fallback
  return Array.isArray(m) ? m.join(', ') : m
}
