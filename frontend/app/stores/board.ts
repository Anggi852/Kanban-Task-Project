import { defineStore } from 'pinia'
import type { Board, Column, ColumnType, Task, TaskPriority } from '~/types/api'

interface BoardState {
  board: Board | null
  loading: boolean
  error: string | null
}

interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  dueDate?: string | null
}

interface UpdateTaskInput {
  title?: string
  description?: string | null
  priority?: TaskPriority
  dueDate?: string | null
}

export const useBoardStore = defineStore('board', {
  state: (): BoardState => ({
    board: null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    columns: (s): Column[] => s.board?.columns ?? [],
    totalTasks: (s): number =>
      (s.board?.columns ?? []).reduce(
        (acc, c) => acc + (c.tasks?.length ?? 0),
        0,
      ),
    findColumn:
      (s) =>
      (id: string): Column | null =>
        s.board?.columns?.find((c) => c.id === id) ?? null,
  },

  actions: {
    async fetch(id: string) {
      const api = useApi()
      this.loading = true
      this.error = null
      try {
        const board = await api.get<Board>(`/boards/${id}`)
        this.board = board
        return board
      } catch (err: unknown) {
        this.error = errorMessage(err, 'Could not load board')
        throw err
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.board = null
      this.error = null
      this.loading = false
    },

    async renameBoard(name: string) {
      if (!this.board) return
      const api = useApi()
      const updated = await api.patch<Board>(`/boards/${this.board.id}`, { name })
      this.board.name = updated.name
      this.board.updatedAt = updated.updatedAt
      return updated
    },

    async createTask(columnId: string, payload: CreateTaskInput): Promise<Task> {
      const api = useApi()
      const body: Record<string, unknown> = { columnId, title: payload.title }
      if (payload.description) body.description = payload.description
      if (payload.priority) body.priority = payload.priority
      if (payload.dueDate) body.dueDate = payload.dueDate
      const task = await api.post<Task>('/tasks', body)
      const col = this.board?.columns?.find((c) => c.id === columnId)
      if (col) {
        if (!col.tasks) col.tasks = []
        col.tasks.push(task)
      }
      return task
    },

    async updateTask(taskId: string, patch: UpdateTaskInput): Promise<Task> {
      const api = useApi()
      const updated = await api.patch<Task>(`/tasks/${taskId}`, patch)
      for (const col of this.board?.columns ?? []) {
        const idx = (col.tasks ?? []).findIndex((t) => t.id === taskId)
        if (idx >= 0 && col.tasks) {
          col.tasks[idx] = updated
          break
        }
      }
      return updated
    },

    async deleteTask(taskId: string) {
      const api = useApi()
      await api.delete(`/tasks/${taskId}`)
      for (const col of this.board?.columns ?? []) {
        const idx = (col.tasks ?? []).findIndex((t) => t.id === taskId)
        if (idx >= 0 && col.tasks) {
          col.tasks.splice(idx, 1)
          break
        }
      }
    },

    /**
     * Called after a drag completes. The store assumes the optimistic UI
     * update (array splice) already happened via vue-draggable-plus v-model.
     * On failure we refetch to resync.
     */
    async persistTaskMove(
      taskId: string,
      targetColumnId: string,
      sourceColumnId: string,
      newIndex: number,
    ) {
      const api = useApi()
      try {
        if (targetColumnId === sourceColumnId) {
          await api.post(`/tasks/${taskId}/reorder`, { position: newIndex })
        } else {
          await api.post(`/tasks/${taskId}/move`, {
            targetColumnId,
            position: newIndex,
          })
        }

        // --- SINKRONISASI OTOMATIS: Update data boards utama di background saat task digeser ---
        const boardsStore = useBoardsStore()
        boardsStore.fetchAll().catch(() => {})

      } catch (err) {
        if (this.board) await this.fetch(this.board.id).catch(() => {})
        throw err
      }
    },

    async persistColumnReorder(columnId: string, newIndex: number) {
      const api = useApi()
      try {
        await api.post(`/columns/${columnId}/reorder`, { position: newIndex })
      } catch (err) {
        if (this.board) await this.fetch(this.board.id).catch(() => {})
        throw err
      }
    },

    async createColumn(name: string, type: ColumnType = 'TODO'): Promise<Column> {
      if (!this.board) throw new Error('No active board')
      const api = useApi()
      const created = await api.post<Column>('/columns', {
        boardId: this.board.id,
        name,
        type,
      })
      if (!this.board.columns) this.board.columns = []
      this.board.columns.push({ ...created, tasks: [] })
      return created
    },

    async updateColumn(
      columnId: string,
      patch: { name?: string; type?: ColumnType },
    ): Promise<Column> {
      const api = useApi()
      const updated = await api.patch<Column>(`/columns/${columnId}`, patch)
      const col = this.board?.columns?.find((c) => c.id === columnId)
      if (col) {
        col.name = updated.name
        col.type = updated.type
      }
      return updated
    },

    async deleteColumn(columnId: string) {
      const api = useApi()
      await api.delete(`/columns/${columnId}`)
      if (this.board) {
        this.board.columns = (this.board.columns ?? []).filter(
          (c) => c.id !== columnId,
        )
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