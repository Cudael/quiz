'use server'

import { signOut } from '@/server/auth'

/** Invalidates the Auth.js session cookie and performs a fresh navigation home. */
export async function signOutAction() {
  await signOut({ redirectTo: '/' })
}
