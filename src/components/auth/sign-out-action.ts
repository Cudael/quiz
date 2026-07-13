'use server'

import { signOut } from '@/server/auth'

/** Invalidates the Auth.js session cookie without relying on an RSC redirect. */
export async function signOutAction() {
  await signOut({ redirect: false })
}
