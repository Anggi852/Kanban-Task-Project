<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    label?: string
    hint?: string
    error?: string
    type?: string
    placeholder?: string
    autocomplete?: string
    disabled?: boolean
    required?: boolean
    id?: string
  }>(),
  {
    type: 'text',
    disabled: false,
    required: false,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()

const autoId = useId()
const inputId = computed(() => props.id ?? `input-${autoId}`)
</script>

<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-ink dark:text-ink-dark transition-colors duration-300"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <div class="relative">
      <slot name="prefix" />
      <input
        :id="inputId"
        :type="type"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        :class="[
          'block w-full h-10 px-3 rounded-input border bg-surface text-ink text-sm placeholder:text-ink-muted',
          'transition-all duration-300 ease-in-out shadow-sm hover:shadow-md hover:border-ink-muted/50',
          'focus:outline-none focus:ring-[3px] focus:ring-accent/30 focus:border-accent focus:shadow-md',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
          'dark:bg-surface-dark dark:text-ink-dark dark:placeholder:text-ink-muted',
          error
            ? 'border-danger focus:border-danger focus:ring-danger/30'
            : 'border-border dark:border-border-dark',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <slot name="suffix" />
    </div>

    <p v-if="error" :id="`${inputId}-error`" class="text-xs text-danger transition-all duration-300">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${inputId}-hint`" class="text-xs text-ink-muted transition-all duration-300">
      {{ hint }}
    </p>
  </div>
</template>