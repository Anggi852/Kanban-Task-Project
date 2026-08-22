<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
    hint?: string
    error?: string
    placeholder?: string
    rows?: number
    disabled?: boolean
    required?: boolean
    id?: string
  }>(),
  {
    rows: 4,
    disabled: false,
    required: false,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()

const autoId = useId()
const inputId = computed(() => props.id ?? `textarea-${autoId}`)
</script>

<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-ink dark:text-ink-dark"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <textarea
      :id="inputId"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :required="required"
      :aria-invalid="!!error"
      :class="[
        'block w-full px-3 py-2 rounded-input border bg-surface text-ink text-sm placeholder:text-ink-muted resize-y',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'dark:bg-surface-dark dark:text-ink-dark dark:placeholder:text-ink-muted',
        error
          ? 'border-danger focus:border-danger focus:ring-danger'
          : 'border-border dark:border-border-dark',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-ink-muted">{{ hint }}</p>
  </div>
</template>
