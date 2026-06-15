/* @ds-bundle: {"format":3,"namespace":"WuduhDesignSystem_971755","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Avatar","sourcePath":"components/display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"ProgressBar","sourcePath":"components/progress/ProgressBar.jsx"},{"name":"ProgressStepper","sourcePath":"components/progress/ProgressStepper.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"8b67241f689b","components/buttons/IconButton.jsx":"3de2e3f6b9ed","components/display/Avatar.jsx":"a67955219b30","components/display/Badge.jsx":"0cd16f69612f","components/display/Card.jsx":"116fd38b0fd7","components/forms/Checkbox.jsx":"8a8e3d8cbd24","components/forms/Input.jsx":"53ecf4e828e4","components/forms/Textarea.jsx":"d5508df211d3","components/progress/ProgressBar.jsx":"f630b473d1e2","components/progress/ProgressStepper.jsx":"0c23ea908b9e","ui_kits/wuduh-app/screens.jsx":"33f5d7e2ef3f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.WuduhDesignSystem_971755 = window.WuduhDesignSystem_971755 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Button({
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
  const cls = ['wd-btn', `wd-btn--${variant}`, `wd-btn--${size}`, block ? 'wd-btn--block' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, rest), iconStart, children != null && /*#__PURE__*/React.createElement("span", null, children), iconEnd);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function IconButton({
  variant = 'ghost',
  size = 'md',
  round = false,
  label,
  className = '',
  children,
  ...rest
}) {
  ensure();
  const cls = ['wd-iconbtn', `wd-iconbtn--${variant}`, `wd-iconbtn--${size}`, round ? 'wd-iconbtn--round' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    "aria-label": label,
    title: label
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Avatar({
  name,
  src,
  size = 'md',
  tone = 'navy',
  square = false,
  className = '',
  ...rest
}) {
  ensure();
  const toneCls = tone === 'navy' ? '' : `wd-avatar--${tone}`;
  const cls = ['wd-avatar', `wd-avatar--${size}`, toneCls, square ? 'wd-avatar--square' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    title: name
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name || ''
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Badge({
  tone = 'neutral',
  dot = false,
  className = '',
  children,
  ...rest
}) {
  ensure();
  const cls = ['wd-badge', `wd-badge--${tone}`, dot ? 'wd-badge--dot' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Card({
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
  const cls = ['wd-card', `wd-card--${padding}`, variantCls, accentTop ? 'wd-card--accent' : '', interactive ? 'wd-card--interactive' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), eyebrow && /*#__PURE__*/React.createElement("p", {
    className: "wd-card__eyebrow"
  }, eyebrow), title && /*#__PURE__*/React.createElement("h3", {
    className: "wd-card__title"
  }, title), children && /*#__PURE__*/React.createElement("div", {
    className: title || eyebrow ? 'wd-card__body' : ''
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Checkbox({
  label,
  round = false,
  className = '',
  children,
  ...rest
}) {
  ensure();
  return /*#__PURE__*/React.createElement("label", {
    className: ['wd-check', round ? 'wd-check--round' : '', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "wd-check__box"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), (label || children) && /*#__PURE__*/React.createElement("span", null, label || children));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Input({
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
  return /*#__PURE__*/React.createElement("div", {
    className: ['wd-field', error ? 'wd-field--error' : '', className].filter(Boolean).join(' ')
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "wd-field__label",
    htmlFor: fieldId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: ['wd-inputwrap', iconStart ? 'has-icon' : ''].filter(Boolean).join(' ')
  }, iconStart, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    className: "wd-input"
  }, rest))), help && /*#__PURE__*/React.createElement("span", {
    className: "wd-field__help"
  }, help));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Textarea({
  label,
  helpText,
  required = false,
  maxLength,
  value,
  className = '',
  id,
  ...rest
}) {
  ensure();
  const fieldId = id || (label ? 'wd-ta-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  return /*#__PURE__*/React.createElement("div", {
    className: ['wd-field', className].filter(Boolean).join(' '),
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "wd-field__label",
    htmlFor: fieldId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--gold-600)',
      marginInlineStart: 3
    }
  }, "*")), /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    className: "wd-textarea",
    maxLength: maxLength,
    value: value
  }, rest)), (helpText || maxLength != null) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12
    }
  }, helpText && /*#__PURE__*/React.createElement("span", {
    className: "wd-field__help",
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, helpText), maxLength != null && /*#__PURE__*/React.createElement("span", {
    className: "wd-ta__count"
  }, value ? String(value).length : 0, " / ", maxLength)));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/progress/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function ProgressBar({
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
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const fillTone = tone === 'gold' ? '' : `wd-progress__fill--${tone}`;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['wd-progress', className].filter(Boolean).join(' ')
  }, rest), (label || showCount) && /*#__PURE__*/React.createElement("div", {
    className: "wd-progress__head"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "wd-progress__label"
  }, label), showCount && /*#__PURE__*/React.createElement("span", {
    className: "wd-progress__count"
  }, value, " / ", max)), /*#__PURE__*/React.createElement("div", {
    className: ['wd-progress__track', size === 'lg' ? 'wd-progress__track--lg' : ''].filter(Boolean).join(' '),
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemin": 0,
    "aria-valuemax": max
  }, /*#__PURE__*/React.createElement("div", {
    className: ['wd-progress__fill', fillTone].filter(Boolean).join(' '),
    style: {
      width: pct + '%'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/progress/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/progress/ProgressStepper.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
const Check = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "3",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("polyline", {
  points: "20 6 9 17 4 12"
}));
function ProgressStepper({
  steps = [],
  current = 0,
  className = '',
  ...rest
}) {
  ensure();
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['wd-stepper', className].filter(Boolean).join(' ')
  }, rest), steps.map((label, i) => {
    const state = i < current ? 'done' : i === current ? 'current' : 'todo';
    const isLast = i === steps.length - 1;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: `wd-step wd-step--${state}`
    }, !isLast && /*#__PURE__*/React.createElement("span", {
      className: ['wd-step__line', i < current ? 'wd-step__line--done' : ''].filter(Boolean).join(' '),
      style: {
        left: '50%',
        right: '-50%'
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "wd-step__dot"
    }, state === 'done' ? /*#__PURE__*/React.createElement(Check, null) : i + 1), /*#__PURE__*/React.createElement("span", {
      className: "wd-step__label"
    }, label));
  }));
}
Object.assign(__ds_scope, { ProgressStepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/progress/ProgressStepper.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wuduh-app/screens.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Wuduh app — UI kit screens.
   Composes the design-system primitives from window.WuduhDesignSystem_971755.
   Exports screen components to window for index.html to assemble. */

const DS = window.WuduhDesignSystem_971755;
const {
  Button,
  IconButton,
  Card,
  Badge,
  Avatar,
  Textarea,
  ProgressBar,
  ProgressStepper
} = DS;

/* ── inline icons (Lucide-style, 2px stroke) ─────────────── */
const Ico = p => /*#__PURE__*/React.createElement("svg", _extends({
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, p));
const ArrowRight = () => /*#__PURE__*/React.createElement(Ico, null, /*#__PURE__*/React.createElement("line", {
  x1: "5",
  y1: "12",
  x2: "19",
  y2: "12"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "12 5 19 12 12 19"
}));
const ArrowLeft = () => /*#__PURE__*/React.createElement(Ico, null, /*#__PURE__*/React.createElement("line", {
  x1: "19",
  y1: "12",
  x2: "5",
  y2: "12"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "12 19 5 12 12 5"
}));
const Check = () => /*#__PURE__*/React.createElement(Ico, {
  strokeWidth: "2.4"
}, /*#__PURE__*/React.createElement("polyline", {
  points: "20 6 9 17 4 12"
}));
const Download = () => /*#__PURE__*/React.createElement(Ico, null, /*#__PURE__*/React.createElement("path", {
  d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "7 10 12 15 17 10"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "15",
  x2: "12",
  y2: "3"
}));
const FileText = () => /*#__PURE__*/React.createElement(Ico, null, /*#__PURE__*/React.createElement("path", {
  d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "14 2 14 8 20 8"
}), /*#__PURE__*/React.createElement("line", {
  x1: "16",
  y1: "13",
  x2: "8",
  y2: "13"
}), /*#__PURE__*/React.createElement("line", {
  x1: "16",
  y1: "17",
  x2: "8",
  y2: "17"
}));

/* Brand mark */
const Mark = ({
  size = 30,
  onDark = false
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 96 96",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z",
  fill: "#C9A84C"
}), /*#__PURE__*/React.createElement("path", {
  d: "M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81",
  stroke: onDark ? '#AEC6D9' : '#0D1B2A',
  strokeWidth: "7.8",
  fill: "none",
  strokeLinejoin: "round",
  strokeLinecap: "round"
}));

/* Geometric net background */
const Net = ({
  stroke = '#C9A84C',
  opacity = 0.4
}) => /*#__PURE__*/React.createElement("svg", {
  style: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%'
  }
}, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("pattern", {
  id: "kitnet",
  width: "64",
  height: "64",
  patternUnits: "userSpaceOnUse"
}, /*#__PURE__*/React.createElement("g", {
  fill: "none",
  stroke: stroke,
  strokeWidth: "1",
  strokeOpacity: opacity
}, /*#__PURE__*/React.createElement("rect", {
  x: "16",
  y: "16",
  width: "32",
  height: "32"
}), /*#__PURE__*/React.createElement("rect", {
  x: "22.6",
  y: "22.6",
  width: "32",
  height: "32",
  transform: "rotate(45 32 32)",
  strokeOpacity: opacity * 0.6
}), /*#__PURE__*/React.createElement("path", {
  d: "M32 0 L32 16 M32 48 L32 64 M0 32 L16 32 M48 32 L64 32",
  strokeOpacity: opacity * 0.65
})))), /*#__PURE__*/React.createElement("rect", {
  width: "100%",
  height: "100%",
  fill: "url(#kitnet)"
}));
const SECTIONS = ["Idea", "Market", "Team", "Finance", "Risk"];
const QUESTIONS = [{
  section: 1,
  n: 4,
  total: 12,
  cat: "Market",
  q: "Who is your first customer, and where do they already look for a solution?",
  help: "Be specific. One clear segment beats three vague ones — we'll size it next.",
  ph: "Independent café owners in Riyadh who track inventory on paper…"
}, {
  section: 1,
  n: 5,
  total: 12,
  cat: "Market",
  q: "How big is that market, and how fast is it growing?",
  help: "A rough, defensible number beats a precise guess. We'll help you show your working.",
  ph: "~3,400 independent cafés in the Kingdom, growing ~9% a year…"
}, {
  section: 2,
  n: 6,
  total: 12,
  cat: "Team",
  q: "Why is your team the right one to build this?",
  help: "Investors back people first. Name the unfair advantage you already have.",
  ph: "I ran operations for a 9-branch café chain for four years…"
}];

/* ── App header / shell ──────────────────────────────────── */
function AppHeader({
  value,
  max
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '14px 22px',
      background: 'var(--surface-card)',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement(Mark, {
    size: 26
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 18,
      color: 'var(--text-strong)'
    }
  }, "Wuduh")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      maxWidth: 320
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: value,
    max: max,
    showCount: true,
    label: "Your study"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginInlineStart: 'auto'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Layla Al-Saud",
    size: "sm"
  })));
}

/* ── 1. Start screen ─────────────────────────────────────── */
function StartScreen({
  onStart
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      background: 'var(--surface-inverse)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Net, {
    opacity: 0.34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      textAlign: 'center',
      maxWidth: 560,
      padding: '0 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      marginBottom: 26
    }
  }, /*#__PURE__*/React.createElement(Mark, {
    size: 56,
    onDark: true
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--gold-400)',
      margin: 0
    }
  }, "Feasibility study \xB7 12 cards"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 46,
      lineHeight: 1.08,
      letterSpacing: '-0.02em',
      color: 'var(--text-on-dark)',
      margin: '14px 0 0'
    }
  }, "Let's figure this out, together."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: 1.6,
      color: 'var(--navy-200)',
      margin: '16px auto 0',
      maxWidth: 460
    }
  }, "Answer one question at a time. When you're done, Wuduh assembles your answers into a feasibility study you'll be proud to send."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      marginTop: 30
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    iconEnd: /*#__PURE__*/React.createElement(ArrowRight, null),
    onClick: onStart
  }, "Start your study"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    onClick: onStart,
    style: {
      color: 'var(--navy-100)'
    }
  }, "I have a draft")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      display: 'flex',
      gap: 18,
      justifyContent: 'center',
      flexWrap: 'wrap'
    }
  }, SECTIONS.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: s,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--navy-300)'
    }
  }, String(i + 1).padStart(2, '0'), " ", s)))));
}

/* ── 2. Card flow ────────────────────────────────────────── */
function CardFlow({
  onExport
}) {
  const [i, setI] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const item = QUESTIONS[i];
  const done = i;
  const setAnswer = v => setAnswers(a => ({
    ...a,
    [i]: v
  }));
  const next = () => {
    if (i < QUESTIONS.length - 1) setI(i + 1);else onExport();
  };
  const prev = () => setI(Math.max(0, i - 1));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-canvas)'
    }
  }, /*#__PURE__*/React.createElement(AppHeader, {
    value: item.n,
    max: item.total
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 22px 0'
    }
  }, /*#__PURE__*/React.createElement(ProgressStepper, {
    steps: SECTIONS,
    current: item.section
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 22px 28px'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "swipe",
    padding: "lg",
    style: {
      width: 560,
      maxWidth: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "gold"
  }, item.cat), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-muted)',
      letterSpacing: '.04em'
    }
  }, String(item.n).padStart(2, '0'), " / ", item.total)), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 28,
      lineHeight: 1.22,
      letterSpacing: '-0.015em',
      color: 'var(--text-strong)',
      margin: 0
    }
  }, item.q), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      color: 'var(--text-muted)',
      lineHeight: 1.55,
      margin: '12px 0 20px'
    }
  }, item.help), /*#__PURE__*/React.createElement(Textarea, {
    value: answers[i] || '',
    onChange: e => setAnswer(e.target.value),
    placeholder: item.ph,
    maxLength: 400
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Previous card",
    variant: "outline",
    round: true,
    onClick: prev,
    disabled: i === 0
  }, /*#__PURE__*/React.createElement(ArrowLeft, null)), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: next
  }, "Skip for now"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginInlineStart: 'auto'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconEnd: /*#__PURE__*/React.createElement(ArrowRight, null),
    onClick: next
  }, i < QUESTIONS.length - 1 ? 'Done — next card' : 'Finish & assemble'))))));
}

/* ── 3. Export screen ────────────────────────────────────── */
function ExportScreen({
  onRestart
}) {
  const checklist = ["Executive summary", "Market & customer", "Team & advantage", "Financial model", "Risk & mitigation"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'grid',
      gridTemplateColumns: '0.9fr 1.1fr'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: 'var(--surface-inverse)',
      overflow: 'hidden',
      padding: '48px 44px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Net, {
    opacity: 0.3
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "teal",
    dot: true
  }, "Complete"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 40,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      color: 'var(--text-on-dark)',
      margin: '16px 0 0'
    }
  }, "Your study is ready."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      lineHeight: 1.6,
      color: 'var(--navy-200)',
      margin: '14px 0 26px',
      maxWidth: 360
    }
  }, "12 cards, assembled into a structured feasibility study. Export it, or keep refining."), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, checklist.map(c => /*#__PURE__*/React.createElement("li", {
    key: c,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      color: 'var(--navy-100)',
      fontSize: 15
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 22,
      height: 22,
      borderRadius: 999,
      background: 'var(--teal-500)',
      color: '#fff',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Check, null)), c))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    iconStart: /*#__PURE__*/React.createElement(Download, null)
  }, "Export PDF"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    style: {
      color: 'var(--navy-100)'
    },
    onClick: onRestart
  }, "Start over")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--slate-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 36
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 420,
      maxWidth: '100%',
      background: 'var(--surface-paper)',
      borderRadius: 6,
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.5
    }
  }, /*#__PURE__*/React.createElement(Net, {
    stroke: "#0D1B2A",
    opacity: 0.12
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      padding: '40px 44px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 30
    }
  }, /*#__PURE__*/React.createElement(Mark, {
    size: 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 15,
      color: 'var(--text-strong)'
    }
  }, "Wuduh"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginInlineStart: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '.1em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)'
    }
  }, "Feasibility Study")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      margin: 0
    }
  }, "Saffa \xB7 Prepared June 2026"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 26,
      lineHeight: 1.15,
      letterSpacing: '-0.015em',
      color: 'var(--text-strong)',
      margin: '8px 0 4px'
    }
  }, "Inventory clarity for independent caf\xE9s"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      width: 48,
      background: 'var(--gold-500)',
      borderRadius: 99,
      margin: '14px 0 18px'
    }
  }), [{
    h: '01  Executive summary',
    lines: 3
  }, {
    h: '02  Market & customer',
    lines: 4
  }, {
    h: '03  Team & advantage',
    lines: 2
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.h,
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 12.5,
      color: 'var(--text-strong)',
      margin: '0 0 8px'
    }
  }, s.h), Array.from({
    length: s.lines
  }).map((_, k) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 6,
      borderRadius: 99,
      background: 'var(--paper-line)',
      width: k === s.lines - 1 ? '62%' : '100%',
      marginBottom: 7
    }
  }))))))));
}
Object.assign(window, {
  StartScreen,
  CardFlow,
  ExportScreen,
  Mark
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wuduh-app/screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.ProgressStepper = __ds_scope.ProgressStepper;

})();
