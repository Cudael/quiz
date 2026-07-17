import { getIndexNowKey } from '@/server/indexnow'

/** IndexNow key-ownership proof — referenced as `keyLocation` in every ping. */
export function GET() {
  const key = getIndexNowKey()
  if (!key) {
    return new Response('IndexNow key is not configured.\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  return new Response(`${key}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
