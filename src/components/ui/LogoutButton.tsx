'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth/client'

export default function LogoutButton({ label = 'Sign out' }: { label?: string }) {
  const router = useRouter()

  async function handleLogout() {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'none', border: 'none', fontSize: 13,
        color: 'var(--text-faint)', cursor: 'pointer', padding: 0,
        transition: 'color 140ms', fontFamily: 'var(--font-sans), sans-serif',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
    >
      {label}
    </button>
  )
}
