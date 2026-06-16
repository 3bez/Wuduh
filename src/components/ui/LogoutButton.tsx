'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'none',
        border: 'none',
        fontSize: 13,
        color: 'var(--text-faint)',
        cursor: 'pointer',
        padding: 0,
        transition: 'color 140ms',
        fontFamily: 'var(--font-sans), sans-serif',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
    >
      Sign out
    </button>
  )
}
