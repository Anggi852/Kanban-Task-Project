import type { FetchOptions } from 'ofetch'

let refreshInflight: Promise<boolean> | null = null

async function attemptRefresh(apiBase: string): Promise<boolean> {
  if (refreshInflight) return refreshInflight
  refreshInflight = (async () => {
    try {
      const res = await fetch(`${apiBase}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      return res.ok
    } catch {
      return false
    } finally {
      refreshInflight = null
    }
  })()
  return refreshInflight
}

export function useApi() {
  const config = useRuntimeConfig()
  // On SSR server: use private apiBase (direct backend URL, no nginx hop).
  // On browser: use public apiBase (same-origin /api through nginx).
  const apiBase = (import.meta.server
    ? (config.apiBase as string) || (config.public.apiBase as string)
    : (config.public.apiBase as string)
  )

  async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const doFetch = () =>
      $fetch<T>(path, {
        baseURL: apiBase,
        credentials: 'include',
        ...options,
      })

    try {
      return await doFetch()
    } catch (err: any) {
      const status = err?.response?.status ?? err?.statusCode
      if (status !== 401 || path.startsWith('/auth/')) throw err

      const refreshed = await attemptRefresh(apiBase)
      if (!refreshed) {
        const auth = useAuthStore()
        await auth.clearSession()
        throw err
      }
      return await doFetch()
    }
  }

  return {
    get: <T>(path: string, options?: FetchOptions) =>
      request<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
      request<T>(path, { ...options, method: 'POST', body: body as any }),
    patch: <T>(path: string, body?: unknown, options?: FetchOptions) =>
      request<T>(path, { ...options, method: 'PATCH', body: body as any }),
    delete: <T>(path: string, options?: FetchOptions) =>
      request<T>(path, { ...options, method: 'DELETE' }),
    raw: request,
  }
}
