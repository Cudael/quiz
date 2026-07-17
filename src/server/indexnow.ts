import 'server-only'
import { absoluteUrl, siteUrl } from '@/lib/site'

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/** IndexNow keys are 8–128 hexadecimal/dash characters (per the protocol spec). */
const KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim()
  return key && KEY_PATTERN.test(key) ? key : null
}

/**
 * Best-effort ping so IndexNow-enabled engines (Bing, Yandex, Seznam, Naver)
 * re-crawl the given paths promptly — used when content is published,
 * unpublished, or deleted. No-op without a configured key or off production,
 * and never throws: indexing hints must not break the calling action.
 */
export async function notifyIndexNow(paths: string[]): Promise<void> {
  const key = getIndexNowKey()
  if (!key || paths.length === 0) return

  const host = new URL(siteUrl).host
  if (host.includes('localhost')) return

  try {
    await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation: absoluteUrl('/indexnow-key.txt'),
        urlList: paths.map((path) => absoluteUrl(path)),
      }),
    })
  } catch {
    // Best-effort only — a failed ping just means engines discover the change later.
  }
}
