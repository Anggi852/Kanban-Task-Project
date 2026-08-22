<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest',
})

useHead({ title: 'Create account — TaskFlow' })

function onSuccess() {
  navigateTo('/dashboard')
}
</script>

<template>
  <AuthCard
    title="Create your account"
    description="Start tracking your tasks in a calm, focused workspace."
    quote="The way to get started is to quit talking and begin doing."
    quote-author="Walt Disney"
  >
    <RegisterForm @success="onSuccess" />

    <div class="my-6 flex items-center gap-3">
      <span class="h-px flex-1 bg-border dark:bg-border-dark" />
      <span class="text-xs uppercase tracking-wide text-ink-muted">or</span>
      <span class="h-px flex-1 bg-border dark:bg-border-dark" />
    </div>

    <GoogleSignInButton label="Sign up with Google" />

    <template #footer>
      Already have an account?
      <NuxtLink to="/login" class="text-accent font-medium hover:underline ml-1">
        Sign in
      </NuxtLink>
    </template>
  </AuthCard>
</template>
