'use client'

// UploadCard — file upload (logo or solution visuals).
// Uploads to Supabase Storage. Saves URL to answers table.

import { useState, useRef, useEffect } from 'react'
import type { CardConfig, Language } from '@/types/cards'
import { localise } from '@/lib/cards/loader'
import { createClient } from '@/lib/supabase/client'
import { useAutoSave } from '@/hooks/useAutoSave'
import { cn } from '@/lib/utils'

interface Props {
  card: CardConfig
  lang: Language
  studyId: string
  userId: string
  initialUrl?: string
  onComplete: (url: string) => void
  onSkip: () => void
}

export default function UploadCard({ card, lang, studyId, userId, initialUrl, onComplete, onSkip }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { save, saving } = useAutoSave(studyId)
  const content = localise(card, lang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const fileRef = useRef<HTMLInputElement>(null)
  const config = card.upload_config ?? { accept: 'image/*', max_mb: 5, preview: true }

  // On mount: sign the stored path for preview, or use direct URL for legacy answers
  useEffect(() => {
    if (!initialUrl) return
    // If it looks like a storage path (no protocol) sign it; otherwise use as-is
    if (!initialUrl.startsWith('http')) {
      const supabase = createClient()
      supabase.storage
        .from('wuduh-uploads')
        .createSignedUrl(initialUrl, 60 * 60 * 24 * 7)
        .then(({ data }) => { if (data?.signedUrl) setPreview(data.signedUrl) })
    } else {
      setPreview(initialUrl)
    }
  }, [initialUrl])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    if (file.size > config.max_mb * 1024 * 1024) {
      setUploadError(`File must be under ${config.max_mb}MB`)
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${userId}/${studyId}/${card.id}-${Date.now()}.${ext}`

      const { error: storageError } = await supabase.storage
        .from('wuduh-uploads')
        .upload(path, file, { upsert: true })

      if (storageError) throw new Error(storageError.message)

      // Private bucket — get a long-lived signed URL (7 days) for preview and storage.
      // The export route re-signs the URL server-side at export time.
      const { data: signed, error: signError } = await supabase.storage
        .from('wuduh-uploads')
        .createSignedUrl(path, 60 * 60 * 24 * 7) // 7 days

      if (signError || !signed?.signedUrl) throw new Error(signError?.message ?? 'Could not sign URL')

      const signedUrl = signed.signedUrl

      setPreview(signedUrl)
      await save({ card_id: card.id, answer: path, status: 'done' })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleComplete() {
    if (!preview) return
    onComplete(preview)
  }

  async function handleSkip() {
    await save({ card_id: card.id, answer: null, status: 'skipped' })
    onSkip()
  }

  return (
    <div className="flex flex-col gap-4" dir={dir}>
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className={cn(
          'w-full rounded-xl border-2 border-dashed border-slate-200',
          'hover:border-gold-400 hover:bg-gold-50/50',
          'transition-colors duration-200',
          'flex flex-col items-center justify-center',
          'min-h-[180px] py-8 px-6 gap-3',
          uploading && 'opacity-60 cursor-wait'
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="max-h-32 max-w-[200px] object-contain rounded"
          />
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 text-center">
              {uploading
                ? (lang === 'ar' ? 'جاري الرفع…' : 'Uploading…')
                : (lang === 'ar' ? 'انقر لاختيار ملف' : 'Click to choose a file')}
            </p>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? `PNG, JPG, SVG — حتى ${config.max_mb}MB`
                : `PNG, JPG, SVG — up to ${config.max_mb}MB`}
            </p>
          </>
        )}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept={config.accept}
        className="hidden"
        onChange={handleFile}
      />

      {preview && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-xs text-gold-600 hover:text-gold-700 transition-colors w-fit"
        >
          {lang === 'ar' ? 'تغيير الملف' : 'Change file'}
        </button>
      )}

      {uploadError && (
        <p className="text-sm text-danger-500">{uploadError}</p>
      )}

      {/* Actions */}
      <div className={cn('flex gap-3 mt-2', lang === 'ar' && 'flex-row-reverse')}>
        <button
          onClick={handleComplete}
          disabled={!preview || saving || uploading}
          className={cn('flex-1 btn-primary py-3 text-sm', (!preview || saving) && 'opacity-60')}
        >
          {lang === 'ar' ? 'تم ← التالي' : 'Done — next card'}
        </button>
        {!card.required && (
          <button onClick={handleSkip} disabled={saving || uploading} className="btn-ghost py-3 text-sm px-4">
            {lang === 'ar' ? 'تخطّ' : 'Skip for now'}
          </button>
        )}
      </div>
    </div>
  )
}
