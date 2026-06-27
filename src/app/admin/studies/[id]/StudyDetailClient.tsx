'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shell, useJson, act, n, btnGhost, btnDanger, Loading, ErrorCard } from '../../_shared'

type Item = {
  cardId: string; section: string; order: number; type: string; required: boolean
  category: string; prompt: string; answer: unknown; status: string | null
}
type Study = { id: string; startupName: string | null; language: string; status: string; completionPercentage: number; userId: string }
interface Resp { study: Study; items: Item[] }

const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6, display: 'block' }
const btnPrimary: React.CSSProperties = { background: 'var(--gold-500)', border: '1px solid var(--gold-500)', color: '#1a1206', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }

export default function StudyDetailClient({ id }: { id: string }) {
  const { data, error, loading, reload } = useJson<Resp>(`/api/admin/studies/${id}/answers`)
  if (error) return <Shell active="studies" title="Study"><ErrorCard error={error} /></Shell>
  if (loading && !data) return <Shell active="studies" title="Study"><Loading /></Shell>
  if (!data) return <Shell active="studies" title="Study"><ErrorCard error="Not found" /></Shell>
  return <Inner key={data.study.id} data={data} reload={reload} />
}

function Inner({ data, reload }: { data: Resp; reload: () => void }) {
  const router = useRouter()
  const { study, items } = data
  const [name, setName] = useState(study.startupName ?? '')
  const [language, setLanguage] = useState(study.language)
  const [status, setStatus] = useState(study.status)
  const [completion, setCompletion] = useState(String(study.completionPercentage))
  const [savingMeta, setSavingMeta] = useState(false)
  const [metaMsg, setMetaMsg] = useState('')

  async function saveMeta() {
    setSavingMeta(true); setMetaMsg('')
    const ok = await act(`/api/admin/studies/${study.id}`, 'PATCH', {
      startupName: name, language, status, completionPercentage: parseInt(completion, 10) || 0,
    })
    setSavingMeta(false)
    setMetaMsg(ok ? 'Saved' : 'Save failed')
    if (ok) setTimeout(() => setMetaMsg(''), 1500)
  }
  async function deleteStudy() {
    if (!window.confirm('Delete this study and all its answers and exports? This cannot be undone.')) return
    const ok = await act(`/api/admin/studies/${study.id}`, 'DELETE')
    if (ok) router.push('/admin/studies'); else alert('Delete failed.')
  }

  const groups: { section: string; items: Item[] }[] = []
  for (const it of items) {
    let g = groups[groups.length - 1]
    if (!g || g.section !== it.section) { g = { section: it.section, items: [] }; groups.push(g) }
    g.items.push(it)
  }
  const answeredCount = items.filter(i => i.status === 'done').length

  return (
    <Shell active="studies" eyebrow="Back office · study" title={study.startupName || 'Untitled study'}
      subtitle={<Link href="/admin/studies" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← All studies</Link>}>

      <div className="wb-card" style={{ padding: 22, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Study details</h2>
          <Link href={`/admin/users/${study.userId}`} style={{ ...btnGhost, textDecoration: 'none' }}>Owner →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div>
            <label style={labelStyle}>Startup name</label>
            <input className="wb-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Language</label>
            <select className="wb-input" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select className="wb-input" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="complete">Complete</option>
              <option value="exported">Exported</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Completion %</label>
            <input className="wb-input" type="number" min={0} max={100} value={completion} onChange={e => setCompletion(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
          <button style={btnPrimary} disabled={savingMeta} onClick={saveMeta}>{savingMeta ? 'Saving…' : 'Save details'}</button>
          {metaMsg && <span style={{ fontSize: 12, color: metaMsg === 'Saved' ? 'var(--success-500)' : 'var(--danger-500)' }}>{metaMsg}</span>}
          <div style={{ flex: 1 }} />
          <button style={btnDanger} onClick={deleteStudy}>Delete study</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Answers</h2>
        <span style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'var(--font-mono), monospace' }}>{answeredCount} / {items.length} cards answered</span>
      </div>

      {groups.map(g => (
        <div key={g.section} style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-500)', margin: '6px 0 10px' }}>{g.section}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {g.items.map(it => <AnswerEditor key={it.cardId} studyId={study.id} item={it} onSaved={reload} />)}
          </div>
        </div>
      ))}
    </Shell>
  )
}

function AnswerEditor({ studyId, item, onSaved }: { studyId: string; item: Item; onSaved: () => void }) {
  const isJson = item.type === 'table' || (item.answer !== null && typeof item.answer === 'object')
  const initial = item.answer == null
    ? (isJson ? (item.type === 'table' ? '[]' : 'null') : '')
    : (isJson ? JSON.stringify(item.answer, null, 2) : String(item.answer))
  const [text, setText] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const dirty = text !== initial

  async function save() {
    let value: unknown = text
    if (isJson) {
      try { value = JSON.parse(text) } catch { setMsg('Invalid JSON'); return }
    }
    setSaving(true); setMsg('')
    const ok = await act(`/api/admin/studies/${studyId}/answers`, 'PATCH', { cardId: item.cardId, value, status: 'done' })
    setSaving(false)
    if (ok) { setMsg('Saved'); setTimeout(() => setMsg(''), 1400); onSaved() }
    else setMsg('Save failed')
  }

  return (
    <div className="wb-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--text-faint)' }}>{item.cardId}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.category || item.cardId}</span>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, color: 'var(--text-hint)', textTransform: 'uppercase' }}>{item.type}</span>
        {item.required && <span style={{ fontSize: 9, color: 'var(--gold-700)' }}>required</span>}
        {item.status === 'skipped' && <span style={{ fontSize: 9, color: 'var(--warning-500)' }}>skipped</span>}
        {item.status == null && <span style={{ fontSize: 9, color: 'var(--text-hint)' }}>unanswered</span>}
      </div>
      {item.prompt && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{item.prompt}</p>}
      <textarea value={text} onChange={e => setText(e.target.value)} rows={isJson ? 6 : 3}
        className="wb-input" style={{ fontFamily: isJson ? 'var(--font-mono), monospace' : 'inherit', fontSize: 12.5, resize: 'vertical', lineHeight: 1.5 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button style={{ ...btnGhost, opacity: dirty ? 1 : 0.5 }} disabled={saving || !dirty} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
        {msg && <span style={{ fontSize: 11, color: msg === 'Saved' ? 'var(--success-500)' : 'var(--danger-500)' }}>{msg}</span>}
        {isJson && <span style={{ fontSize: 10, color: 'var(--text-hint)' }}>JSON</span>}
      </div>
    </div>
  )
}
