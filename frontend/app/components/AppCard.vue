<script setup lang="ts">
withDefaults(
  defineProps<{
    padded?: boolean
    hoverable?: boolean
    as?: string
  }>(),
  {
    padded: true,
    hoverable: false,
    as: 'div',
  },
)
</script>

<template>
  <component
    :is="as"
    :class="[
      'bg-surface border border-border rounded-card shadow-card transition-colors duration-150',
      'dark:bg-surface-dark dark:border-border-dark',
      padded ? 'p-6' : '',
      hoverable ? 'hover:border-ink-muted/30 dark:hover:border-ink-muted/40 cursor-pointer' : '',
    ]"
  >
    <slot />
  </component>
</template>