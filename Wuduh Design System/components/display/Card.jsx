import React from 'react';

const CSS = `
.wd-card{background:var(--surface-card);border:1px solid var(--border);border-radius:var(--radius-lg);
  box-shadow:var(--shadow-sm);overflow:hidden;font-family:var(--font-sans);
  transition:box-shadow var(--dur-base) var(--ease-out),transform var(--dur-base) var(--ease-out),border-color var(--dur-base) var(--ease-out);}
.wd-card--md{padding:24px;}
.wd-card--lg{padding:32px;}
.wd-card--flush{padding:0;}
.wd-card--raised{box-shadow:var(--shadow-md);border-color:transparent;}
.wd-card--swipe{border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);border-color:transparent;}
.wd-card--interactive{cursor:pointer;}
.wd-card--interactive:hover{box-shadow:var(--shadow-lg);transform:translateY(-2px);border-color:transparent;}
.wd-card--accent{border-top:3px solid var(--gold-500);}
.wd-card__eyebrow{font-family:var(--font-mono);font-size:11px;letter-spacing:var(--tracking-caps);
  text-transform:uppercase;color:var(--text-accent);margin:0 0 10px;}
.wd-card__title{font-family:var(--font-display);font-size:21px;font-weight:500;letter-spacing:-0.01em;
  color:var(--text-strong);margin:0;line-height:1.25;}
.wd-card__body{margin-top:10px;color:var(--text-body);font-size:15px;line-height:1.55;}
`;
let injected = false;
function ensure() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.setAttribute('data-wd', 'card');
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Card({
  variant = 'default',
  padding = 'md',
  eyebrow,
  title,
  accentTop = false,
  interactive = false,
  className = '',
  children,
  ...rest
}) {
  ensure();
  const variantCls = variant === 'default' ? '' : `wd-card--${variant}`;
  const cls = [
    'wd-card',
    `wd-card--${padding}`,
    variantCls,
    accentTop ? 'wd-card--accent' : '',
    interactive ? 'wd-card--interactive' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {eyebrow && <p className="wd-card__eyebrow">{eyebrow}</p>}
      {title && <h3 className="wd-card__title">{title}</h3>}
      {children && <div className={title || eyebrow ? 'wd-card__body' : ''}>{children}</div>}
    </div>
  );
}
