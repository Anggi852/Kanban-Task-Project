<script setup lang="ts">
import { LayoutDashboard, KanbanSquare, BarChart3, History, UserCircle2, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

const { open, collapsed, close, toggleCollapse } = useSidebar()

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/boards', label: 'Boards', icon: KanbanSquare },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/activities', label: 'Activities', icon: History },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
]

function handleLogoClick() {
  // Collapse toggle only applies on desktop — mobile uses the overlay/backdrop pattern
  if (import.meta.client && window.innerWidth >= 1024) {
    toggleCollapse()
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-150"
    leave-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-30 bg-ink/40 lg:hidden"
      @click="close"
    />
  </Transition>

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 bg-surface border-r border-border flex flex-col overflow-hidden',
      'dark:bg-surface-dark dark:border-border-dark',
      'w-64 transition-[width,transform] duration-200 ease-out-expo',
      collapsed && 'lg:w-14',
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
    aria-label="Primary navigation"
  >
    <div
      :class="[
        'group relative h-16 flex items-center border-b border-border dark:border-border-dark shrink-0 select-none',
        'lg:cursor-pointer',
        collapsed ? 'lg:justify-center lg:px-0 px-6' : 'px-6',
      ]"
      :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      @click="handleLogoClick"
    >
      <AppLogo
        to="/"
        :show-text="!collapsed"
        class="shrink-0 transition-opacity duration-150 lg:group-hover:opacity-0 pointer-events-none"
      />

      <div
        class="hidden lg:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
      >
        <span class="flex h-9 w-9 items-center justify-center rounded-button bg-canvas/80 dark:bg-canvas-dark/80 text-ink dark:text-ink-dark">
          <ChevronsLeft v-if="!collapsed" class="h-4 w-4" />
          <ChevronsRight v-else class="h-4 w-4" />
        </span>
      </div>
    </div>

    <nav
      :class="[
        'flex-1 pt-3 pb-4 space-y-0.5 overflow-y-auto scrollbar-thin',
        collapsed ? 'lg:px-1.5 px-3' : 'px-3',
      ]"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :title="collapsed ? link.label : undefined"
        active-class="!text-ink dark:!text-ink-dark bg-accent-soft/60 dark:bg-accent-softDark"
        :class="[
          'group relative flex items-center gap-3 rounded-button h-10 text-sm font-medium',
          'text-ink-muted hover:text-ink dark:hover:text-ink-dark',
          'transition-colors duration-200 ease-out-expo',
          collapsed ? 'lg:justify-center lg:px-0 px-3' : 'px-3',
        ]"
        @click="close"
      >
        <component
          :is="link.icon"
          class="h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-out-expo group-hover:scale-110"
        />
        <span :class="{ 'lg:hidden': collapsed }">{{ link.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>