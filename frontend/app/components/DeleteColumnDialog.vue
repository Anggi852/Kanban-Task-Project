<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import type { Column } from '~/types/api'

// --- TAMBAHAN SOCKET.IO 1: Import Alat Telepon ---
import { io } from 'socket.io-client'

// --- TAMBAHAN SOCKET.IO 2: Hubungkan ke Backend (Port 8001) ---
const socket = io('http://localhost:8001', {
  withCredentials: true
})

const props = defineProps<{
  open: boolean
  column: Column | null
}>()

const emit = defineEmits<{
  close: []
  deleted: [columnId: string]
}>()

const board = useBoardStore()

const submitting = ref(false)
const error = ref<string | null>(null)

const taskCount = computed(() => props.column?.tasks?.length ?? 0)

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
  if (!props.column || submitting.value) return
  submitting.value = true
  error.value = null
  try {
    const id = props.column.id
    await board.deleteColumn(id)
    
    // --- TAMBAHAN SOCKET.IO 3: Teriak saat kolom berhasil dihapus ---
    socket.emit('geserTask', { aksi: 'Kolom dihapus' })
    
    emit('deleted', id)
    emit('close')
  } catch (err: unknown) {
    const m =
      (err as { data?: { message?: string | string[] }; message?: string })?.data
        ?.message ?? (err as { message?: string })?.message
    error.value = Array.isArray(m) ? m.join(', ') : m ?? 'Could not delete column'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppModal
    :open="open"
    size="sm"
    :close-on-backdrop="!submitting"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex items-start gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle class="h-4 w-4" />
        </span>
        <div>
          <h2 id="modal-title" class="text-base font-semibold">Delete column?</h2>
          <p class="mt-1 text-sm text-ink-muted">
            <span class="font-medium text-ink dark:text-ink-dark">{{ column?.name }}</span>
            and
            <span class="font-medium text-ink dark:text-ink-dark">
              {{ taskCount }} task{{ taskCount === 1 ? '' : 's' }}
            </span>
            inside will be permanently removed.
          </p>
        </div>
      </div>
    </template>

    <p v-if="error" class="text-sm text-danger">{{ error }}</p>
    <p v-else class="text-sm text-ink-muted">
      Move tasks out first if you'd like to keep them. This cannot be undone.
    </p>

    <template #footer>
      <AppButton variant="ghost" size="sm" :disabled="submitting" @click="emit('close')">
        Cancel
      </AppButton>
      <AppButton variant="danger" size="sm" :loading="submitting" @click="onConfirm">
        Delete column
      </AppButton>
    </template>
  </AppModal>
</template>