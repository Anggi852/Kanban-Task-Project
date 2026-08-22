<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ArrowLeft, MoreHorizontal, Pencil, Trash2, Calendar } from 'lucide-vue-next'
import type { Column, Task } from '~/types/api'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const boardId = computed(() => route.params.id as string)

const board = useBoardStore()
const boards = useBoardsStore()

// Task modal state
const taskModalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const targetColumn = ref<Column | null>(null)

// Column modal state
const columnModalOpen = ref(false)
const editingColumn = ref<Column | null>(null)
const deletingColumn = ref<Column | null>(null)

// Board action state
const renameOpen = ref(false)
const deleteBoardOpen = ref(false)
const renameValue = ref('')
const renameError = ref<string | null>(null)
const renameSubmitting = ref(false)

const calendarOpen = ref(false)

const allTasks = computed(() => {
  return board.columns.flatMap(c => c.tasks || [])
})

useHead(() => ({
  title: board.board ? `${board.board.name} — TaskFlow` : 'Board — TaskFlow',
}))

onMounted(() => {
  board.fetch(boardId.value).catch(() => {})
})

watch(boardId, (id) => {
  if (id) board.fetch(id).catch(() => {})
})

onUnmounted(() => {
  board.clear()
})

watch(renameOpen, (open) => {
  if (open && board.board) {
    renameValue.value = board.board.name
    renameError.value = null
    renameSubmitting.value = false
  }
})

const description = computed(() => {
  const cols = board.columns.length
  const total = board.totalTasks
  if (!cols) return 'A blank workspace, ready when you are.'
  return `${cols} column${cols === 1 ? '' : 's'} · ${total} task${total === 1 ? '' : 's'}`
})

function onOpenTask(task: Task) {
  editingTask.value = task
  targetColumn.value = board.columns.find((c) => c.id === task.columnId) ?? null
  taskModalOpen.value = true
}

function onAddTask(column: Column) {
  editingTask.value = null
  targetColumn.value = column
  taskModalOpen.value = true
}

function onEditColumn(column: Column) {
  editingColumn.value = column
  columnModalOpen.value = true
}

function onAddColumn() {
  editingColumn.value = null
  columnModalOpen.value = true
}

async function submitRename() {
  if (renameSubmitting.value || !board.board) return
  const trimmed = renameValue.value.trim()
  if (!trimmed) {
    renameError.value = 'Board name is required'
    return
  }
  if (trimmed === board.board.name) {
    renameOpen.value = false
    return
  }
  renameSubmitting.value = true
  renameError.value = null
  try {
    const updated = await board.renameBoard(trimmed)
    if (updated) {
      const idx = boards.boards.findIndex((b) => b.id === updated.id)
      if (idx >= 0) boards.boards[idx] = { ...boards.boards[idx]!, ...updated }
    }
    renameOpen.value = false
  } catch (err: unknown) {
    const m = (err as { data?: { message?: string | string[] }; message?: string })?.data?.message
      ?? (err as { message?: string })?.message
    renameError.value = Array.isArray(m) ? m.join(', ') : m ?? 'Could not rename board'
  } finally {
    renameSubmitting.value = false
  }
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <template #header-actions>
      <!-- Tombol ini sudah dirapikan dengan aman -->
      <NuxtLink
        to="/boards"
        class="hidden sm:inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
        @click="boards.fetchAll().catch(() => {})"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        All boards
      </NuxtLink>

      <div class="flex items-center gap-2" v-if="board.board">
        
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button border border-border text-sm font-medium text-ink-muted hover:text-ink hover:bg-canvas dark:border-border-dark dark:hover:bg-canvas-dark dark:hover:text-ink-dark transition-colors"
          @click="calendarOpen = true"
        >
          <Calendar class="h-4 w-4" />
          <span class="hidden sm:inline">Calendar</span>
        </button>

        <AppDropdown align="right" width="w-44">
          <template #trigger="{ toggle, open }">
            <button
              type="button"
              class="p-1.5 rounded-button border border-border text-ink-muted hover:text-ink hover:bg-canvas dark:border-border-dark dark:hover:bg-canvas-dark dark:hover:text-ink-dark transition-colors"
              :class="{ 'text-ink dark:text-ink-dark': open }"
              aria-label="Board actions"
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
                  @click="renameOpen = true"
                >
                  <Pencil class="h-3.5 w-3.5" />
                  Rename board
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-danger hover:bg-canvas dark:hover:bg-canvas-dark"
                  @click="deleteBoardOpen = true"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                  Delete board
                </button>
              </li>
            </ul>
          </template>
        </AppDropdown>
      </div>
    </template>

    <div class="space-y-6">
      <div class="border-b border-border dark:border-border-dark pb-5">
        <p class="eyebrow">Working board</p>
        <h1
          v-if="board.board"
          class="mt-2 font-display text-3xl sm:text-4xl font-normal leading-tight tracking-display-tight text-ink dark:text-ink-dark"
        >
          {{ board.board.name }}
        </h1>
        <div
          v-else-if="board.loading"
          class="mt-2 h-8 w-64 rounded bg-canvas dark:bg-canvas-dark animate-pulse"
        />
        <p class="mt-2 text-sm text-ink-muted">
          <span v-if="board.error" class="text-danger">{{ board.error }}</span>
          <span v-else>{{ description }}</span>
        </p>
      </div>

      <div v-if="board.loading && !board.board" class="flex gap-4 overflow-hidden">
        <div
          v-for="i in 3"
          :key="i"
          class="h-64 w-72 shrink-0 rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark animate-pulse"
        />
      </div>

      <KanbanBoard
        v-else-if="board.board"
        :columns="board.columns"
        @open-task="onOpenTask"
        @add-task="onAddTask"
        @edit-column="onEditColumn"
        @delete-column="deletingColumn = $event"
        @add-column="onAddColumn"
      />

      <div
        v-else-if="!board.loading && board.error"
        class="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-10 text-center"
      >
        <p class="eyebrow text-danger">Couldn't open this board</p>
        <p class="mt-2 text-sm text-ink-muted">{{ board.error }}</p>
        <NuxtLink
          to="/boards"
          class="mt-4 inline-flex items-center gap-1.5 text-sm text-ink dark:text-ink-dark hover:underline"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
          Back to all boards
        </NuxtLink>
      </div>
    </div>

    <TaskModal
      :open="taskModalOpen"
      :task="editingTask"
      :column-id="targetColumn?.id ?? null"
      :column-name="targetColumn?.name ?? null"
      @close="taskModalOpen = false"
      @created="taskModalOpen = false"
      @updated="taskModalOpen = false"
      @deleted="taskModalOpen = false"
    />

    <ColumnFormModal
      :open="columnModalOpen"
      :column="editingColumn"
      @close="columnModalOpen = false"
      @created="columnModalOpen = false"
      @updated="columnModalOpen = false"
    />

    <DeleteColumnDialog
      :open="!!deletingColumn"
      :column="deletingColumn"
      @close="deletingColumn = null"
      @deleted="deletingColumn = null"
    />

    <AppModal
      :open="renameOpen"
      size="md"
      title="Rename board"
      description="Pick a name that tells you, six weeks from now, what this board was for."
      :close-on-backdrop="!renameSubmitting"
      @close="renameOpen = false"
    >
      <form id="rename-board-form" class="space-y-4" novalidate @submit.prevent="submitRename">
        <AppInput
          v-model="renameValue"
          label="Board name"
          placeholder="Board name"
          required
          :error="renameError ?? undefined"
        />
      </form>
      <template #footer>
        <AppButton variant="ghost" size="sm" :disabled="renameSubmitting" @click="renameOpen = false">
          Cancel
        </AppButton>
        <AppButton
          variant="primary"
          size="sm"
          type="submit"
          form="rename-board-form"
          :loading="renameSubmitting"
        >
          Save changes
        </AppButton>
      </template>
    </AppModal>

    <DeleteBoardDialog
      :open="deleteBoardOpen"
      :board="board.board"
      @close="deleteBoardOpen = false"
      @deleted="navigateTo('/boards')"
    />

    <BoardCalendarModal
      :open="calendarOpen"
      :tasks="allTasks"
      @close="calendarOpen = false"
    />

  </NuxtLayout>
</template>