import { defineStore } from 'pinia'
import type { Board } from '~/types/api'

interface BoardsState {
  boards: Board[]
  loading: boolean
  loaded: boolean
  error: string | null
}

export const useBoardsStore = defineStore('boards', {
  state: (): BoardsState => ({
    boards: [],
    loading: false,
    loaded: false,
    error: null,
  }),

  getters: {
    sortedByUpdated: (s) =>
      [...s.boards].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    findById: (s) => (id: string) => s.boards.find((b) => b.id === id) ?? null,
  },

  actions: {
    async fetchAll(force = true) { // <-- Ubah default force jadi true agar selalu memperbarui data terbaru
      const api = useApi()
      this.loading = true
      this.error = null
      try {
        const boards = await api.get<Board[]>('/boards')
        this.boards = boards
        this.loaded = true
        return boards
      } catch (err: unknown) {
        this.error = errorMessage(err, 'Failed to load boards')
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id: string) {
      const api = useApi()
      const board = await api.get<Board>(`/boards/${id}`)
      const idx = this.boards.findIndex((b) => b.id === id)
      if (idx >= 0) this.boards[idx] = board
      else this.boards.push(board)
      return board
    },

    async create(name: string) {
      const api = useApi()
      const board = await api.post<Board>('/boards', { name })
      this.boards.unshift(board)
      return board
    },

    async update(id: string, patch: { name?: string }) {
      const api = useApi()
      const updated = await api.patch<Board>(`/boards/${id}`, patch)
      const idx = this.boards.findIndex((b) => b.id === id)
      if (idx >= 0) this.boards[idx] = { ...this.boards[idx]!, ...updated }
      return updated
    },

    async remove(id: string) {
      const api = useApi()
      await api.delete(`/boards/${id}`)
      this.boards = this.boards.filter((b) => b.id !== id)
    },
  },
})

function errorMessage(err: unknown, fallback: string): string {
  const m = (err as { data?: { message?: string | string[] }; message?: string })?.data?.message
    ?? (err as { message?: string })?.message
  if (!m) return fallback
  return Array.isArray(m) ? m.join(', ') : m
}