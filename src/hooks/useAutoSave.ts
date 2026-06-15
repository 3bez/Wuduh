'use client'

// Auto-save hook — saves a card answer on blur or explicit call.
// Debounced to avoid hammering the API on rapid keystrokes.
// Returns { save, saving, lastSaved }.

import { useCallback, useRef, useState } from 'react'

interface SavePayload {
  card_id: string
  answer: unknown
  status: 'done' | 'skipped'
}

export function useAutoSave(studyId: string) {
  const [saving, setSaving]       = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const debounceRef               = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    async (payload: SavePayload, debounceMs = 0) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)

      const doSave = async () => {
        setSaving(true)
        setError(null)
        try {
          const res = await fetch(`/api/studies/${studyId}/answers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            setError(data.error ?? 'Save failed')
          } else {
            setLastSaved(new Date())
          }
        } catch {
          setError('Network error — save failed')
        } finally {
          setSaving(false)
        }
      }

      if (debounceMs > 0) {
        debounceRef.current = setTimeout(doSave, debounceMs)
      } else {
        await doSave()
      }
    },
    [studyId]
  )

  return { save, saving, lastSaved, error }
}
