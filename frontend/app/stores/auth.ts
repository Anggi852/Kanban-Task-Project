import { defineStore } from 'pinia'
import type { User } from '~/types/api'

interface AuthState {
  user: User | null
  ready: boolean
  initInflight: Promise<void> | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    ready: false,
    initInflight: null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.user,
  },

  actions: {
    async init(force = false) {
      if (!import.meta.client) return
      if (this.ready && !force) return
      if (this.initInflight) return this.initInflight

      clearLegacyStorage()

      this.initInflight = (async () => {
        const api = useApi()
        try {
          const user = await api.get<User>('/users/me')
          this.user = user
        } catch {
          this.user = null
        } finally {
          this.ready = true
          this.initInflight = null
        }
      })()

      return this.initInflight
    },

    async login(email: string, password: string) {
      const api = useApi()
      await api.post('/auth/login', { email, password })
      this.resetUserData()
      await this.fetchMe()
    },

    async register(name: string, email: string, password: string) {
      const api = useApi()
      await api.post('/auth/register', { name, email, password })
      this.resetUserData()
      await this.fetchMe()
    },

    async fetchMe() {
      const api = useApi()
      try {
        const user = await api.get<User>('/users/me')
        this.user = user
        this.ready = true
        return user
      } catch (err) {
        this.user = null
        this.ready = true
        throw err
      }
    },

    async updateProfile(patch: { name?: string }) {
      const api = useApi()
      const updated = await api.patch<User>('/users/me', patch)
      this.user = updated
      return updated
    },

    async changePassword(payload: { currentPassword: string; newPassword: string }) {
      const api = useApi()
      await api.post('/users/me/password', payload)
    },

    async logout() {
      const api = useApi()
      try {
        await api.post('/auth/logout')
      } catch {
        // ignore — clear session locally regardless
      }
      this.clearSession()
      await navigateTo('/login')
    },

    clearSession() {
      this.user = null
      this.ready = true
      clearLegacyStorage()
      this.resetUserData()
    },

    // Reset per-user data stores so one account's boards/analytics/activities
    // never leak into another when accounts are switched client-side (no full
    // page reload). The boards store caches with a `loaded` guard, so without
    // this it would keep serving the previous user's (or empty) list.
    resetUserData() {
      if (!import.meta.client) return
      useBoardsStore().$reset()
      useBoardStore().$reset()
      useAnalyticsStore().$reset()
      useActivitiesStore().$reset()
    },
  },
})

function clearLegacyStorage() {
  if (!import.meta.client) return
  try {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  } catch {
    // localStorage may be unavailable in some environments — ignore
  }
}
