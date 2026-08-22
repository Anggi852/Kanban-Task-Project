<template>
  <section>
    <div class="mx-auto max-w-4xl px-6 py-20 sm:py-24">
      <div
        class="relative overflow-hidden rounded-modal border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-10 sm:p-14 text-center"
      >
        <div
          class="pointer-events-none absolute -top-20 -right-12 h-48 w-48 rounded-full bg-accent-soft dark:bg-accent-softDark opacity-80 blur-3xl"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-success-soft dark:bg-success-softDark opacity-70 blur-3xl"
          aria-hidden="true"
        />

        <div class="relative">
          <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-ink dark:text-ink-dark">
            Start your first board today.
          </h2>
          <p class="mt-3 text-ink-muted max-w-xl mx-auto">
            Create an account, set up a board, and move your first task to
            Done in under a minute.
          </p>

          <div class="mt-7 flex flex-wrap justify-center gap-3">
            <NuxtLink to="/register">
              <AppButton variant="primary" size="lg">Create account</AppButton>
            </NuxtLink>
            <NuxtLink to="/login">
              <AppButton variant="secondary" size="lg">Sign in</AppButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
