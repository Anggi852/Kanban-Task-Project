<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border dark:border-border-dark bg-canvas dark:bg-canvas-dark">
    <div class="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <AppLogo size="sm" />
        <span class="text-xs text-ink-muted">Personal task tracking</span>
      </div>

      <p class="text-xs text-ink-muted">
        © {{ year }} TaskFlow. Built for focused work.
      </p>
    </div>
  </footer>
</template>