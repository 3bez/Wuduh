'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  studyId: string
  currentName: string | null
}

export default function RenameStudy({ studyId, currentName }: Props) {
  const [editing, setEditing]   = useState(false)
  const [value, setValue]       = useState(currentName ?? '')
  const [saving, setSaving]     = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)
  const router                  = useRouter()

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  async function save() {
    const trimmed = value.trim()
    if (!trimmed || trimmed === currentName) {
      setValue(currentName ?? '')
      setEditing(false)
      return
    }
    setSaving(true)
    const supabase = createClient()
    await supabase.from('studies').update({ startup_name: trimmed }).eq('id', studyId)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') { setValue(currentName ?? ''); setEditing(false) }
  }

  const displayName = currentName ?? 'Untitled study'

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={save}
          disabled={saving}
          maxLength={80}
          style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: 17, fontWeight: 500,
            color: 'var(--text-primary)',
            background: 'var(--bg-subtle)',
            border: '1.5px solid var(--gold-500)',
            borderRadius: 7,
            padding: '3px 8px',
            outline: 'none',
            width: '100%',
            letterSpacing: '-0.01em',
            boxShadow: '0 0 0 3px rgba(201,168,76,0.12)',
          }}
        />
        {saving && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold-500)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, animation: 'spin 0.8s linear infinite' }}>
            <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        )}
      </div>
    )
  }

  return (
    <div
      className="rename-trigger"
      style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, cursor: 'pointer' }}
      onClick={() => setEditing(true)}
      title="Click to rename"
    >
      <style>{`
        .rename-trigger .rename-pencil { opacity: 0; transition: opacity 140ms; }
        .rename-trigger:hover .rename-pencil { opacity: 1; }
        .rename-trigger:hover h3 { color: var(--gold-700) !important; }
      `}</style>
      <h3 style={{
        fontFamily: 'var(--font-display), serif', fontSize: 17, fontWeight: 500,
        color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.3,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        transition: 'color 140ms', margin: 0,
      }}>
        {displayName}
      </h3>
      <svg
        className="rename-pencil"
        width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" style={{ flexShrink: 0 }}
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </div>
  )
}
