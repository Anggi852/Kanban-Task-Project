<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

type Size = 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    size?: Size
    label?: string
  }>(),
  {
    size: 'md',
  },
)

const sizes: Record<Size, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 text-ink-muted"
    role="status"
    :aria-label="label || 'Loading'"
  >
    <Loader2 :class="['animate-spin', sizes[size]]" />
    <span v-if="label" class="text-sm">{{ label }}</span>
  </div>
</template>