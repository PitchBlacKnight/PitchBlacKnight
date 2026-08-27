/**
 * <pf-input> — Pathfinder
 *
 * The accessibility contract lives in the component, not in a review checklist:
 * the label is always rendered and programmatically associated, the error is
 * announced, and invalid state carries an icon as well as a colour.
 *
 * Attributes
 *   label       required — a placeholder is not a label
 *   type        text | email | password | search | tel | url  (default: text)
 *   value       string
 *   placeholder string
 *   helper      string  — hint text, hidden when an error is present
 *   error       string  — presence sets invalid state
 *   disabled    boolean
 *   readonly    boolean
 *   required    boolean
 */

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
  :host { display: block; }
  .field { display: flex; flex-direction: column; gap: var(--primitive-space-4, 8px); }

  label {
    font-family: var(--typography-body-sm-font-family, system-ui);
    font-size: var(--typography-label-lg-font-size, 14px);
    font-weight: var(--typography-label-lg-font-weight, 500);
    color: var(--semantic-text-primary, #1a1c26);
  }
  .req { color: var(--semantic-status-error, #db2626); margin-inline-start: 2px; }

  input {
    all: unset;
    box-sizing: border-box;
    height: var(--component-input-height, 40px);
    padding-inline: var(--component-input-pad-inline, 12px);
    border-radius: var(--component-input-radius, 8px);
    background: var(--component-input-bg, #fff);
    color: var(--component-input-fg, #1a1c26);
    font-family: var(--typography-body-sm-font-family, system-ui);
    font-size: var(--typography-label-lg-font-size, 14px);
    box-shadow: inset 0 0 0 var(--primitive-border-width-thin, 1px) var(--component-input-border, #ccd1db);
    transition: box-shadow var(--component-input-motion, 120ms) cubic-bezier(.2,0,.1,1);
  }
  input::placeholder { color: var(--component-input-fg-placeholder, #9ea6b5); }
  input:hover { box-shadow: inset 0 0 0 1px var(--component-input-border-hover, #9ea6b5); }
  input:focus-visible {
    outline: var(--primitive-border-width-focus, 2px) solid var(--component-input-focus-ring, #8554f5);
    outline-offset: 0;
  }
  :host([disabled]) input {
    background: var(--component-input-bg-disabled, #f2f2f7);
    color: var(--semantic-text-disabled, #ccd1db);
    cursor: not-allowed;
  }

  /* Invalid is signalled by border + icon + text — never by colour alone */
  :host([data-invalid]) input {
    box-shadow: inset 0 0 0 var(--primitive-border-width-focus, 2px) var(--component-input-border-invalid, #db2626);
  }

  .msg {
    font-family: var(--typography-body-sm-font-family, system-ui);
    font-size: var(--typography-body-xs-font-size, 12px);
    color: var(--semantic-text-secondary, #545c6b);
  }
  .msg.error {
    color: var(--semantic-status-error, #db2626);
    display: flex; align-items: center; gap: 6px;
  }
  .msg.error::before {
    content: "";
    width: 12px; height: 12px; flex: none;
    background: currentColor;
    /* triangle-alert — the non-colour half of the error signal */
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
  }
  @media (prefers-reduced-motion: reduce) { input { transition-duration: .01ms; } }
`);

let uid = 0;

class PfInput extends HTMLElement {
  static observedAttributes = ['label', 'type', 'value', 'placeholder', 'helper', 'error', 'disabled', 'readonly', 'required'];

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
    root.adoptedStyleSheets = [sheet];
    this._id = 'pf-input-' + (++uid);
    root.innerHTML = `
      <div class="field">
        <label for="${this._id}"></label>
        <input id="${this._id}">
        <div class="msg" id="${this._id}-msg"></div>
      </div>`;
    this._label = root.querySelector('label');
    this._input = root.querySelector('input');
    this._msg = root.querySelector('.msg');
    this._input.addEventListener('input', () => {
      this.setAttribute('value', this._input.value);
      this.dispatchEvent(new CustomEvent('pf-input', { detail: { value: this._input.value }, bubbles: true, composed: true }));
    });
  }

  connectedCallback() { this._sync(); }
  attributeChangedCallback() { this._sync(); }

  get value() { return this._input.value; }
  set value(v) { this.setAttribute('value', v); }

  _sync() {
    if (!this._input) return;
    const label = this.getAttribute('label');
    const error = this.getAttribute('error');
    const helper = this.getAttribute('helper');
    const required = this.hasAttribute('required');

    if (!label) console.warn('<pf-input> is missing a label. A placeholder is not a label.');
    this._label.innerHTML = (label || '') + (required ? '<span class="req" aria-hidden="true">*</span>' : '');

    this._input.type = this.getAttribute('type') || 'text';
    this._input.placeholder = this.getAttribute('placeholder') || '';
    this._input.disabled = this.hasAttribute('disabled');
    this._input.readOnly = this.hasAttribute('readonly');
    this._input.required = required;
    if (this.hasAttribute('value') && this._input.value !== this.getAttribute('value')) {
      this._input.value = this.getAttribute('value');
    }

    // invalid state: aria-invalid + aria-describedby pointing at a live message
    this.toggleAttribute('data-invalid', !!error);
    this._input.setAttribute('aria-invalid', String(!!error));
    this._msg.classList.toggle('error', !!error);
    this._msg.textContent = error || helper || '';
    this._msg.setAttribute('role', error ? 'alert' : 'status');
    if (error || helper) {
      this._input.setAttribute('aria-describedby', this._id + '-msg');
    } else {
      this._input.removeAttribute('aria-describedby');
    }
  }
}

customElements.define('pf-input', PfInput);
export { PfInput };
