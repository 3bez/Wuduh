import React from 'react';

const CSS = `
.wd-field{display:flex;flex-direction:column;gap:7px;font-family:var(--font-sans);width:100%;}
.wd-field__label{font-size:13px;font-weight:600;color:var(--text-strong);letter-spacing:-0.01em;}
.wd-field__label .req{color:var(--gold-600);margin-inline-start:3px;}
.wd-inputwrap{position:relative;display:flex;align-items:center;}
.wd-inputwrap svg{position:absolute;inset-inline-start:14px;width:18px;height:18px;color:var(--text-subtle);pointer-events:none;}
.wd-inputwrap.has-icon .wd-input{padding-inline-start:42px;}
.wd-input{width:100%;box-sizing:border-box;height:46px;padding:0 14px;font-family:inherit;
  font-size:15px;color:var(--text-strong);background:var(--surface-card);
  border:1.5px solid var(--border);border-radius:var(--radius-sm);
  transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out);}
.wd-input::placeholder{color:var(--text-subtle);}
.wd-input:hover{border-color:var(--border-strong);}
.wd-input:focus{outline:none;border-color:var(--gold-500);box-shadow:0 0 0 3px var(--focus-ring);}
.wd-input[disabled]{background:var(--slate-50);color:var(--text-muted);cursor:not-allowed;}
.wd-field--error .wd-input{border-color:var(--danger-500);}
.wd-field--error .wd-input:focus{box-shadow:0 0 0 3px var(--danger-100);}
.wd-field__help{font-size:12.5px;color:var(--text-muted);line-height:1.45;}
.wd-field--error .wd-field__help{color:var(--danger-600);}
`;
let injected = false;
function ensure() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.setAttribute('data-wd', 'input');
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Input({
  label,
  helpText,
  error,
  required = false,
  iconStart = null,
  id,
  className = '',
  ...rest
}) {
  ensure();
  const fieldId = id || (label ? 'wd-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const help = error || helpText;
  return (
    <div className={['wd-field', error ? 'wd-field--error' : '', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="wd-field__label" htmlFor={fieldId}>
          {label}{required && <span className="req">*</span>}
        </label>
      )}
      <div className={['wd-inputwrap', iconStart ? 'has-icon' : ''].filter(Boolean).join(' ')}>
        {iconStart}
        <input id={fieldId} className="wd-input" {...rest} />
      </div>
      {help && <span className="wd-field__help">{help}</span>}
    </div>
  );
}
