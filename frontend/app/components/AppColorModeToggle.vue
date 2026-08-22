<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'

const { theme, toggle } = useColorMode()
</script>

<template>
  <button
    type="button"
    class="inline-flex h-9 w-9 items-center justify-center rounded-button text-ink-muted hover:text-ink hover:bg-canvas transition-colors dark:hover:bg-canvas-dark dark:hover:text-ink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <Sun v-if="theme === 'dark'" class="h-4 w-4" />
    <Moon v-else class="h-4 w-4" />
  </button>
</template>