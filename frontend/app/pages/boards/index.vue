<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Plus, Search } from 'lucide-vue-next'
import type { Board } from '~/types/api'
import { io } from 'socket.io-client'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

useHead({ title: 'Boards — TaskFlow' })

const boards = useBoardsStore()

const search = ref('')
const createOpen = ref(false)
const editing = ref<Board | null>(null)
const deleting = ref<Board | null>(null)

// Hubungkan ke Backend lewat Socket.IO untuk pembaruan real-time
const socket = io('http://localhost:8001', {
  withCredentials: true,
})

const loadBoards = () => {
  boards.fetchAll().catch(() => {})
}

onMounted(() => {
  loadBoards()

  // Otomatis refresh data saat ada sinyal tugas baru atau tugas digeser
  socket.on('adaTugasBaru', () => {
    console.log('Socket.IO: Ada tugas baru terdeteksi, menyegarkan data...')
    loadBoards()
  })

  socket.on('taskTelahDigeser', () => {
    console.log('Socket.IO: Tugas digeser terdeteksi, menyegarkan data...')
    loadBoards()
  })
})

onUnmounted(() => {
  socket.disconnect()
})

const visibleBoards = computed(() => {
  const term = search.value.trim().toLowerCase()
  const list = boards.sortedByUpdated
  if (!term) return list
  return list.filter((b) => b.name.toLowerCase().includes(term))
})

function openCreate() {
  createOpen.value = true
}

function onCreated(boardId: string) {
  navigateTo(`/boards/${boardId}`)
}

function onEdit(board: Board) {
  editing.value = board
}

function onRemove(board: Board) {
  deleting.value = board
}
</script>

<template>
  <NuxtLayout
    name="dashboard"
    title="Boards"
    description="Every board you've created, sorted by most recently touched."
  >
    <template #header-actions>
      <AppButton variant="primary" size="sm" @click="openCreate">
        <Plus class="h-4 w-4" />
        <span class="hidden sm:inline">New board</span>
      </AppButton>
    </template>

    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative w-full sm:max-w-xs">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            v-model="search"
            type="search"
            placeholder="Search boards…"
            class="block w-full h-10 pl-9 pr-3 rounded-input border border-border bg-surface text-ink text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent dark:bg-surface-dark dark:border-border-dark dark:text-ink-dark"
          >
        </div>
        <p v-if="boards.loaded" class="text-xs text-ink-muted">
          {{ visibleBoards.length }} of {{ boards.boards.length }} board{{ boards.boards.length === 1 ? '' : 's' }}
        </p>
      </div>

      <p v-if="boards.error" class="text-sm text-danger">{{ boards.error }}</p>

      <BoardGrid
        :boards="visibleBoards"
        :loading="boards.loading"
        @edit="onEdit"
        @remove="onRemove"
        @create-board="openCreate"
      />

      <div
        v-if="boards.loaded && search && !visibleBoards.length && boards.boards.length"
        class="text-center text-sm text-ink-muted"
      >
        No boards match "{{ search }}".
      </div>
    </div>

    <CreateBoardModal :open="createOpen" @close="createOpen = false" @created="onCreated" />
    <EditBoardModal
      :open="!!editing"
      :board="editing"
      @close="editing = null"
      @updated="editing = null"
    />
    <DeleteBoardDialog
      :open="!!deleting"
      :board="deleting"
      @close="deleting = null"
      @deleted="deleting = null"
    />
  </NuxtLayout>
</template>