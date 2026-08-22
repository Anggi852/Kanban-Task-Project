<script setup lang="ts">
import { ref, watch } from 'vue'
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
  updated: [board: Board]
}>()

const boards = useBoardsStore()

const name = ref('')
const error = ref<string | null>(null)
const submitting = ref(false)

watch(
  () => [props.open, props.board?.id] as const,
  ([open]) => {
    if (open) {
      name.value = props.board?.name ?? ''
      error.value = null
      submitting.value = false
    }
  },
)

async function onSubmit() {
  if (!props.board || submitting.value) return
  const trimmed = name.value.trim()
  if (!trimmed) {
    error.value = 'Board name is required'
    return
  }
  if (trimmed === props.board.name) {
    emit('close')
    return
  }

  submitting.value = true
  error.value = null
  try {
    const updated = await boards.update(props.board.id, { name: trimmed })
    
    // --- TAMBAHAN SOCKET.IO 3: Teriak saat papan berhasil diedit ---
    socket.emit('geserTask', { aksi: 'Nama papan diedit' })
    
    emit('updated', updated)
    emit('close')
  } catch (err: unknown) {
    const m = (err as { data?: { message?: string | string[] } })?.data?.message
      ?? (err as { message?: string })?.message
    error.value = Array.isArray(m) ? m.join(', ') : m ?? 'Could not update board'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppModal
    :open="open"
    title="Rename board"
    description="Give your board a clearer name. This won't affect any tasks."
    size="md"
    @close="emit('close')"
  >
    <form id="edit-board-form" class="space-y-4" novalidate @submit.prevent="onSubmit">
      <AppInput
        v-model="name"
        label="Board name"
        placeholder="Board name"
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
        form="edit-board-form"
        :loading="submitting"
      >
        Save changes
      </AppButton>
    </template>
  </AppModal>
</template>