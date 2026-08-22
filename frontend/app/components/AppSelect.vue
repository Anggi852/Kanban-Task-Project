<script setup lang="ts" generic="T extends string | number">
import { computed, useId } from 'vue'

interface SelectOption {
  label: string
  value: T
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: T | null
    options: SelectOption[]
    label?: string
    hint?: string
    error?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    id?: string
  }>(),
  {
    disabled: false,
    required: false,
  },
)

defineEmits<{
  'update:modelValue': [value: T]
}>()

const autoId = useId()
const inputId = computed(() => props.id ?? `select-${autoId}`)
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

    <div class="relative">
      <select
        :id="inputId"
        :value="modelValue ?? ''"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        :class="[
          'block w-full h-10 pl-3 pr-9 rounded-input border bg-surface text-ink text-sm appearance-none',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'dark:bg-surface-dark dark:text-ink-dark',
          error
            ? 'border-danger focus:border-danger focus:ring-danger'
            : 'border-border dark:border-border-dark',
        ]"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value as T)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="String(opt.value)"
          :value="opt.value"
          :disabled="opt.disabled"
        >
          {{ opt.label }}
        </option>
      </select>
      <svg
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-ink-muted">{{ hint }}</p>
  </div>
</template>