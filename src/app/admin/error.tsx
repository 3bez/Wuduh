'use client'

// Catches any error in the /admin segment (server render, streaming, or client
// hydration) and shows the real message instead of a blank page.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '60px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--danger-500)', marginBottom: 10 }}>Back office error</p>
        <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>The dashboard failed to render</h1>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'var(--font-mono), monospace', fontSize: 12.5, lineHeight: 1.6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, padding: 18, color: 'var(--text-secondary)' }}>
          {error?.message || 'Unknown error'}
          {error?.digest ? `\n\ndigest: ${error.digest}` : ''}
        </pre>
        <button
          onClick={reset}
          style={{ marginTop: 18, background: 'var(--text-primary)', color: 'var(--bg-page)', fontSize: 14, fontWeight: 500, borderRadius: 9, padding: '10px 20px', border: 'none', cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
