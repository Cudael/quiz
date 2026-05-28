export const guestOnlyAuthRoutes = ['/sign-in', '/sign-up'] as const

export const middlewareMatcher = ['/studio/:path*', '/admin/:path*', ...guestOnlyAuthRoutes]

export function isGuestOnlyAuthRoute(pathname: string) {
  return guestOnlyAuthRoutes.includes(pathname as (typeof guestOnlyAuthRoutes)[number])
}
