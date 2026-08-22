export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (import.meta.client && !auth.ready) {
    await auth.init()
  }

  if (auth.isAuthenticated) return navigateTo('/dashboard')
})
