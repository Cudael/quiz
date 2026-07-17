import type { SVGProps } from 'react'

/** Brand glyphs lucide doesn't ship (X, TikTok). Sized/colored via className like lucide icons. */

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  )
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.23V2h-3.2v13.22a2.89 2.89 0 1 1-2-2.75V9.2a6.13 6.13 0 1 0 5.2 6.05V8.67a8.1 8.1 0 0 0 4.77 1.56V7.06c-.34 0-.67-.13-1-.37Z" />
    </svg>
  )
}
