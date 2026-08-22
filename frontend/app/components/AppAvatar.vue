<script setup lang="ts">
import { computed } from 'vue'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const props = withDefaults(
  defineProps<{
    name?: string | null
    email?: string | null
    size?: Size
  }>(),
  {
    size: 'md',
  },
)

const sizes: Record<Size, string> = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

const initials = computed(() => {
  const source = (props.name || props.email || '').trim()
  if (!source) return '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center justify-center rounded-full bg-accent-soft text-accent font-semibold',
      'dark:bg-accent-softDark',
      sizes[size],
    ]"
    :aria-label="name || email || 'User'"
  >
    {{ initials }}
  </span>
</template>