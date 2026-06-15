import React from 'react';

const CSS = `
.wd-textarea{width:100%;box-sizing:border-box;min-height:120px;padding:12px 14px;font-family:var(--font-sans);
  font-size:15px;line-height:1.5;color:var(--text-strong);background:var(--surface-card);
  border:1.5px solid var(--border);border-radius:var(--radius-sm);resize:vertical;
  transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out);}
.wd-textarea::placeholder{color:var(--text-subtle);}
.wd-textarea:hover{border-color:var(--border-strong);}
.wd-textarea:focus{outline:none;border-color:var(--gold-500);box-shadow:0 0 0 3px var(--focus-ring);}
.wd-ta__count{font-family:var(--font-mono);font-size:11px;color:var(--text-subtle);text-align:end;margin-top:6px;}
`;
let injected = false;
function ensure() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.setAttribute('data-wd', 'textarea');
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Textarea({ label, helpText, required = false, maxLength, value, className = '', id, ...rest }) {
  ensure();
  const fieldId = id || (label ? 'wd-ta-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  return (
    <div className={['wd-field', className].filter(Boolean).join(' ')} style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%' }}>
      {label && (
        <label className="wd-field__label" htmlFor={fieldId} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>
          {label}{required && <span style={{ color: 'var(--gold-600)', marginInlineStart: 3 }}>*</span>}
        </label>
      )}
      <textarea id={fieldId} className="wd-textarea" maxLength={maxLength} value={value} {...rest} />
      {(helpText || maxLength != null) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          {helpText && <span className="wd-field__help" style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--text-muted)' }}>{helpText}</span>}
          {maxLength != null && <span className="wd-ta__count">{(value ? String(value).length : 0)} / {maxLength}</span>}
        </div>
      )}
    </div>
  );
}
