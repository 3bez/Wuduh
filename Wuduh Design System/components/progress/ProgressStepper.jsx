import React from 'react';

const CSS = `
.wd-stepper{display:flex;align-items:flex-start;gap:0;font-family:var(--font-sans);width:100%;}
.wd-step{display:flex;flex-direction:column;align-items:center;flex:1;position:relative;text-align:center;}
.wd-step__line{position:absolute;top:13px;height:2px;background:var(--slate-200);z-index:0;}
.wd-step__line--done{background:var(--teal-500);}
.wd-step__dot{position:relative;z-index:1;width:28px;height:28px;border-radius:var(--radius-full);
  display:flex;align-items:center;justify-content:center;background:var(--surface-card);
  border:2px solid var(--slate-300);color:var(--text-muted);font-family:var(--font-mono);font-size:12px;font-weight:600;
  transition:all var(--dur-base) var(--ease-out);}
.wd-step__dot svg{width:14px;height:14px;}
.wd-step--done .wd-step__dot{background:var(--teal-500);border-color:var(--teal-500);color:#fff;}
.wd-step--current .wd-step__dot{background:var(--navy-900);border-color:var(--navy-900);color:#fff;
  box-shadow:0 0 0 4px var(--navy-50);}
.wd-step__label{margin-top:8px;font-size:11.5px;font-weight:600;color:var(--text-muted);line-height:1.3;
  max-width:84px;letter-spacing:-0.005em;}
.wd-step--current .wd-step__label,.wd-step--done .wd-step__label{color:var(--text-strong);}
`;
let injected = false;
function ensure() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.setAttribute('data-wd', 'stepper');
  s.textContent = CSS;
  document.head.appendChild(s);
}

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export function ProgressStepper({ steps = [], current = 0, className = '', ...rest }) {
  ensure();
  return (
    <div className={['wd-stepper', className].filter(Boolean).join(' ')} {...rest}>
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className={`wd-step wd-step--${state}`}>
            {!isLast && (
              <span className={['wd-step__line', i < current ? 'wd-step__line--done' : ''].filter(Boolean).join(' ')}
                    style={{ left: '50%', right: '-50%' }} />
            )}
            <span className="wd-step__dot">{state === 'done' ? <Check /> : i + 1}</span>
            <span className="wd-step__label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
