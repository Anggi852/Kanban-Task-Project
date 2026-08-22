<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    quote?: string
    quoteAuthor?: string
  }>(),
  {
    quote: 'The secret of getting ahead is getting started.',
    quoteAuthor: 'Mark Twain',
  },
)
</script>

<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-[5fr_6fr]">
    <!-- Editorial brand panel -->
    <div class="hidden lg:flex flex-col justify-between p-14 bg-canvas dark:bg-canvas-dark border-r border-border dark:border-border-dark relative overflow-hidden grain">
      <AppLogo size="lg" />

      <figure class="relative z-10 max-w-md">
        <span class="font-display text-7xl leading-none text-accent dark:text-accent-ink select-none" aria-hidden="true">"</span>
        <blockquote class="-mt-6 font-display text-3xl font-light leading-[1.15] tracking-display-tight text-ink dark:text-ink-dark">
          {{ quote }}
        </blockquote>
        <figcaption class="mt-5 flex items-center gap-3">
          <span class="h-px w-8 bg-ink/40 dark:bg-ink-dark/40" />
          <span class="eyebrow">{{ quoteAuthor }}</span>
        </figcaption>
      </figure>

      <div class="relative z-10 flex items-end justify-between">
        <p class="eyebrow">Visual Task Tracking</p>
        <p class="font-display italic text-sm text-ink-muted">Est. 2026</p>
      </div>

      <!-- decorative deep-cut chevron -->
      <svg
        class="pointer-events-none absolute -bottom-20 -right-20 h-[28rem] w-[28rem] text-accent/8 dark:text-accent-ink/10"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="0.6" />
        <circle cx="100" cy="100" r="60" stroke="currentColor" stroke-width="0.6" />
        <circle cx="100" cy="100" r="40" stroke="currentColor" stroke-width="0.6" />
        <circle cx="100" cy="100" r="20" stroke="currentColor" stroke-width="0.6" />
      </svg>
    </div>

    <!-- Form panel -->
    <div class="relative flex flex-col items-stretch justify-center px-6 py-10 sm:px-12 bg-surface dark:bg-surface-dark">
      <div class="lg:hidden mb-8">
        <AppLogo />
      </div>

      <div class="w-full max-w-sm mx-auto">
        <p class="eyebrow">{{ title.includes('Welcome') ? 'Sign in' : 'New account' }}</p>
        <h1 class="mt-3 font-display text-4xl font-normal leading-[1.05] tracking-display-tight text-ink dark:text-ink-dark">
          {{ title }}
        </h1>
        <p v-if="description" class="mt-3 text-sm text-ink-muted leading-relaxed max-w-xs">
          {{ description }}
        </p>

        <div class="mt-9">
          <slot />
        </div>

        <div v-if="$slots.footer" class="mt-7 text-center text-sm text-ink-muted">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>
