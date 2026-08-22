<script setup lang="ts">
// --- TAMBAHAN SOCKET.IO 1: Import onMounted dan onUnmounted ---
import { computed, onMounted, onUnmounted } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { Plus } from 'lucide-vue-next'
import type { Column, Task } from '~/types/api'

// --- TAMBAHAN SOCKET.IO 2: Hubungkan ke Backend ---
import { io } from 'socket.io-client'

const socket = io('http://localhost:8001', {
  withCredentials: true
})

const props = defineProps<{ columns: Column[] }>()
const emit = defineEmits<{
  openTask: [task: Task]
  addTask: [column: Column]
  editColumn: [column: Column]
  deleteColumn: [column: Column]
  addColumn: []
}>()

const board = useBoardStore()

const list = computed({
  get: () => props.columns,
  set: (val: Column[]) => {
    if (board.board) board.board.columns = val
  },
})

interface SortableEvent {
  oldIndex?: number
  newIndex?: number
  item?: HTMLElement
}

function onColumnUpdate(e: SortableEvent) {
  if (e.newIndex == null) return
  const columnId = e.item?.dataset?.columnId
  if (!columnId) return
  board.persistColumnReorder(columnId, e.newIndex).catch(() => {})
  
  socket.emit('geserTask', { aksi: 'Urutan kolom digeser' })
}

// --- TAMBAHAN SOCKET.IO 3: Pasang "Telinga" di Papan Utama ---
onMounted(() => {
  // 1. Mendengar saat ada tugas yang digeser/pindah kolom di tab lain
  socket.on('geserTask', () => {
    if (board.board?.id) {
      console.log('Ada pergeseran tugas di tab lain! Memperbarui papan...')
      setTimeout(() => {
        // --- PERBAIKAN: Menggunakan fungsi board.fetch() yang BENAR ---
        board.fetch(board.board!.id).catch(() => {})
      }, 500)
    }
  })

  // 2. Mendengar saat ada tugas baru dibuat di tab lain
  socket.on('tugasBaru', () => {
    if (board.board?.id) {
      console.log('Ada tugas baru di tab lain! Memperbarui papan...')
      setTimeout(() => {
        board.fetch(board.board!.id).catch(() => {})
      }, 500)
    }
  })
})

onUnmounted(() => {
  socket.disconnect() // Matikan koneksi saat pindah halaman
})
</script>

<template>
  <div class="-mx-4 sm:-mx-6 lg:-mx-8">
    <div class="overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4 pt-1 scrollbar-thin">
      <div class="flex gap-4 items-start">
        <VueDraggable
          v-model="list"
          :animation="200"
          group="columns"
          handle=".column-drag-handle"
          ghost-class="kanban-column-ghost"
          drag-class="kanban-column-drag"
          class="flex gap-4 items-start"
          @update="onColumnUpdate"
        >
          <ColumnCard
            v-for="column in columns"
            :key="column.id"
            :data-column-id="column.id"
            :column="column"
            @open-task="emit('openTask', $event)"
            @add-task="emit('addTask', $event)"
            @edit-column="emit('editColumn', $event)"
            @delete-column="emit('deleteColumn', $event)"
          />
        </VueDraggable>

        <button
          type="button"
          class="group/col flex w-72 shrink-0 flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border dark:border-border-dark bg-canvas/40 dark:bg-canvas-dark/40 px-4 py-10 text-ink-muted hover:border-ink/40 dark:hover:border-ink-dark/40 hover:text-ink dark:hover:text-ink-dark hover:bg-surface dark:hover:bg-surface-dark transition-all duration-200 ease-out-expo"
          @click="emit('addColumn')"
        >
          <span class="flex h-9 w-9 items-center justify-center rounded-full border border-current">
            <Plus class="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover/col:rotate-90" />
          </span>
          <span class="text-sm font-medium">New column</span>
          <span class="eyebrow">Carve out a stage</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-column-ghost {
  opacity: 0.5;
  outline: 1px dashed theme('colors.accent.DEFAULT');
  outline-offset: -2px;
  background: theme('colors.accent.soft');
}
.dark .kanban-column-ghost {
  background: theme('colors.accent.softDark');
}
.kanban-column-drag {
  cursor: grabbing;
  box-shadow: theme('boxShadow.elevated');
}
</style>