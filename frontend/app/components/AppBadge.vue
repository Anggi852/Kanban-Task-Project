<script setup lang="ts">
type Variant = 'success' | 'warning' | 'danger' | 'neutral' | 'accent'
type Size = 'sm' | 'md'

withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
  }>(),
  {
    variant: 'neutral',
    size: 'md',
  },
)

const variants: Record<Variant, string> = {
  success:
    'bg-success-soft text-success dark:bg-success-softDark dark:text-success',
  warning:
    'bg-warning-soft text-warning dark:bg-warning-softDark dark:text-warning',
  danger:
    'bg-danger-soft text-danger dark:bg-danger-softDark dark:text-danger',
  accent:
    'bg-accent-soft text-accent dark:bg-accent-softDark dark:text-accent',
  neutral:
    'bg-canvas text-ink-muted border border-border dark:bg-canvas-dark dark:border-border-dark',
}

const sizes: Record<Size, string> = {
  sm: 'h-5 px-1.5 text-[10px]',
  md: 'h-6 px-2 text-xs',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full font-medium uppercase tracking-wide',
      variants[variant],
      sizes[size],
    ]"
  >
    <slot />
  </span>
</template>