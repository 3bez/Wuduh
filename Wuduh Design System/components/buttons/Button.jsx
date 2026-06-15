import React from 'react';

const CSS = `
.wd-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  font-family:var(--font-sans);font-weight:600;letter-spacing:-0.01em;cursor:pointer;
  border:1.5px solid transparent;border-radius:var(--radius-sm);white-space:nowrap;
  transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out);
  text-decoration:none;user-select:none;}
.wd-btn:focus-visible{outline:none;box-shadow:0 0 0 3px var(--focus-ring);}
.wd-btn:active{transform:translateY(1px);}
.wd-btn[disabled]{opacity:.45;pointer-events:none;}
.wd-btn--sm{height:36px;padding:0 14px;font-size:13px;}
.wd-btn--md{height:44px;padding:0 20px;font-size:15px;}
.wd-btn--lg{height:54px;padding:0 28px;font-size:16px;}
/* primary — navy, the default action */
.wd-btn--primary{background:var(--navy-900);color:#fff;}
.wd-btn--primary:hover{background:var(--navy-800);}
/* accent — gold, reserved for the single key moment */
.wd-btn--accent{background:var(--gold-500);color:var(--navy-900);}
.wd-btn--accent:hover{background:var(--gold-400);box-shadow:var(--shadow-gold);}
/* secondary — outlined */
.wd-btn--secondary{background:transparent;color:var(--navy-900);border-color:var(--border-strong);}
.wd-btn--secondary:hover{background:var(--navy-50);border-color:var(--navy-300);}
/* ghost — quiet */
.wd-btn--ghost{background:transparent;color:var(--text-body);}
.wd-btn--ghost:hover{background:var(--slate-100);color:var(--text-strong);}
/* danger */
.wd-btn--danger{background:var(--danger-500);color:#fff;}
.wd-btn--danger:hover{background:var(--danger-600);}
.wd-btn--block{display:flex;width:100%;}
.wd-btn svg{width:1.15em;height:1.15em;flex:none;}
`;
let injected = false;
function ensure() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.setAttribute('data-wd', 'button');
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  iconStart = null,
  iconEnd = null,
  as = 'button',
  className = '',
  children,
  ...rest
}) {
  ensure();
  const Tag = as;
  const cls = [
    'wd-btn',
    `wd-btn--${variant}`,
    `wd-btn--${size}`,
    block ? 'wd-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <Tag className={cls} {...rest}>
      {iconStart}
      {children != null && <span>{children}</span>}
      {iconEnd}
    </Tag>
  );
}
