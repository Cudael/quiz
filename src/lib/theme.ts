export const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)'

export const THEME_INIT_SCRIPT = `
(() => {
  try {
    const stored = localStorage.getItem('theme')
    const systemDark = window.matchMedia('${THEME_MEDIA_QUERY}').matches
    const theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
    const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    root.style.colorScheme = resolved
  } catch (_e) {}
})()
`
