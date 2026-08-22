<script setup lang="ts">
const auth = useAuthStore()

if (import.meta.client && !auth.ready) {
  auth.init()
}
</script>

<template>
  <header
    class="sticky top-0 z-20 backdrop-blur bg-canvas/80 border-b border-border dark:bg-canvas-dark/80 dark:border-border-dark"
  >
    <div class="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
      <AppLogo />

      <nav class="flex items-center gap-2">
        <AppColorModeToggle />

        <template v-if="auth.isAuthenticated">
          <NuxtLink to="/dashboard">
            <AppButton variant="primary" size="sm">Go to dashboard</AppButton>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="hidden sm:block">
            <AppButton variant="ghost" size="sm">Login</AppButton>
          </NuxtLink>
          <NuxtLink to="/register">
            <AppButton variant="primary" size="sm">Get started</AppButton>
          </NuxtLink>
        </template>
      </nav>
    </div>
  </header>
</template>