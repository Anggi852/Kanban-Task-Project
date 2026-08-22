<script setup lang="ts">
import { KanbanSquare, Plus } from 'lucide-vue-next'
import type { Board } from '~/types/api'

defineProps<{
  boards: Board[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [board: Board]
  remove: [board: Board]
  'create-board': []
}>()
</script>

<template>
  <div>
    <div v-if="loading && !boards.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="i in 6"
        :key="i"
        class="h-32 rounded-card border border-border bg-surface animate-pulse dark:bg-surface-dark dark:border-border-dark"
      />
    </div>

    <AppEmptyState
      v-else-if="!boards.length"
      :icon="KanbanSquare"
      title="No boards yet"
      description="Boards group related tasks into Todo, Doing and Done columns. Create your first one to get started."
    >
      <template #action>
        <AppButton variant="primary" size="sm" @click="emit('create-board')">
          <Plus class="h-4 w-4" />
          New board
        </AppButton>
      </template>
    </AppEmptyState>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <BoardCard
        v-for="board in boards"
        :key="board.id"
        :board="board"
        @edit="emit('edit', $event)"
        @remove="emit('remove', $event)"
      />
    </div>
  </div>
</template>
