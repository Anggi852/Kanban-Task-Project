const COLLAPSED_KEY = 'tf:sidebar-collapsed'

export function useSidebar() {
  const open = useState<boolean>('sidebar:open', () => false)
  const collapsed = useState<boolean>('sidebar:collapsed', () => {
    if (!import.meta.client) return false
    return localStorage.getItem(COLLAPSED_KEY) === 'true'
  })

  function toggle() { open.value = !open.value }
  function close() { open.value = false }
  function toggleCollapse() {
    collapsed.value = !collapsed.value
    if (import.meta.client) {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed.value))
    }
  }

  return { open, collapsed, toggle, close, toggleCollapse }
}
