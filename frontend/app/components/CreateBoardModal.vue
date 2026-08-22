<script setup lang="ts">
import { ref, watch } from 'vue'

// --- TAMBAHAN SOCKET.IO 1: Import Alat Telepon ---
import { io } from 'socket.io-client'

// --- TAMBAHAN SOCKET.IO 2: Hubungkan ke Backend (Port 8001) ---
const socket = io('http://localhost:8001', {
  withCredentials: true
})

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  created: [boardId: string]
}>()

const boards = useBoardsStore()

const name = ref('')
const error = ref<string | null>(null)
const submitting = ref(false)

watch(
  () => props.open,
  (open) => {
    if (open) {
      name.value = ''
      error.value = null
      submitting.value = false
    }
  },
)

async function onSubmit() {
  if (submitting.value) return
  if (!name.value.trim()) {
    error.value = 'Give your board a name'
    return
  }

  submitting.value = true
  error.value = null
  try {
    const board = await boards.create(name.value.trim())
    
    // --- TAMBAHAN SOCKET.IO 3: Teriak saat papan baru dibuat ---
    socket.emit('geserTask', { aksi: 'Papan baru dibuat' })
    
    emit('created', board.id)
    emit('close')
  } catch (err: unknown) {
    const m = (err as { data?: { message?: string | string[] } })?.data?.message
      ?? (err as { message?: string })?.message
    error.value = Array.isArray(m) ? m.join(', ') : m ?? 'Could not create board'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppModal
    :open="open"
    title="Create a board"
    description="Boards start with Todo, Doing and Done columns. You can rename them anytime."
    size="md"
    @close="emit('close')"
  >
    <form id="create-board-form" class="space-y-4" novalidate @submit.prevent="onSubmit">
      <AppInput
        v-model="name"
        label="Board name"
        placeholder="e.g. Thesis chapter 2, Personal goals…"
        required
        :error="error ?? undefined"
      />
    </form>

    <template #footer>
      <AppButton variant="ghost" size="sm" @click="emit('close')">Cancel</AppButton>
      <AppButton
        variant="primary"
        size="sm"
        type="submit"
        form="create-board-form"
        :loading="submitting"
      >
        Create board
      </AppButton>
    </template>
  </AppModal>
</template>