<script setup lang="ts">
import { ref, watch } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import type { Board } from '~/types/api'

// --- TAMBAHAN SOCKET.IO 1: Import Alat Telepon ---
import { io } from 'socket.io-client'

// --- TAMBAHAN SOCKET.IO 2: Hubungkan ke Backend (Port 8001) ---
const socket = io('http://localhost:8001', {
  withCredentials: true
})

const props = defineProps<{
  open: boolean
  board: Board | null
}>()

const emit = defineEmits<{
  close: []
  deleted: [boardId: string]
}>()

const boards = useBoardsStore()

const submitting = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.open,
  (open) => {
    if (open) {
      submitting.value = false
      error.value = null
    }
  },
)

async function onConfirm() {
  if (!props.board || submitting.value) return
  submitting.value = true
  error.value = null
  try {
    const id = props.board.id
    await boards.remove(id)
    
    // --- TAMBAHAN SOCKET.IO 3: Teriak saat papan berhasil dihapus ---
    socket.emit('geserTask', { aksi: 'Papan dihapus' })
    
    emit('deleted', id)
    emit('close')
  } catch (err: unknown) {
    const m = (err as { data?: { message?: string | string[] } })?.data?.message
      ?? (err as { message?: string })?.message
    error.value = Array.isArray(m) ? m.join(', ') : m ?? 'Could not delete board'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppModal :open="open" size="sm" :close-on-backdrop="!submitting" @close="emit('close')">
    <template #header>
      <div class="flex items-start gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle class="h-4 w-4" />
        </span>
        <div>
          <h2 id="modal-title" class="text-base font-semibold">Delete board?</h2>
          <p class="mt-1 text-sm text-ink-muted">
            <span class="font-medium text-ink dark:text-ink-dark">{{ board?.name }}</span>
            and all of its columns and tasks will be permanently removed. This cannot be undone.
          </p>
        </div>
      </div>
    </template>

    <p v-if="error" class="text-sm text-danger">{{ error }}</p>
    <p v-else class="text-sm text-ink-muted">
      You'll lose every task, column and activity tied to this board.
    </p>

    <template #footer>
      <AppButton variant="ghost" size="sm" :disabled="submitting" @click="emit('close')">
        Cancel
      </AppButton>
      <AppButton variant="danger" size="sm" :loading="submitting" @click="onConfirm">
        Delete board
      </AppButton>
    </template>
  </AppModal>
</template>