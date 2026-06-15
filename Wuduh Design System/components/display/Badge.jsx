import React from 'react';

const CSS = `
.wd-badge{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-sans);font-weight:600;
  font-size:12px;line-height:1;letter-spacing:0;padding:5px 9px;border-radius:var(--radius-full);
  border:1px solid transparent;white-space:nowrap;}
.wd-badge svg{width:13px;height:13px;}
.wd-badge--neutral{background:var(--slate-100);color:var(--slate-700);}
.wd-badge--navy{background:var(--navy-50);color:var(--navy-700);}
.wd-badge--gold{background:var(--gold-100);color:var(--gold-700);}
.wd-badge--teal{background:var(--teal-100);color:var(--teal-700);}
.wd-badge--success{background:var(--success-100);color:var(--success-600);}
.wd-badge--warning{background:var(--warning-100);color:var(--warning-600);}
.wd-badge--danger{background:var(--danger-100);color:var(--danger-600);}
.wd-badge--solid{background:var(--navy-900);color:#fff;}
.wd-badge--dot::before{content:"";width:6px;height:6px;border-radius:999px;background:currentColor;}
`;
let injected = false;
function ensure() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.setAttribute('data-wd', 'badge');
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Badge({ tone = 'neutral', dot = false, className = '', children, ...rest }) {
  ensure();
  const cls = ['wd-badge', `wd-badge--${tone}`, dot ? 'wd-badge--dot' : '', className].filter(Boolean).join(' ');
  return <span className={cls} {...rest}>{children}</span>;
}
