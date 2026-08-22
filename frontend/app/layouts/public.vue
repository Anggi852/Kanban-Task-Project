<template>
  <div class="min-h-screen flex flex-col bg-canvas text-ink dark:bg-canvas-dark dark:text-ink-dark">
    <AppNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
