<script setup lang="ts">
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fnbwvodblnlruzgyiguq.supabase.co'
const supabaseKey = 'sb_publishable_tgyQKJqW8lEeaOe6dQXgFw_PsHHVDG_'

const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

const loading = ref(false)
const errorMessage = ref('')

async function signInWithGoogle() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',

      options: {
        redirectTo: 'https://kanban-task-project.vercel.app',
      },
    })

    if (error) {
      console.error('Google OAuth Error:', error)
      errorMessage.value = error.message
    }
  } catch (error) {
    console.error('Unexpected Google OAuth Error:', error)
    errorMessage.value = 'Google sign-in failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <button
      type="button"
      :disabled="loading"
      @click="signInWithGoogle"
      class="w-full flex items-center justify-center gap-3 rounded-input border border-border dark:border-border-dark px-4 py-3 font-medium transition hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="loading">
        Signing in...
      </span>

      <template v-else>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M21.35 12.23c0-.79-.07-1.55-.22-2.28H12v4.32h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.4z"
          />
          <path
            fill="#34A853"
            d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.51A9.75 9.75 0 0 0 12 21.5z"
          />
          <path
            fill="#FBBC05"
            d="M6.54 13.6a5.86 5.86 0 0 1 0-3.2V7.89H3.29a9.75 9.75 0 0 0 0 8.22l3.25-2.51z"
          />
          <path
            fill="#EA4335"
            d="M12 6.37c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.47 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.71 5.39l3.25 2.51C7.31 8.09 9.46 6.37 12 6.37z"
          />
        </svg>

        <span>Continue with Google</span>
      </template>
    </button>

    <p
      v-if="errorMessage"
      class="mt-3 text-sm text-red-500"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>