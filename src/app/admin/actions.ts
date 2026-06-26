'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  checkAdminPassword,
  createAdminToken,
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
} from '@/lib/auth/admin'

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  if (!checkAdminPassword(password)) {
    redirect('/admin/login?error=1')
  }
  const c = await cookies()
  c.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  })
  redirect('/admin')
}

export async function logoutAdmin() {
  const c = await cookies()
  c.delete(ADMIN_COOKIE)
  redirect('/admin/login')
}
