<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon?: Component
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center px-6 py-12">
    <div
      v-if="icon"
      class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-muted dark:bg-canvas-dark"
    >
      <component :is="icon" class="h-5 w-5" />
    </div>
    <h3 class="text-sm font-semibold text-ink dark:text-ink-dark">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-sm text-ink-muted max-w-sm">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>