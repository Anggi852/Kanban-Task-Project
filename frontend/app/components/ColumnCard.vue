<script setup lang="ts">
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-vue-next'
import type { Column, ColumnType, Task } from '~/types/api'

// --- TAMBAHAN SOCKET.IO 1: Import Alat Telepon ---
import { io } from 'socket.io-client'

// --- TAMBAHAN SOCKET.IO 2: Hubungkan ke Backend ---
const socket = io('http://localhost:8001', {
  withCredentials: true
})

const props = defineProps<{ column: Column }>()
const emit = defineEmits<{
  openTask: [task: Task]
  addTask: [column: Column]
  editColumn: [column: Column]
  deleteColumn: [column: Column]
}>()

const board = useBoardStore()

// Catatan: Telinga (socket.on) DIHAPUS dari sini karena komponen 
// Bapaknya (KanbanBoard.vue) sudah bertugas mendengar dan me-refresh papan.

const typeMeta: Record<ColumnType, { label: string; dot: string; accent: string }> = {
  TODO: {
    label: 'Backlog',
    dot: 'bg-ink-muted/60 dark:bg-ink-muted-dark/60',
    accent: 'before:bg-ink-muted/40',
  },
  IN_PROGRESS: {
    label: 'In motion',
    dot: 'bg-warning',
    accent: 'before:bg-warning',
  },
  DONE: {
    label: 'Complete',
    dot: 'bg-success',
    accent: 'before:bg-success',
  },
}

const meta = computed(() => typeMeta[props.column.type])
const count = computed(() => props.column.tasks?.length ?? 0)

const tasksList = computed({
  get: () => props.column.tasks ?? [],
  set: (val: Task[]) => {
    props.column.tasks = val
  },
})

interface SortableEvent {
  oldIndex?: number
  newIndex?: number
  from?: HTMLElement
  to?: HTMLElement
  item?: HTMLElement
}

function onUpdate(e: SortableEvent) {
  if (e.newIndex == null) return
  const task = tasksList.value[e.newIndex]
  if (!task) return
  board
    .persistTaskMove(task.id, props.column.id, props.column.id, e.newIndex)
    .catch(() => {})

  // --- TAMBAHAN SOCKET.IO 3: Teriak saat geser di kolom yang sama! ---
  socket.emit('geserTask', { 
    taskId: task.id, 
    aksi: 'Geser dalam 1 kolom' 
  })
}

function onAdd(e: SortableEvent) {
  if (e.newIndex == null) return
  const task = tasksList.value[e.newIndex]
  if (!task) return
  const sourceColumnId = e.from?.dataset?.columnId
  if (!sourceColumnId) return
  board
    .persistTaskMove(task.id, props.column.id, sourceColumnId, e.newIndex)
    .catch(() => {})

  // --- TAMBAHAN SOCKET.IO 4: Teriak saat geser beda kolom! ---
  socket.emit('geserTask', { 
    taskId: task.id, 
    aksi: 'Geser pindah kolom' 
  })
}
</script>

<template>
  <section
    :class="[
      'relative flex w-72 shrink-0 flex-col rounded-card border border-border bg-surface dark:bg-surface-dark dark:border-border-dark overflow-hidden',
      'before:absolute before:top-0 before:left-0 before:right-0 before:h-px',
      meta.accent,
    ]"
  >
    <header class="flex items-center gap-2 px-3.5 pt-3.5 pb-2.5">
      <div class="column-drag-handle flex items-center gap-2 min-w-0 flex-1 cursor-grab active:cursor-grabbing select-none">
        <span :class="['inline-block h-1.5 w-1.5 rounded-full', meta.dot]" />
        <div class="min-w-0 flex-1">
          <p class="eyebrow truncate">{{ meta.label }}</p>
          <h3 class="font-sans text-sm font-semibold leading-tight tracking-tight text-ink dark:text-ink-dark truncate">
            {{ column.name }}
          </h3>
        </div>
      </div>
      <span class="text-[11px] tabular text-ink-muted">{{ count }}</span>
      <AppDropdown align="right" width="w-40">
        <template #trigger="{ toggle, open }">
          <button
            type="button"
            class="p-1 rounded-button text-ink-muted hover:text-ink hover:bg-canvas dark:hover:bg-canvas-dark dark:hover:text-ink-dark transition-colors"
            :class="{ 'text-ink dark:text-ink-dark': open }"
            aria-label="Column actions"
            @click="toggle"
          >
            <MoreHorizontal class="h-4 w-4" />
          </button>
        </template>
        <template #default>
          <ul class="py-1 text-sm">
            <li>
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2 text-left text-ink hover:bg-canvas dark:text-ink-dark dark:hover:bg-canvas-dark"
                @click="emit('editColumn', column)"
              >
                <Pencil class="h-3.5 w-3.5" />
                Edit column
              </button>
            </li>
            <li>
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2 text-left text-danger hover:bg-canvas dark:hover:bg-canvas-dark"
                @click="emit('deleteColumn', column)"
              >
                <Trash2 class="h-3.5 w-3.5" />
                Delete column
              </button>
            </li>
          </ul>
        </template>
      </AppDropdown>
    </header>

    <div class="relative flex-1 px-2.5 pb-2.5">
      <VueDraggable
        v-model="tasksList"
        :animation="180"
        :group="{ name: 'tasks', pull: true, put: true }"
        ghost-class="kanban-ghost"
        drag-class="kanban-drag"
        :data-column-id="column.id"
        class="flex flex-col gap-2 min-h-[6rem] overflow-y-auto scrollbar-thin"
        @update="onUpdate"
        @add="onAdd"
      >
        <TaskCard
          v-for="task in tasksList"
          :key="task.id"
          :task="task"
          @open="emit('openTask', $event)"
        />
      </VueDraggable>

      <p
        v-if="!tasksList.length"
        class="pointer-events-none absolute inset-x-2.5 top-0 rounded-card border border-dashed border-border dark:border-border-dark px-3 py-6 text-center text-[11px] text-ink-muted"
      >
        Drop a task here, or add a new one below.
      </p>
    </div>

    <footer class="px-2.5 pb-3 pt-1">
      <button
        type="button"
        class="group/add flex w-full items-center gap-2 rounded-card px-2 py-2 text-xs text-ink-muted hover:bg-canvas hover:text-ink dark:hover:bg-canvas-dark dark:hover:text-ink-dark transition-colors"
        @click="emit('addTask', column)"
      >
        <Plus class="h-3.5 w-3.5 transition-transform group-hover/add:rotate-90 duration-300 ease-out-expo" />
        <span>Add task</span>
      </button>
    </footer>
  </section>
</template>

<style scoped>
.kanban-ghost {
  opacity: 0.4;
  background: theme('colors.accent.soft');
}
.dark .kanban-ghost {
  background: theme('colors.accent.softDark');
}
.kanban-drag {
  cursor: grabbing;
}
</style>