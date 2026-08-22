<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { KanbanSquare, Plus, ArrowRight } from 'lucide-vue-next'
import { formatRelativeTime } from '~/utils/format'

// --- TAMBAHAN SOCKET.IO 1: Import Alat Telepon ---
import { io } from 'socket.io-client'

// --- TAMBAHAN SOCKET.IO 2: Hubungkan ke Backend (Port 8001) ---
const socket = io('http://localhost:8001', {
  withCredentials: true
})

const emit = defineEmits<{
  'create-board': []
}>()

const boards = useBoardsStore()

onMounted(() => {
  boards.fetchAll().catch(() => {})

  // --- TAMBAHAN SOCKET.IO 3: Telinga untuk merefresh daftar papan terbaru ---
  socket.on('taskTelahDigeser', () => {
    console.log('Tunggu 0.5 detik sebelum refresh daftar Recent Boards...')
    setTimeout(() => {
      boards.fetchAll().catch(() => {})
    }, 500)
  })
})

// --- TAMBAHAN SOCKET.IO 4: Putuskan koneksi jika komponen dihancurkan ---
onUnmounted(() => {
  socket.disconnect()
})

const recent = computed(() => boards.sortedByUpdated.slice(0, 5))
const showSkeleton = computed(() => boards.loading && !boards.loaded)
</script>

<template>
  <AppCard :padded="false">
    <div class="flex items-center justify-between px-6 py-4 border-b border-border dark:border-border-dark">
      <div>
        <h2 class="text-sm font-semibold text-ink dark:text-ink-dark">Recent boards</h2>
        <p class="text-xs text-ink-muted">Pick up where you left off.</p>
      </div>
      <NuxtLink to="/boards" class="text-xs text-accent font-medium hover:underline inline-flex items-center gap-1">
        View all
        <ArrowRight class="h-3 w-3" />
      </NuxtLink>
    </div>

    <div v-if="showSkeleton" class="divide-y divide-border dark:divide-border-dark">
      <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-6 py-4">
        <div class="h-9 w-9 rounded-button bg-canvas dark:bg-canvas-dark animate-pulse" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3 w-1/3 rounded bg-canvas dark:bg-canvas-dark animate-pulse" />
          <div class="h-2.5 w-1/5 rounded bg-canvas dark:bg-canvas-dark animate-pulse" />
        </div>
      </div>
    </div>

    <div v-else-if="recent.length === 0">
      <AppEmptyState
        :icon="KanbanSquare"
        title="No boards yet"
        description="Start your first board to begin organizing your tasks visually."
      >
        <template #action>
          <AppButton variant="primary" size="sm" @click="emit('create-board')">
            <Plus class="h-4 w-4" />
            New board
          </AppButton>
        </template>
      </AppEmptyState>
    </div>

    <ul v-else class="divide-y divide-border dark:divide-border-dark">
      <li
        v-for="board in recent"
        :key="board.id"
      >
        <NuxtLink
          :to="`/boards/${board.id}`"
          class="flex items-center gap-3 px-6 py-4 hover:bg-canvas dark:hover:bg-canvas-dark transition-colors"
        >
          <span class="flex h-9 w-9 items-center justify-center rounded-button bg-accent-soft text-accent dark:bg-accent-softDark">
            <KanbanSquare class="h-4 w-4" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-ink dark:text-ink-dark truncate">
              {{ board.name }}
            </p>
            <p class="text-xs text-ink-muted">
              Updated {{ formatRelativeTime(board.updatedAt) }}
            </p>
          </div>
          <ArrowRight class="h-4 w-4 text-ink-muted" />
        </NuxtLink>
      </li>
    </ul>
  </AppCard>
</template>