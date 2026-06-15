import React from 'react';

const CSS = `
.wd-iconbtn{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;
  border:1.5px solid transparent;border-radius:var(--radius-sm);background:transparent;
  color:var(--text-body);transition:background var(--dur-fast) var(--ease-out),
  color var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out);}
.wd-iconbtn:hover{background:var(--slate-100);color:var(--text-strong);}
.wd-iconbtn:active{transform:translateY(1px);}
.wd-iconbtn:focus-visible{outline:none;box-shadow:0 0 0 3px var(--focus-ring);}
.wd-iconbtn[disabled]{opacity:.4;pointer-events:none;}
.wd-iconbtn--sm{width:36px;height:36px;}
.wd-iconbtn--md{width:44px;height:44px;}
.wd-iconbtn--lg{width:54px;height:54px;}
.wd-iconbtn--solid{background:var(--navy-900);color:#fff;}
.wd-iconbtn--solid:hover{background:var(--navy-800);color:#fff;}
.wd-iconbtn--outline{border-color:var(--border-strong);}
.wd-iconbtn--outline:hover{background:var(--navy-50);border-color:var(--navy-300);}
.wd-iconbtn--round{border-radius:var(--radius-full);}
.wd-iconbtn svg{width:1.25em;height:1.25em;}
.wd-iconbtn--sm svg{font-size:16px;}
.wd-iconbtn--md svg{font-size:19px;}
.wd-iconbtn--lg svg{font-size:22px;}
`;
let injected = false;
function ensure() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.setAttribute('data-wd', 'iconbtn');
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  round = false,
  label,
  className = '',
  children,
  ...rest
}) {
  ensure();
  const cls = [
    'wd-iconbtn',
    `wd-iconbtn--${variant}`,
    `wd-iconbtn--${size}`,
    round ? 'wd-iconbtn--round' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button className={cls} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}
