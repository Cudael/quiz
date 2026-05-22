import { THEME_INIT_SCRIPT } from '@/lib/theme'

export default function Head() {
  // Apply theme class before hydration to prevent a flash of incorrect theme.
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
}
