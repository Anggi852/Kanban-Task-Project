<template>
  <AuthCard
    title="Welcome back"
    description="Sign in to keep momentum on your work."
  >
    <LoginForm @success="onSuccess" />

    <div class="my-6 flex items-center gap-3">
      <span class="h-px flex-1 bg-border dark:bg-border-dark" />
      <span class="text-xs uppercase tracking-wide text-ink-muted">or</span>
      <span class="h-px flex-1 bg-border dark:bg-border-dark" />
    </div>

    <!-- Biarkan SATU tombol Google ini tetap ada -->
    <GoogleSignInButton />

    <p
      v-if="oauthError"
      class="mt-4 text-sm text-danger bg-danger-soft dark:bg-danger-softDark rounded-input px-3 py-2"
      role="alert"
    >
      Google sign-in failed. Please try again.
    </p>

    <template #footer>
      Don't have an account?
      <NuxtLink to="/register" class="text-accent font-medium hover:underline ml-1">
        Create one
      </NuxtLink>
    </template>
  </AuthCard>
</template>