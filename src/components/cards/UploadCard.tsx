'use client'

import { useState, useRef, useEffect } from 'react'
import type { CardConfig, Language } from '@/types/cards'
import { localise } from '@/lib/cards/loader'
import { useAutoSave } from '@/hooks/useAutoSave'

interface Props {
  card: CardConfig; lang: Language; studyId: string; userId: string
  initialUrl?: string; onComplete: (url: string) => void; onSkip: () => void
}

export default function UploadCard({ card, lang, studyId, userId, initialUrl, onComplete, onSkip }: Props) {
  const [preview, setPreview]         = useState<string | null>(null)
  const [uploading, setUploading]     = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging]       = useState(false)
  const { save, saving }              = useAutoSave(studyId)
  const content                       = localise(card, lang)
  const dir                           = lang === 'ar' ? 'rtl' : 'ltr'
  const fileRef                       = useRef<HTMLInputElement>(null)
  const config                        = card.upload_config ?? { accept: 'image/*', max_mb: 5, preview: true }

  useEffect(() => {
    if (initialUrl) setPreview(initialUrl)
  }, [initialUrl])

  async function handleFile(file: File) {
    setUploadError(null)
    if (file.size > config.max_mb * 1024 * 1024) {
      setUploadError(lang === 'ar' ? `الحجم الأقصى ${config.max_mb} ميغابايت` : `File must be under ${config.max_mb} MB`)
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('studyId', studyId)
      formData.append('cardId', card.id)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Upload failed')

      setPreview(data.url)
      await save({ card_id: card.id, answer: data.url, status: 'done' })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  async function handleComplete() { if (!preview) return; onComplete(preview) }
  async function handleSkip() { await save({ card_id: card.id, answer: null, status: 'skipped' }); onSkip() }

  const busy = uploading || saving

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} dir={dir}>
      <style>{`
        .uc-zone { transition: border-color 200ms, background 200ms; }
        .uc-zone:hover:not(.busy) { border-color: var(--gold-500) !important; background: var(--gold-100) !important; }
        .uc-done:hover:not(:disabled) { opacity: 0.85; }
        .uc-done:disabled { opacity: 0.55; cursor: not-allowed; }
        .uc-skip:hover:not(:disabled) { color: var(--text-secondary) !important; background: var(--bg-subtle) !important; }
        .uc-change:hover { color: var(--gold-700) !important; }
      `}</style>

      <div
        className={`uc-zone${busy ? ' busy' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !busy && fileRef.current?.click()}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && !busy && fileRef.current?.click()}
        style={{
          border: `1.5px dashed ${dragging ? 'var(--gold-500)' : 'var(--border-strong)'}`,
          borderRadius: 12, background: dragging ? 'var(--gold-100)' : 'var(--bg-input)',
          cursor: busy ? 'not-allowed' : 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: preview ? 'auto' : 180, padding: preview ? 20 : '40px 20px', gap: 12,
          opacity: busy && !preview ? 0.7 : 1,
        }}
      >
        {uploading ? (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-500)" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }} aria-hidden="true">
              <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>{lang === 'ar' ? 'جاري الرفع…' : 'Uploading…'}</p>
          </>
        ) : preview ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 72, height: 72, borderRadius: 10, border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" style={{ width: 60, height: 60, objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>{lang === 'ar' ? 'تم رفع الصورة' : 'Image uploaded'}</p>
              <button className="uc-change" onClick={e => { e.stopPropagation(); fileRef.current?.click() }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--gold-500)', padding: 0, transition: 'color 140ms' }}>
                {lang === 'ar' ? 'تغيير الصورة' : 'Change image'}
              </button>
            </div>
            <button onClick={e => { e.stopPropagation(); setPreview(null) }} aria-label="Remove image" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-hint)', padding: 4, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        ) : (
          <>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>{lang === 'ar' ? 'اسحب الصورة هنا أو انقر للاختيار' : 'Drop image here or click to browse'}</p>
              <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>{lang === 'ar' ? `PNG · SVG · JPG — حتى ${config.max_mb} ميغابايت` : `PNG · SVG · JPG — up to ${config.max_mb} MB`}</p>
            </div>
          </>
        )}
      </div>

      <input ref={fileRef} type="file" accept={config.accept} style={{ display: 'none' }} onChange={onInputChange} />

      {uploadError && (
        <div style={{ background: 'var(--danger-100)', color: 'var(--danger-500)', fontSize: 13, borderRadius: 8, padding: '10px 14px' }}>
          {uploadError}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
        <button className="uc-done" onClick={handleComplete} disabled={!preview || busy} style={{ flex: 1, background: 'var(--text-primary)', color: 'var(--bg-page)', border: 'none', borderRadius: 9, padding: '13px 0', fontSize: 14, fontWeight: 500, cursor: !preview || busy ? 'not-allowed' : 'pointer', transition: 'opacity 140ms', fontFamily: 'var(--font-sans), sans-serif' }}>
          {lang === 'ar' ? 'تم — البطاقة التالية' : 'Done — next card'}
        </button>
        {!card.required && (
          <button className="uc-skip" onClick={handleSkip} disabled={busy} style={{ background: 'transparent', border: '1.5px solid var(--border-default)', borderRadius: 9, padding: '13px 16px', fontSize: 13, color: 'var(--text-faint)', cursor: busy ? 'not-allowed' : 'pointer', transition: 'color 140ms, background 140ms', fontFamily: 'var(--font-sans), sans-serif', whiteSpace: 'nowrap' }}>
            {lang === 'ar' ? 'تخطّ' : 'Skip for now'}
          </button>
        )}
      </div>
    </div>
  )
}
