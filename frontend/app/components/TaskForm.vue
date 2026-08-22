<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Task, TaskPriority } from '~/types/api'

interface FormState {
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
}

const props = defineProps<{
  task?: Task | null
  formId: string
}>()

const emit = defineEmits<{
  submit: [payload: {
    title: string
    description: string | null
    priority: TaskPriority
    dueDate: string | null
  }]
}>()

const form = reactive<FormState>({
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
})

const errors = reactive<{ title: string | null }>({ title: null })

watch(
  () => props.task,
  (task) => {
    form.title = task?.title ?? ''
    form.description = task?.description ?? ''
    form.priority = task?.basePriority ?? 'MEDIUM'
    form.dueDate = task?.dueDate ? toDateInput(task.dueDate) : ''
    errors.title = null
  },
  { immediate: true },
)

const priorityOptions = [
  { value: 'LOW' as TaskPriority, label: 'Low — backburner' },
  { value: 'MEDIUM' as TaskPriority, label: 'Medium — this week' },
  { value: 'HIGH' as TaskPriority, label: 'High — today' },
]

const titleHint = computed(() => `${form.title.trim().length}/200`)

function toDateInput(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function onSubmit() {
  const title = form.title.trim()
  if (!title) {
    errors.title = 'Give the task a title'
    return
  }
  errors.title = null

  emit('submit', {
    title,
    description: form.description.trim() ? form.description.trim() : null,
    priority: form.priority,
    dueDate: form.dueDate ? new Date(`${form.dueDate}T00:00:00`).toISOString() : null,
  })
}
</script>

<template>
  <form :id="formId" class="space-y-4" novalidate @submit.prevent="onSubmit">
    <AppInput
      v-model="form.title"
      label="Title"
      placeholder="Read chapter 4, draft thesis intro…"
      required
      :error="errors.title ?? undefined"
      :hint="titleHint"
    />

    <AppTextarea
      v-model="form.description"
      label="Notes"
      placeholder="Optional context — what's done, what's left, what to remember."
      :rows="4"
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <AppSelect
        v-model="form.priority"
        label="Priority"
        :options="priorityOptions"
      />

      <div class="space-y-1.5">
        <label
          for="task-due"
          class="block text-sm font-medium text-ink dark:text-ink-dark"
        >
          Due date
        </label>
        <input
          id="task-due"
          v-model="form.dueDate"
          type="date"
          class="block w-full h-10 px-3 rounded-input border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent dark:bg-surface-dark dark:border-border-dark dark:text-ink-dark"
        >
      </div>
    </div>
  </form>
</template>