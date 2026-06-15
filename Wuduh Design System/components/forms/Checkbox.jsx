import React from 'react';

const CSS = `
.wd-check{display:inline-flex;align-items:flex-start;gap:11px;font-family:var(--font-sans);cursor:pointer;
  font-size:15px;color:var(--text-body);line-height:1.4;}
.wd-check input{position:absolute;opacity:0;width:0;height:0;}
.wd-check__box{flex:none;width:22px;height:22px;border:1.5px solid var(--border-strong);
  border-radius:var(--radius-xs);background:var(--surface-card);display:flex;align-items:center;justify-content:center;
  transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out);margin-top:1px;}
.wd-check__box svg{width:14px;height:14px;color:#fff;opacity:0;transform:scale(.6);transition:opacity var(--dur-fast),transform var(--dur-fast) var(--ease-out);}
.wd-check:hover .wd-check__box{border-color:var(--navy-400);}
.wd-check input:focus-visible + .wd-check__box{box-shadow:0 0 0 3px var(--focus-ring);}
.wd-check input:checked + .wd-check__box{background:var(--navy-900);border-color:var(--navy-900);}
.wd-check input:checked + .wd-check__box svg{opacity:1;transform:scale(1);}
.wd-check--round .wd-check__box{border-radius:var(--radius-full);}
.wd-check input:disabled ~ *{opacity:.5;}
`;
let injected = false;
function ensure() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.setAttribute('data-wd', 'check');
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Checkbox({ label, round = false, className = '', children, ...rest }) {
  ensure();
  return (
    <label className={['wd-check', round ? 'wd-check--round' : '', className].filter(Boolean).join(' ')}>
      <input type="checkbox" {...rest} />
      <span className="wd-check__box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
      {(label || children) && <span>{label || children}</span>}
    </label>
  );
}
