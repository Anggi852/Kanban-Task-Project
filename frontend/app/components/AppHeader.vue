<script setup lang="ts">
import { Menu, LogOut, User } from 'lucide-vue-next'

defineProps<{
  title?: string
  description?: string
}>()

const { toggle: toggleSidebar } = useSidebar()
const auth = useAuthStore()

async function handleLogout() {
  await auth.logout()
}
</script>

<template>
  <header
    class="sticky top-0 z-20 bg-canvas/80 backdrop-blur border-b border-border dark:bg-canvas-dark/80 dark:border-border-dark"
  >
    <div class="h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
      <button
        type="button"
        class="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-button text-ink-muted hover:bg-canvas hover:text-ink dark:hover:bg-canvas-dark dark:hover:text-ink-dark"
        aria-label="Open navigation"
        @click="toggleSidebar"
      >
        <Menu class="h-5 w-5" />
      </button>

      <div class="min-w-0 flex-1">
        <h1
          v-if="title"
          class="font-display text-xl sm:text-[1.65rem] font-normal leading-tight tracking-display-tight text-ink dark:text-ink-dark truncate"
        >
          {{ title }}
        </h1>
        <p v-if="description" class="text-xs text-ink-muted truncate mt-0.5">
          {{ description }}
        </p>
        <slot />
      </div>

      <div class="flex items-center gap-1">
        <slot name="actions" />
        <AppColorModeToggle />

        <AppDropdown>
          <template #trigger="{ toggle }">
            <button
              type="button"
              class="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-button hover:bg-canvas dark:hover:bg-canvas-dark transition-colors"
              :aria-label="auth.user?.name || auth.user?.email || 'Account'"
              @click="toggle"
            >
              <AppAvatar :name="auth.user?.name" :email="auth.user?.email" size="sm" />
              <span class="hidden sm:inline text-sm font-medium text-ink dark:text-ink-dark max-w-[10rem] truncate">
                {{ auth.user?.name || auth.user?.email || 'Account' }}
              </span>
            </button>
          </template>

          <template #default>
            <div class="px-3 py-2 border-b border-border dark:border-border-dark">
              <p class="text-sm font-medium text-ink dark:text-ink-dark truncate">
                {{ auth.user?.name || 'Account' }}
              </p>
              <p v-if="auth.user?.email" class="text-xs text-ink-muted truncate">
                {{ auth.user.email }}
              </p>
            </div>
            <nav class="py-1">
              <NuxtLink
                to="/profile"
                class="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas dark:text-ink-dark dark:hover:bg-canvas-dark"
              >
                <User class="h-4 w-4" />
                Profile
              </NuxtLink>
              <button
                type="button"
                class="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-soft dark:hover:bg-danger-softDark"
                @click="handleLogout"
              >
                <LogOut class="h-4 w-4" />
                Logout
              </button>
            </nav>
          </template>
        </AppDropdown>
      </div>
    </div>
  </header>
</template>