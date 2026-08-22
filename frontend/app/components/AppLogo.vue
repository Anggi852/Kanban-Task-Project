<script setup lang="ts">
type Size = 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    size?: Size
    to?: string
    showText?: boolean
  }>(),
  {
    size: 'md',
    to: '/',
    showText: true,
  },
)

const markSizes: Record<Size, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

const textSizes: Record<Size, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
}
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'span'"
    :to="to"
    class="inline-flex items-center gap-2.5 text-ink dark:text-ink-dark transition-colors duration-300 ease-out-expo hover:text-accent dark:hover:text-accent-ink"
  >
    <span
      :class="[
        'relative inline-flex items-center justify-center rounded-[7px] bg-ink text-canvas dark:bg-ink-dark dark:text-canvas-dark',
        markSizes[size],
      ]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" class="h-[60%] w-[60%]" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
        <line x1="8" y1="6" x2="8" y2="26" />
        <line x1="16" y1="6" x2="16" y2="18" />
        <line x1="24" y1="6" x2="24" y2="12" />
      </svg>
      <span class="absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
    </span>

    <span v-if="showText" :class="['font-display font-normal tracking-display-tight', textSizes[size]]">
      Task<span class="italic display-em">flow</span>
    </span>
  </component>
</template>