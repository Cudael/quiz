import { PATCH as canonicalPatchProfile } from '@/app/api/profile/route'

// DEPRECATED: `/api/profile/profile` is a temporary compatibility alias.
// Remove this route after all callers migrate to `PATCH /api/profile`.
export async function PATCH(request: Request) {
  return canonicalPatchProfile(request)
}
