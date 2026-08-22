<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { CheckCircle2 } from 'lucide-vue-next'
import type { User } from '~/types/api'

const auth = useAuthStore()

const form = reactive({ name: '' })
const submitting = ref(false)
const nameError = ref<string | null>(null)
const submitError = ref<string | null>(null)
const saved = ref(false)

watch(
  () => auth.user,
  (user: User | null) => {
    form.name = user?.name ?? ''
  },
  { immediate: true },
)

async function onSubmit() {
  if (submitting.value || !auth.user) return
  const trimmed = form.name.trim()
  if (!trimmed) {
    nameError.value = 'Name is required'
    return
  }
  nameError.value = null

  if (trimmed === auth.user.name) {
    saved.value = true
    setTimeout(() => (saved.value = false), 1500)
    return
  }

  submitting.value = true
  submitError.value = null
  try {
    await auth.updateProfile({ name: trimmed })
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } catch (err: unknown) {
    const m = (err as { data?: { message?: string | string[] }; message?: string })?.data?.message
      ?? (err as { message?: string })?.message
    submitError.value = Array.isArray(m) ? m.join(', ') : m ?? 'Could not update profile'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6">
    <header>
      <p class="eyebrow">Identity</p>
      <h2 class="mt-1 font-display text-xl text-ink dark:text-ink-dark tracking-display-tight">
        How you sign things
      </h2>
      <p class="mt-1 text-sm text-ink-muted">
        Your name appears in greetings and the account menu. Email is fixed for now.
      </p>
    </header>

    <form class="mt-5 space-y-4" novalidate @submit.prevent="onSubmit">
      <AppInput
        v-model="form.name"
        label="Display name"
        placeholder="What should we call you?"
        required
        :error="nameError ?? undefined"
      />

      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-ink dark:text-ink-dark">Email</label>
        <input
          type="email"
          :value="auth.user?.email ?? ''"
          disabled
          class="block w-full h-10 px-3 rounded-input border border-border bg-canvas text-ink-muted text-sm cursor-not-allowed dark:bg-canvas-dark dark:border-border-dark"
        >
        <p class="text-xs text-ink-muted">Reach out if you ever need to change this.</p>
      </div>

      <p v-if="submitError" class="text-xs text-danger">{{ submitError }}</p>

      <div class="flex items-center gap-3">
        <AppButton variant="primary" size="sm" type="submit" :loading="submitting">
          Save changes
        </AppButton>
        <Transition
          enter-active-class="transition duration-200"
          leave-active-class="transition duration-150"
          enter-from-class="opacity-0 -translate-y-1"
          leave-to-class="opacity-0"
        >
          <span
            v-if="saved"
            class="inline-flex items-center gap-1.5 text-xs text-success"
          >
            <CheckCircle2 class="h-3.5 w-3.5" />
            Saved
          </span>
        </Transition>
      </div>
    </form>
  </section>
</template>
