'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { pageview } from '@/lib/analytics'
import { ANALYTICS_READY_EVENT } from '@/lib/consent'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    const trackPage = () => pageview(url)
    trackPage()
    window.addEventListener(ANALYTICS_READY_EVENT, trackPage)
    return () => window.removeEventListener(ANALYTICS_READY_EVENT, trackPage)
  }, [pathname, searchParams])

  return null
}
