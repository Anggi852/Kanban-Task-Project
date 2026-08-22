<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { History, ArrowRight } from 'lucide-vue-next'
import type { Activity } from '~/types/api'

// --- TAMBAHAN SOCKET.IO 1: Import Alat Telepon ---
import { io } from 'socket.io-client'

// --- TAMBAHAN SOCKET.IO 2: Hubungkan ke Backend (Port 8001) ---
const socket = io('http://localhost:8001', {
  withCredentials: true
})

const boards = useBoardsStore()
const api = useApi()

const activities = ref<Activity[]>([])
const loading = ref(false)
const targetBoardId = computed(() => boards.sortedByUpdated[0]?.id ?? null)

async function load(boardId: string) {
  loading.value = true
  try {
    activities.value = await api.get<Activity[]>(`/boards/${boardId}/activities`)
  } catch {
    activities.value = []
  } finally {
    loading.value = false
  }
}

watch(
  targetBoardId,
  (id) => {
    if (id) load(id)
    else {
      activities.value = []
      loading.value = false
    }
  },
  { immediate: true },
)

// --- TAMBAHAN SOCKET.IO 3: Telinga untuk merefresh riwayat aktivitas ---
onMounted(() => {
  // Kejadian 1: Ada tugas baru
  socket.on('adaTugasBaru', () => {
    if (targetBoardId.value) {
      setTimeout(() => load(targetBoardId.value!), 500)
    }
  })

  // Kejadian 2: Ada tugas atau kolom yang digeser/diedit
  socket.on('taskTelahDigeser', () => {
    if (targetBoardId.value) {
      setTimeout(() => load(targetBoardId.value!), 500)
    }
  })
})

// --- TAMBAHAN SOCKET.IO 4: Putuskan koneksi jika komponen dihancurkan ---
onUnmounted(() => {
  socket.disconnect()
})

const visible = computed(() => activities.value.slice(0, 8))
</script>

<template>
  <AppCard :padded="false">
    <div class="flex items-center justify-between px-6 py-4 border-b border-border dark:border-border-dark">
      <div>
        <h2 class="text-sm font-semibold text-ink dark:text-ink-dark">Recent activity</h2>
        <p class="text-xs text-ink-muted">
          From your most recent board
        </p>
      </div>
      <NuxtLink to="/activities" class="text-xs text-accent font-medium hover:underline inline-flex items-center gap-1">
        View all
        <ArrowRight class="h-3 w-3" />
      </NuxtLink>
    </div>

    <div v-if="loading && !activities.length" class="px-6 py-6">
      <AppLoading size="sm" />
    </div>

    <AppEmptyState
      v-else-if="!visible.length"
      :icon="History"
      title="No activity yet"
      description="Create a board and start adding tasks to see your activity here."
    />

    <ul v-else class="px-6 py-2 divide-y divide-border dark:divide-border-dark">
      <li v-for="activity in visible" :key="activity.id">
        <ActivityItem :activity="activity" dense />
      </li>
    </ul>
  </AppCard>
</template>