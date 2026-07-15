import { getAdsTxtRecord, normalizeAdSensePublisherId } from '@/lib/adsense'

export function GET() {
  const publisherId = normalizeAdSensePublisherId(process.env.GOOGLE_ADSENSE_PUBLISHER_ID)
  if (!publisherId) {
    return new Response('AdSense publisher ID is not configured.\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  return new Response(`${getAdsTxtRecord(publisherId)}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
