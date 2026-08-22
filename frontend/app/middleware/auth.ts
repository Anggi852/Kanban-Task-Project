export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  if (import.meta.client && !auth.ready) {
    await auth.init()
  }

  if (!auth.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
