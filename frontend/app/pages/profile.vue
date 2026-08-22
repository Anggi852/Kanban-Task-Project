<script setup lang="ts">
import { computed } from 'vue'
import { LogOut } from 'lucide-vue-next'
import { formatDate } from '~/utils/format'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

useHead({ title: 'Profile — TaskFlow' })

const auth = useAuthStore()

const memberSince = computed(() => formatDate(auth.user?.createdAt))

async function onLogout() {
  await auth.logout()
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <div class="grid gap-8 lg:grid-cols-[1fr_260px]">

      <!-- Left: settings forms -->
      <div class="min-w-0 space-y-8 order-2 lg:order-1">
        <div class="border-b border-border dark:border-border-dark pb-5">
          <p class="eyebrow">Your corner</p>
          <h1 class="mt-2 font-display text-3xl sm:text-4xl font-normal leading-tight tracking-display-tight text-ink dark:text-ink-dark">
            {{ auth.user?.name || 'Account' }}
          </h1>
          <p class="mt-2 text-sm text-ink-muted">
            Manage how you sign in and how your name appears.
          </p>
        </div>

        <ProfileForm />
        <PasswordForm />

        <section class="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6">
          <header>
            <p class="eyebrow">Sign out</p>
            <h2 class="mt-1 font-display text-xl text-ink dark:text-ink-dark tracking-display-tight">
              Close this session
            </h2>
            <p class="mt-1 text-sm text-ink-muted">
              You'll come back to a fresh sign-in screen. Your boards stay exactly where you left them.
            </p>
          </header>

          <div class="mt-5">
            <AppButton variant="secondary" size="sm" @click="onLogout">
              <LogOut class="h-4 w-4" />
              Sign out
            </AppButton>
          </div>
        </section>
      </div>

      <!-- Right: identity card -->
      <aside class="order-1 lg:order-2">
        <div class="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 sticky top-24">
          <div class="flex flex-col items-center text-center gap-3">
            <AppAvatar
              :name="auth.user?.name"
              :email="auth.user?.email"
              size="xl"
            />
            <div class="min-w-0 w-full">
              <p class="font-semibold text-sm text-ink dark:text-ink-dark truncate">
                {{ auth.user?.name || auth.user?.email || 'Account' }}
              </p>
              <p class="text-xs text-ink-muted mt-0.5 truncate">{{ auth.user?.email }}</p>
            </div>
          </div>

          <dl class="mt-5 space-y-3 border-t border-border dark:border-border-dark pt-4">
            <div class="flex items-start justify-between gap-2 text-xs">
              <dt class="text-ink-muted shrink-0">Member since</dt>
              <dd class="text-ink dark:text-ink-dark font-medium text-right">
                {{ memberSince || '—' }}
              </dd>
            </div>
            <div class="flex items-start justify-between gap-2 text-xs">
              <dt class="text-ink-muted shrink-0">Account ID</dt>
              <dd class="text-ink-muted font-mono text-right truncate max-w-[120px]" :title="auth.user?.id">
                {{ auth.user?.id?.slice(0, 8) }}…
              </dd>
            </div>
          </dl>
        </div>
      </aside>

    </div>
  </NuxtLayout>
</template>
