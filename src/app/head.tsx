import { THEME_INIT_SCRIPT } from '@/lib/theme'

export default function Head() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
}
