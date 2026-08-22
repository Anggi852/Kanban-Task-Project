<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type { Column, ColumnType } from '~/types/api'

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
  created: [column: Column]
  updated: [column: Column]
}>()

const board = useBoardStore()

const form = reactive({
  name: '',
  type: 'TODO' as ColumnType,
})

const submitting = ref(false)
const nameError = ref<string | null>(null)
const error = ref<string | null>(null)

const mode = computed<'create' | 'edit'>(() => (props.column ? 'edit' : 'create'))
const formId = 'column-form'

const typeOptions = [
  { value: 'TODO' as ColumnType, label: 'Backlog — what hasn\'t started' },
  { value: 'IN_PROGRESS' as ColumnType, label: 'In motion — actively working' },
  { value: 'DONE' as ColumnType, label: 'Complete — finished tasks' },
]

watch(
  () => [props.open, props.column?.id] as const,
  ([open]) => {
    if (!open) return
    form.name = props.column?.name ?? ''
    form.type = props.column?.type ?? 'TODO'
    submitting.value = false
    nameError.value = null
    error.value = null
  },
)

async function onSubmit() {
  if (submitting.value) return
  const trimmed = form.name.trim()
  if (!trimmed) {
    nameError.value = 'Column needs a name'
    return
  }
  nameError.value = null
  submitting.value = true
  error.value = null
  try {
    if (mode.value === 'edit' && props.column) {
      const updated = await board.updateColumn(props.column.id, {
        name: trimmed,
        type: form.type,
      })
      
      // --- TAMBAHAN SOCKET.IO 3: Teriak saat kolom berhasil diedit ---
      socket.emit('geserTask', { aksi: 'Kolom telah diedit' })
      
      emit('updated', updated)
      emit('close')
    } else {
      const created = await board.createColumn(trimmed, form.type)
      
      // --- TAMBAHAN SOCKET.IO 4: Teriak saat kolom baru berhasil ditambah ---
      socket.emit('geserTask', { aksi: 'Kolom baru ditambahkan' })
      
      emit('created', created)
      emit('close')
    }
  } catch (err: unknown) {
    error.value = errorMessage(err, 'Could not save column')
  } finally {
    submitting.value = false
  }
}

function errorMessage(err: unknown, fallback: string): string {
  const m =
    (err as { data?: { message?: string | string[] }; message?: string })?.data
      ?.message ?? (err as { message?: string })?.message
  if (!m) return fallback
  return Array.isArray(m) ? m.join(', ') : m
}
</script>

<template>
  <AppModal
    :open="open"
    size="md"
    :close-on-backdrop="!submitting"
    @close="emit('close')"
  >
    <template #header>
      <div>
        <p class="eyebrow">{{ mode === 'edit' ? 'Editing column' : 'New column' }}</p>
        <h2 id="modal-title" class="mt-1 font-display text-xl text-ink dark:text-ink-dark tracking-display-tight">
          {{ mode === 'edit' ? 'Rename or retag' : 'Add a column' }}
        </h2>
        <p class="mt-1 text-sm text-ink-muted">
          The tag marks its role in your workflow — used for charts and progress later.
        </p>
      </div>
    </template>

    <form :id="formId" class="space-y-4" novalidate @submit.prevent="onSubmit">
      <AppInput
        v-model="form.name"
        label="Column name"
        placeholder="To read, Drafting, Submitted…"
        required
        :error="nameError ?? undefined"
      />

      <AppSelect
        v-model="form.type"
        label="Workflow stage"
        :options="typeOptions"
      />
    </form>

    <p v-if="error" class="mt-3 text-xs text-danger">{{ error }}</p>

    <template #footer>
      <AppButton variant="ghost" size="sm" :disabled="submitting" @click="emit('close')">
        Cancel
      </AppButton>
      <AppButton
        variant="primary"
        size="sm"
        type="submit"
        :form="formId"
        :loading="submitting"
      >
        {{ mode === 'edit' ? 'Save column' : 'Add column' }}
      </AppButton>
    </template>
  </AppModal>
</template>