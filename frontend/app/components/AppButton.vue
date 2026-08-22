<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disabled?: boolean
    block?: boolean
    icon?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    loading: false,
    disabled: false,
    block: false,
    icon: false,
  },
)

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-canvas hover:bg-ink/90 active:translate-y-px shadow-sm ' +
    'dark:bg-ink-dark dark:text-canvas-dark dark:hover:bg-ink-dark/90',
  secondary:
    'bg-surface text-ink hover:border-ink/40 border border-border ' +
    'dark:bg-surface-dark dark:text-ink-dark dark:border-border-dark dark:hover:border-ink-dark/40',
  danger:
    'bg-danger text-white hover:bg-danger/90 active:translate-y-px shadow-sm',
  ghost:
    'bg-transparent text-ink hover:bg-surface ' +
    'dark:text-ink-dark dark:hover:bg-surface-dark',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

const iconSizes: Record<Size, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center rounded-button font-medium transition-all duration-200 ease-out-expo',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-none',
      icon ? iconSizes[size] : sizes[size],
      variants[variant],
      block ? 'w-full' : '',
    ]"
  >
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
    <slot />
  </button>
</template>