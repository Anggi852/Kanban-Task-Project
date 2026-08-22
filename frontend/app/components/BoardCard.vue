<script setup lang="ts">
import { computed } from 'vue'
import { KanbanSquare, MoreHorizontal, Pencil, Trash2, ListChecks } from 'lucide-vue-next'
import type { Board } from '~/types/api'
import { formatRelativeTime } from '~/utils/format'

const props = defineProps<{
  board: Board
}>()

const emit = defineEmits<{
  edit: [board: Board]
  remove: [board: Board]
}>()

const taskCount = computed(() => {
  const columns = props.board.columns ?? []
  // Hanya hitung task dari kolom yang BUKAN 'DONE'
  return columns
    .filter((col) => col.type !== 'DONE')
    .reduce((acc, col) => acc + (col.tasks?.length ?? 0), 0)
})

const taskLabel = computed(() => {
  const n = taskCount.value
  if (!n) return 'No tasks yet'
  return `${n} task${n === 1 ? '' : 's'}`
})
</script>

<template>
  <article
    class="group relative flex flex-col rounded-card border border-border bg-surface hover:border-accent/50 hover:shadow-card transition-all dark:bg-surface-dark dark:border-border-dark"
  >
    <NuxtLink
      :to="`/boards/${board.id}`"
      class="flex flex-col gap-4 p-5 flex-1"
      :aria-label="`Open board ${board.name}`"
    >
      <div class="flex items-start gap-3">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-accent-soft text-accent dark:bg-accent-softDark"
        >
          <KanbanSquare class="h-5 w-5" />
        </span>
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-semibold text-ink dark:text-ink-dark truncate">
            {{ board.name }}
          </h3>
          <p class="mt-0.5 text-xs text-ink-muted">
            Updated {{ formatRelativeTime(board.updatedAt) }}
          </p>
        </div>
      </div>

      <div class="mt-auto flex items-center gap-1.5 text-xs text-ink-muted">
        <ListChecks class="h-3.5 w-3.5" />
        <span>{{ taskLabel }}</span>
      </div>
    </NuxtLink>

    <div class="absolute top-3 right-3" @click.stop>
      <AppDropdown align="right" width="w-44">
        <template #trigger="{ toggle, open }">
          <button
            type="button"
            class="p-1.5 rounded-button text-ink-muted hover:text-ink hover:bg-canvas dark:hover:bg-canvas-dark dark:hover:text-ink-dark transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100"
            :class="{ 'opacity-100': open }"
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
                @click="emit('edit', board)"
              >
                <Pencil class="h-4 w-4" />
                Rename
              </button>
            </li>
            <li>
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2 text-left text-danger hover:bg-canvas dark:hover:bg-canvas-dark"
                @click="emit('remove', board)"
              >
                <Trash2 class="h-4 w-4" />
                Delete
              </button>
            </li>
          </ul>
        </template>
      </AppDropdown>
    </div>
  </article>
</template>
