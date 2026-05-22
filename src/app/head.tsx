const themeInitScript = `
(() => {
  try {
    const stored = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
    const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    root.style.colorScheme = resolved
  } catch (_e) {}
})()
`

export default function Head() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
}
