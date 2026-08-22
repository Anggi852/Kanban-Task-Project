type Theme = 'light' | 'dark'

const STORAGE_KEY = 'tf:theme'

function detectSystem(): Theme {
  if (!import.meta.client) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStored(): Theme | null {
  if (!import.meta.client) return null
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'dark' || v === 'light' ? v : null
}

function apply(theme: Theme) {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function useColorMode() {
  const theme = useState<Theme>('color-mode', () => readStored() ?? detectSystem())

  if (import.meta.client) {
    watchEffect(() => {
      apply(theme.value)
      localStorage.setItem(STORAGE_KEY, theme.value)
    })
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function set(next: Theme) {
    theme.value = next
  }

  return { theme, toggle, set }
}
