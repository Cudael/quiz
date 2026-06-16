import { BarChart3, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function StatisticsPage() {
  const isGaConfigured = !!GA_MEASUREMENT_ID

  return (
    <div className="space-y-6">
      <PageHeader title="Statistics" description="Website analytics and traffic insights." />

      {/* Google Analytics */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold">Google Analytics 4</h3>
              <p className="text-xs text-muted-foreground">Comprehensive traffic analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {isGaConfigured ? (
              <>
                <CheckCircle className="h-4 w-4 text-quiz-green" />
                <span className="text-quiz-green font-medium">Active</span>
                <span className="text-muted-foreground">· ID: {GA_MEASUREMENT_ID}</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Not configured</span>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Tracks:</strong> Page views, traffic sources, user behavior, demographics,
              device data, geographic data
            </p>
            <p>
              <strong>Privacy:</strong> Uses cookies, requires consent in some regions
            </p>
          </div>

          {isGaConfigured ? (
            <a
              href={`https://analytics.google.com/analytics/web/#/p${GA_MEASUREMENT_ID?.replace('G-', 'a')}/reports`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Open GA4 Dashboard
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">
              Add <code className="rounded bg-muted px-1">NEXT_PUBLIC_GA_MEASUREMENT_ID</code> to
              your <code className="rounded bg-muted px-1">.env</code> file to enable.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cloudflare Analytics (built-in) */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <BarChart3 className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold">Cloudflare Analytics</h3>
              <p className="text-xs text-muted-foreground">Built-in, no setup required</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-quiz-green" />
            <span className="text-quiz-green font-medium">Active</span>
            <span className="text-muted-foreground">· Automatic via Cloudflare proxy</span>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Tracks:</strong> Page views, traffic sources, Core Web Vitals, bot traffic
            </p>
            <p>
              <strong>Privacy:</strong> No cookies, GDPR-compliant by default
            </p>
          </div>

          <a
            href="https://dash.cloudflare.com/?to=/:account/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Open Cloudflare Dashboard
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </CardContent>
      </Card>

      {/* Quick reference */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-bold mb-3">What gets tracked</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div>
              <p className="font-medium mb-1">Page Views</p>
              <p className="text-muted-foreground">
                Every page navigation is tracked automatically.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Traffic Sources</p>
              <p className="text-muted-foreground">
                Where visitors come from: direct, search, social, referral.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">User Metrics</p>
              <p className="text-muted-foreground">
                Active users, session duration, pages per session.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Device Data</p>
              <p className="text-muted-foreground">Browser, OS, screen size, mobile vs desktop.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Core Web Vitals</p>
              <p className="text-muted-foreground">LCP, FID, CLS — via Cloudflare.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Geographic Data</p>
              <p className="text-muted-foreground">Country and city of visitors — via GA4.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
