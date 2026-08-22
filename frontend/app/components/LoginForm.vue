<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const emit = defineEmits<{
  success: []
}>()

const auth = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const fieldErrors = reactive<{ email?: string; password?: string }>({})

function validate() {
  fieldErrors.email = undefined
  fieldErrors.password = undefined
  let ok = true
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
  }
  return ok
}

async function onSubmit() {
  error.value = null
  if (!validate()) return

  loading.value = true
  try {
    await auth.login(form.email, form.password)
    emit('success')
  } catch (err: unknown) {
    const message =
      (err as { data?: { message?: string }; message?: string })?.data?.message ||
      (err as { message?: string })?.message ||
      'Login failed. Check your credentials and try again.'
    error.value = Array.isArray(message) ? message.join(', ') : message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
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
      placeholder="••••••••"
      autocomplete="current-password"
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

    <p
      v-if="error"
      class="text-sm text-danger bg-danger-soft dark:bg-danger-softDark rounded-input px-3 py-2"
      role="alert"
    >
      {{ error }}
    </p>

    <AppButton type="submit" variant="primary" size="lg" :loading="loading" block>
      {{ loading ? 'Signing in…' : 'Sign in' }}
    </AppButton>
  </form>
</template>
