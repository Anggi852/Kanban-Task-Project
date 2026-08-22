<template>
  <div class="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark">
    <div class="flex flex-col items-center gap-4">
      <AppLogo />
      <div class="flex items-center gap-1.5 mt-2">
        <span
          v-for="i in 3"
          :key="i"
          class="h-1.5 w-1.5 rounded-full bg-accent animate-bounce"
          :style="{ animationDelay: `${(i - 1) * 150}ms` }"
        />
      </div>
    </div>
  </div>
</template>
