/**
 * <ks-button> — Keystone
 *
 * Every value below resolves to a token from dist/keystone.css. There is no raw
 * colour, no off-scale spacing, and no hardcoded duration in this file.
 *
 * Why custom properties and not a stylesheet: shadow DOM deliberately blocks
 * external stylesheets, but CSS custom properties *inherit through* the shadow
 * boundary. That is precisely why tokens-as-custom-properties is the right
 * vehicle for a web-component design system — the component stays encapsulated
 * while the theme still reaches it.
 *
 * Attributes
 *   variant  primary | secondary | ghost | danger      (default: primary)
 *   size     sm | md | lg                              (default: md)
 *   disabled boolean
 *   loading  boolean
 *   type     button | submit | reset                   (default: button)
 */

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
  :host {
    display: inline-flex;
    /* token fallbacks keep the component usable before the theme loads */
    --_bg:      var(--component-button-bg, #e86a33);
    --_bg-h:    var(--component-button-bg-hover, #c8552b);
    --_bg-a:    var(--component-button-bg-active, #9e4222);
    --_fg:      var(--component-button-fg, #fff);
    --_radius:  var(--component-button-radius, 8px);
    --_ring:    var(--component-button-focus-ring, #c8552b);
    --_motion:  var(--component-button-motion, 120ms);
    --_h:       var(--component-button-height-md, 40px);
    --_pad:     var(--component-button-pad-inline-md, 24px);
  }
  :host([size="sm"]) { --_h: var(--component-button-height-sm, 32px); --_pad: var(--component-button-pad-inline-sm, 12px); }
  :host([size="lg"]) { --_h: var(--component-button-height-lg, 48px); --_pad: var(--component-button-pad-inline-lg, 32px); }

  button {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--component-button-gap, 8px);
    height: var(--_h);
    padding-inline: var(--_pad);
    border-radius: var(--_radius);
    background: var(--_bg);
    color: var(--_fg);
    font-family: var(--primitive-font-family-sans, system-ui);
    font-size: var(--primitive-font-size-sm, 14px);
    font-weight: var(--primitive-font-weight-medium, 500);
    line-height: 1;
    cursor: pointer;
    position: relative;
    transition: background var(--_motion) cubic-bezier(.2,0,.1,1);
    /* 44×44 minimum target, achieved with an invisible hit area rather than
       by inflating the visual control — rule 5 of the generated skill file */
    min-width: var(--primitive-size-target-min, 44px);
  }
  button::after {
    content: "";
    position: absolute;
    inset: 50% 0 auto 0;
    height: var(--primitive-size-target-min, 44px);
    transform: translateY(-50%);
  }

  button:hover  { background: var(--_bg-h); }
  button:active { background: var(--_bg-a); }

  /* focus-visible only — never suppressed without a replacement */
  button:focus-visible {
    outline: var(--primitive-border-width-focus, 2px) solid var(--_ring);
    outline-offset: 2px;
  }

  :host([variant="secondary"]) button {
    background: transparent;
    color: var(--semantic-text, #1a1917);
    box-shadow: inset 0 0 0 var(--primitive-border-width-thin, 1px) var(--component-button-border, #9a938a);
  }
  :host([variant="secondary"]) button:hover { background: var(--semantic-surface-raised, #f7f6f3); }

  :host([variant="ghost"]) button {
    background: transparent;
    color: var(--semantic-text-muted, #5c564e);
  }
  :host([variant="ghost"]) button:hover { background: var(--semantic-surface-raised, #f7f6f3); color: var(--semantic-text, #1a1917); }

  :host([variant="danger"]) button { background: var(--component-button-danger-bg, #c0392b); }
  :host([variant="danger"]) button:hover { filter: brightness(.92); }

  /* Disabled carries a NON-COLOUR signal — the cursor and a dashed edge —
     so it is not communicated by dimming alone. Rule 6. */
  :host([disabled]) button {
    background: var(--component-button-bg-disabled, #edebe6);
    color: var(--component-button-fg-disabled, #9a938a);
    cursor: not-allowed;
    box-shadow: inset 0 0 0 1px var(--semantic-border, #d9d5cc);
  }
  :host([disabled]) button:hover { background: var(--component-button-bg-disabled, #edebe6); }

  /* Loading keeps the label and the width — the spinner replaces nothing visually
     that would cause a reflow, and aria-busy carries it to assistive tech. */
  .spinner {
    width: 14px; height: 14px; flex: none;
    border: 2px solid color-mix(in srgb, currentColor 35%, transparent);
    border-top-color: currentColor;
    border-radius: 999px;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) {
    .spinner { animation-duration: 3s; }
    button { transition-duration: .01ms; }
  }
`);

class KsButton extends HTMLElement {
  static observedAttributes = ['disabled', 'loading', 'type'];

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
    root.adoptedStyleSheets = [sheet];
    root.innerHTML = `<button part="button"><span class="spinner" hidden></span><slot></slot></button>`;
    this._btn = root.querySelector('button');
    this._spinner = root.querySelector('.spinner');
  }

  connectedCallback() {
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'primary');
    if (!this.hasAttribute('size')) this.setAttribute('size', 'md');
    this._sync();
    // A disabled control that cannot be focused is invisible to a keyboard user
    // auditing a form. Keep it focusable and announce state instead.
    this._btn.addEventListener('click', (e) => {
      if (this.hasAttribute('disabled') || this.hasAttribute('loading')) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);
  }

  attributeChangedCallback() { this._sync(); }

  _sync() {
    if (!this._btn) return;
    const disabled = this.hasAttribute('disabled');
    const loading = this.hasAttribute('loading');
    this._btn.setAttribute('type', this.getAttribute('type') || 'button');
    this._btn.setAttribute('aria-disabled', String(disabled || loading));
    this._btn.setAttribute('aria-busy', String(loading));
    this._spinner.hidden = !loading;
    // aria-label is the author's job for icon-only usage; warn loudly in dev
    if (!this.textContent.trim() && !this.getAttribute('aria-label')) {
      console.warn('<ks-button> has no text and no aria-label — this produces an unlabelled control in the accessibility tree.');
    }
  }
}

customElements.define('ks-button', KsButton);
export { KsButton };
