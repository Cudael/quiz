import { THEME_INIT_SCRIPT } from '@/lib/theme'

export default function Head() {
  // Apply theme class before hydration to prevent a flash of incorrect theme.
  // Safe: THEME_INIT_SCRIPT is a static compile-time string with no user-controlled input.
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
}
