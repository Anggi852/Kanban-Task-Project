<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const emit = defineEmits<{
  success: []
}>()

const auth = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirm: '',
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const fieldErrors = reactive<{ name?: string; email?: string; password?: string; confirm?: string }>({})

function validate() {
  fieldErrors.name = undefined
  fieldErrors.email = undefined
  fieldErrors.password = undefined
  fieldErrors.confirm = undefined
  let ok = true

  if (!form.name) {
    fieldErrors.name = 'Name is required'
    ok = false
  } else if (form.name.length < 3 || form.name.length > 30) {
    fieldErrors.name = 'Use 3 to 30 characters'
    ok = false
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.name)) {
    fieldErrors.name = 'Letters, numbers and underscores only'
    ok = false
  }

  if (!form.email) {
    fieldErrors.email = 'Email is required'
    ok = false
  } else if (!/.+@.+\..+/.test(form.email)) {
    fieldErrors.email = 'Enter a valid email address'
    ok = false
  }

  if (!form.password) {
    fieldErrors.password = 'Password is required'
    ok = false
  } else if (form.password.length < 8) {
    fieldErrors.password = 'Use at least 8 characters'
    ok = false
  }

  if (form.confirm !== form.password) {
    fieldErrors.confirm = 'Passwords do not match'
    ok = false
  }

  return ok
}

async function onSubmit() {
  error.value = null
  if (!validate()) return

  loading.value = true
  try {
    await auth.register(form.name, form.email, form.password)
    emit('success')
  } catch (err: unknown) {
    const message =
      (err as { data?: { message?: string | string[] } })?.data?.message ||
      (err as { message?: string })?.message ||
      'Registration failed. Try a different email.'
    error.value = Array.isArray(message) ? message.join(', ') : message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <AppInput
      v-model="form.name"
      label="Name"
      placeholder="ada_lovelace"
      autocomplete="username"
      hint="3-30 characters · letters, numbers and underscores"
      required
      :error="fieldErrors.name"
    />

    <AppInput
      v-model="form.email"
      label="Email address"
      type="email"
      placeholder="you@example.com"
      autocomplete="email"
      required
      :error="fieldErrors.email"
    />

    <AppInput
      v-model="form.password"
      label="Password"
      :type="showPassword ? 'text' : 'password'"
      placeholder="At least 8 characters"
      autocomplete="new-password"
      required
      :error="fieldErrors.password"
    >
      <template #suffix>
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink dark:hover:text-ink-dark transition-colors"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          <EyeOff v-if="showPassword" class="h-4 w-4" />
          <Eye v-else class="h-4 w-4" />
        </button>
      </template>
    </AppInput>

    <AppInput
      v-model="form.confirm"
      label="Confirm password"
      :type="showPassword ? 'text' : 'password'"
      placeholder="Repeat password"
      autocomplete="new-password"
      required
      :error="fieldErrors.confirm"
    />

    <p
      v-if="error"
      class="text-sm text-danger bg-danger-soft dark:bg-danger-softDark rounded-input px-3 py-2"
      role="alert"
    >
      {{ error }}
    </p>

    <AppButton type="submit" variant="primary" size="lg" :loading="loading" block>
      {{ loading ? 'Creating account…' : 'Create account' }}
    </AppButton>
  </form>
</template>
