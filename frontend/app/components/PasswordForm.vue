<script setup lang="ts">
import { reactive, ref } from 'vue'
import { CheckCircle2 } from 'lucide-vue-next'

const auth = useAuthStore()

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive<{
  currentPassword: string | null
  newPassword: string | null
  confirmPassword: string | null
}>({
  currentPassword: null,
  newPassword: null,
  confirmPassword: null,
})

const submitting = ref(false)
const submitError = ref<string | null>(null)
const saved = ref(false)

function validate(): boolean {
  let ok = true
  errors.currentPassword = null
  errors.newPassword = null
  errors.confirmPassword = null

  if (!form.currentPassword) {
    errors.currentPassword = 'Enter your current password'
    ok = false
  }
  if (!form.newPassword || form.newPassword.length < 8) {
    errors.newPassword = 'At least 8 characters'
    ok = false
  }
  if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = "Doesn't match"
    ok = false
  }
  if (form.newPassword && form.currentPassword === form.newPassword) {
    errors.newPassword = 'New password must differ from current'
    ok = false
  }
  return ok
}

async function onSubmit() {
  if (submitting.value) return
  if (!validate()) return

  submitting.value = true
  submitError.value = null
  try {
    await auth.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    })
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } catch (err: unknown) {
    const m = (err as { data?: { message?: string | string[] }; message?: string })?.data?.message
      ?? (err as { message?: string })?.message
    submitError.value = Array.isArray(m) ? m.join(', ') : m ?? 'Could not change password'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6">
    <header>
      <p class="eyebrow">Security</p>
      <h2 class="mt-1 font-display text-xl text-ink dark:text-ink-dark tracking-display-tight">
        Change your password
      </h2>
      <p class="mt-1 text-sm text-ink-muted">
        Updating your password signs out other sessions you might have lingering.
      </p>
    </header>

    <form class="mt-5 space-y-4" novalidate @submit.prevent="onSubmit">
      <AppInput
        v-model="form.currentPassword"
        label="Current password"
        type="password"
        autocomplete="current-password"
        required
        :error="errors.currentPassword ?? undefined"
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <AppInput
          v-model="form.newPassword"
          label="New password"
          type="password"
          autocomplete="new-password"
          required
          :error="errors.newPassword ?? undefined"
          hint="Minimum 8 characters"
        />
        <AppInput
          v-model="form.confirmPassword"
          label="Confirm new password"
          type="password"
          autocomplete="new-password"
          required
          :error="errors.confirmPassword ?? undefined"
        />
      </div>

      <p v-if="submitError" class="text-xs text-danger">{{ submitError }}</p>

      <div class="flex items-center gap-3">
        <AppButton variant="primary" size="sm" type="submit" :loading="submitting">
          Update password
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
            Password changed
          </span>
        </Transition>
      </div>
    </form>
  </section>
</template>
