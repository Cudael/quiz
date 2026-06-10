interface R2Object {
  body: ReadableStream | null
  httpEtag: string
  writeHttpMetadata(headers: Headers): void
}

interface R2Bucket {
  get(key: string): Promise<R2Object | null>
}

interface Env {
  R2_BUCKET: R2Bucket
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      })
    }

    const key = url.pathname.slice(1)
    if (!key) {
      return new Response('Not Found', { status: 404 })
    }

    const object = await env.R2_BUCKET.get(key)
    if (!object) {
      return new Response('Not Found', { status: 404 })
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('cache-control', 'public, max-age=31536000, immutable')

    if (request.method === 'HEAD') {
      return new Response(null, { headers })
    }

    return new Response(object.body, { headers })
  },
}

export default worker
