import React from 'react';

const CSS = `
.wd-progress{font-family:var(--font-sans);width:100%;}
.wd-progress__head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}
.wd-progress__label{font-size:13px;font-weight:600;color:var(--text-strong);}
.wd-progress__count{font-family:var(--font-mono);font-size:12px;color:var(--text-muted);letter-spacing:.04em;}
.wd-progress__track{height:6px;background:var(--slate-200);border-radius:var(--radius-full);overflow:hidden;}
.wd-progress__track--lg{height:8px;}
.wd-progress__fill{height:100%;border-radius:var(--radius-full);background:var(--gold-500);
  transition:width var(--dur-slow) var(--ease-out);}
.wd-progress__fill--teal{background:var(--teal-500);}
.wd-progress__fill--navy{background:var(--navy-700);}
`;
let injected = false;
function ensure() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.setAttribute('data-wd', 'progress');
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showCount = false,
  tone = 'gold',
  size = 'md',
  className = '',
  ...rest
}) {
  ensure();
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fillTone = tone === 'gold' ? '' : `wd-progress__fill--${tone}`;
  return (
    <div className={['wd-progress', className].filter(Boolean).join(' ')} {...rest}>
      {(label || showCount) && (
        <div className="wd-progress__head">
          {label && <span className="wd-progress__label">{label}</span>}
          {showCount && <span className="wd-progress__count">{value} / {max}</span>}
        </div>
      )}
      <div className={['wd-progress__track', size === 'lg' ? 'wd-progress__track--lg' : ''].filter(Boolean).join(' ')}
           role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className={['wd-progress__fill', fillTone].filter(Boolean).join(' ')} style={{ width: pct + '%' }} />
      </div>
    </div>
  );
}
