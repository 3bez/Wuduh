import React from 'react';

const CSS = `
.wd-avatar{display:inline-flex;align-items:center;justify-content:center;flex:none;overflow:hidden;
  font-family:var(--font-sans);font-weight:600;color:#fff;background:var(--navy-700);
  border-radius:var(--radius-full);}
.wd-avatar img{width:100%;height:100%;object-fit:cover;}
.wd-avatar--square{border-radius:var(--radius-md);}
.wd-avatar--gold{background:var(--gold-500);color:var(--navy-900);}
.wd-avatar--teal{background:var(--teal-600);}
.wd-avatar--xs{width:28px;height:28px;font-size:11px;}
.wd-avatar--sm{width:36px;height:36px;font-size:13px;}
.wd-avatar--md{width:44px;height:44px;font-size:16px;}
.wd-avatar--lg{width:56px;height:56px;font-size:20px;}
`;
let injected = false;
function ensure() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.setAttribute('data-wd', 'avatar');
  s.textContent = CSS;
  document.head.appendChild(s);
}

function initials(name) {
  if (!name) return '';
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function Avatar({ name, src, size = 'md', tone = 'navy', square = false, className = '', ...rest }) {
  ensure();
  const toneCls = tone === 'navy' ? '' : `wd-avatar--${tone}`;
  const cls = ['wd-avatar', `wd-avatar--${size}`, toneCls, square ? 'wd-avatar--square' : '', className].filter(Boolean).join(' ');
  return (
    <span className={cls} title={name} {...rest}>
      {src ? <img src={src} alt={name || ''} /> : initials(name)}
    </span>
  );
}
