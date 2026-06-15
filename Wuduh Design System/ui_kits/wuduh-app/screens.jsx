/* Wuduh app — UI kit screens.
   Composes the design-system primitives from window.WuduhDesignSystem_971755.
   Exports screen components to window for index.html to assemble. */

const DS = window.WuduhDesignSystem_971755;
const { Button, IconButton, Card, Badge, Avatar, Textarea, ProgressBar, ProgressStepper } = DS;

/* ── inline icons (Lucide-style, 2px stroke) ─────────────── */
const Ico = (p) => <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p} />;
const ArrowRight = () => <Ico><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Ico>;
const ArrowLeft = () => <Ico><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Ico>;
const Check = () => <Ico strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></Ico>;
const Download = () => <Ico><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Ico>;
const FileText = () => <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Ico>;

/* Brand mark */
const Mark = ({ size = 30, onDark = false }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
    <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C"/>
    <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81" stroke={onDark ? '#AEC6D9' : '#0D1B2A'} strokeWidth="7.8" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);

/* Geometric net background */
const Net = ({ stroke = '#C9A84C', opacity = 0.4 }) => (
  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    <defs>
      <pattern id="kitnet" width="64" height="64" patternUnits="userSpaceOnUse">
        <g fill="none" stroke={stroke} strokeWidth="1" strokeOpacity={opacity}>
          <rect x="16" y="16" width="32" height="32"/>
          <rect x="22.6" y="22.6" width="32" height="32" transform="rotate(45 32 32)" strokeOpacity={opacity * 0.6}/>
          <path d="M32 0 L32 16 M32 48 L32 64 M0 32 L16 32 M48 32 L64 32" strokeOpacity={opacity * 0.65}/>
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#kitnet)"/>
  </svg>
);

const SECTIONS = ["Idea", "Market", "Team", "Finance", "Risk"];
const QUESTIONS = [
  { section: 1, n: 4, total: 12, cat: "Market", q: "Who is your first customer, and where do they already look for a solution?", help: "Be specific. One clear segment beats three vague ones — we'll size it next.", ph: "Independent café owners in Riyadh who track inventory on paper…" },
  { section: 1, n: 5, total: 12, cat: "Market", q: "How big is that market, and how fast is it growing?", help: "A rough, defensible number beats a precise guess. We'll help you show your working.", ph: "~3,400 independent cafés in the Kingdom, growing ~9% a year…" },
  { section: 2, n: 6, total: 12, cat: "Team", q: "Why is your team the right one to build this?", help: "Investors back people first. Name the unfair advantage you already have.", ph: "I ran operations for a 9-branch café chain for four years…" },
];

/* ── App header / shell ──────────────────────────────────── */
function AppHeader({ value, max }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 22px',
      background: 'var(--surface-card)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <Mark size={26} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--text-strong)' }}>Wuduh</span>
      </div>
      <div style={{ flex: 1, maxWidth: 320 }}>
        <ProgressBar value={value} max={max} showCount label="Your study" />
      </div>
      <div style={{ marginInlineStart: 'auto' }}><Avatar name="Layla Al-Saud" size="sm" /></div>
    </header>
  );
}

/* ── 1. Start screen ─────────────────────────────────────── */
function StartScreen({ onStart }) {
  return (
    <div style={{ position: 'relative', height: '100%', background: 'var(--surface-inverse)', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Net opacity={0.34} />
      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 560, padding: '0 28px' }}>
        <div style={{ display: 'inline-flex', marginBottom: 26 }}><Mark size={56} onDark /></div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--gold-400)', margin: 0 }}>Feasibility study · 12 cards</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 46, lineHeight: 1.08,
          letterSpacing: '-0.02em', color: 'var(--text-on-dark)', margin: '14px 0 0' }}>
          Let's figure this out, together.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--navy-200)', margin: '16px auto 0', maxWidth: 460 }}>
          Answer one question at a time. When you're done, Wuduh assembles your answers into a feasibility study you'll be proud to send.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 30 }}>
          <Button variant="accent" size="lg" iconEnd={<ArrowRight />} onClick={onStart}>Start your study</Button>
          <Button variant="ghost" size="lg" onClick={onStart}
            style={{ color: 'var(--navy-100)' }}>I have a draft</Button>
        </div>
        <div style={{ marginTop: 40, display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
          {SECTIONS.map((s, i) => (
            <span key={s} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--navy-300)' }}>
              {String(i + 1).padStart(2, '0')} {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 2. Card flow ────────────────────────────────────────── */
function CardFlow({ onExport }) {
  const [i, setI] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const item = QUESTIONS[i];
  const done = i;
  const setAnswer = (v) => setAnswers(a => ({ ...a, [i]: v }));
  const next = () => { if (i < QUESTIONS.length - 1) setI(i + 1); else onExport(); };
  const prev = () => setI(Math.max(0, i - 1));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-canvas)' }}>
      <AppHeader value={item.n} max={item.total} />
      <div style={{ padding: '20px 22px 0' }}>
        <ProgressStepper steps={SECTIONS} current={item.section} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 22px 28px' }}>
        <Card variant="swipe" padding="lg" style={{ width: 560, maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Badge tone="gold">{item.cat}</Badge>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '.04em' }}>
              {String(item.n).padStart(2, '0')} / {item.total}
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, lineHeight: 1.22,
            letterSpacing: '-0.015em', color: 'var(--text-strong)', margin: 0 }}>{item.q}</h2>
          <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.55, margin: '12px 0 20px' }}>{item.help}</p>
          <Textarea value={answers[i] || ''} onChange={e => setAnswer(e.target.value)} placeholder={item.ph} maxLength={400} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22 }}>
            <IconButton label="Previous card" variant="outline" round onClick={prev} disabled={i === 0}><ArrowLeft /></IconButton>
            <Button variant="ghost" onClick={next}>Skip for now</Button>
            <div style={{ marginInlineStart: 'auto' }}>
              <Button variant="primary" iconEnd={<ArrowRight />} onClick={next}>
                {i < QUESTIONS.length - 1 ? 'Done — next card' : 'Finish & assemble'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── 3. Export screen ────────────────────────────────────── */
function ExportScreen({ onRestart }) {
  const checklist = ["Executive summary", "Market & customer", "Team & advantage", "Financial model", "Risk & mitigation"];
  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '0.9fr 1.1fr' }}>
      {/* left — navy panel */}
      <div style={{ position: 'relative', background: 'var(--surface-inverse)', overflow: 'hidden',
        padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Net opacity={0.3} />
        <div style={{ position: 'relative' }}>
          <Badge tone="teal" dot>Complete</Badge>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 40, lineHeight: 1.1,
            letterSpacing: '-0.02em', color: 'var(--text-on-dark)', margin: '16px 0 0' }}>
            Your study is ready.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--navy-200)', margin: '14px 0 26px', maxWidth: 360 }}>
            12 cards, assembled into a structured feasibility study. Export it, or keep refining.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {checklist.map(c => (
              <li key={c} style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'var(--navy-100)', fontSize: 15 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22,
                  borderRadius: 999, background: 'var(--teal-500)', color: '#fff', fontSize: 13 }}><Check /></span>
                {c}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="accent" size="lg" iconStart={<Download />}>Export PDF</Button>
            <Button variant="ghost" size="lg" style={{ color: 'var(--navy-100)' }} onClick={onRestart}>Start over</Button>
          </div>
        </div>
      </div>
      {/* right — paper document preview */}
      <div style={{ background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 36 }}>
        <div style={{ position: 'relative', width: 420, maxWidth: '100%', background: 'var(--surface-paper)',
          borderRadius: 6, boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}><Net stroke="#0D1B2A" opacity={0.12} /></div>
          <div style={{ position: 'relative', padding: '40px 44px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 30 }}>
              <Mark size={22} /><span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)' }}>Wuduh</span>
              <span style={{ marginInlineStart: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Feasibility Study</span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase',
              color: 'var(--text-accent)', margin: 0 }}>Saffa · Prepared June 2026</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, lineHeight: 1.15,
              letterSpacing: '-0.015em', color: 'var(--text-strong)', margin: '8px 0 4px' }}>Inventory clarity for independent cafés</h2>
            <div style={{ height: 3, width: 48, background: 'var(--gold-500)', borderRadius: 99, margin: '14px 0 18px' }} />
            {[
              { h: '01  Executive summary', lines: 3 },
              { h: '02  Market & customer', lines: 4 },
              { h: '03  Team & advantage', lines: 2 },
            ].map(s => (
              <div key={s.h} style={{ marginBottom: 18 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5, color: 'var(--text-strong)', margin: '0 0 8px' }}>{s.h}</p>
                {Array.from({ length: s.lines }).map((_, k) => (
                  <div key={k} style={{ height: 6, borderRadius: 99, background: 'var(--paper-line)',
                    width: k === s.lines - 1 ? '62%' : '100%', marginBottom: 7 }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StartScreen, CardFlow, ExportScreen, Mark });
