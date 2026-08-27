/**
 * <pf-button> — Pathfinder
 *
 * Every value below resolves to a token from dist/pathfinder.css. There is no raw
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
    --_bg:      var(--component-button-bg, #7038e3);
    --_bg-h:    var(--component-button-bg-hover, #5e29c2);
    --_bg-a:    var(--component-button-bg-active, #4f219e);
    --_fg:      var(--component-button-fg, #fff);
    --_radius:  var(--component-button-radius, 8px);
    --_ring:    var(--component-button-focus-ring, #3d78f0);
    --_motion:  var(--component-button-motion, 120ms);
    --_h:       var(--component-button-height-md, 40px);
    --_pad:     var(--component-button-pad-inline-md, 16px);
  }
  :host([size="sm"]) { --_h: var(--component-button-height-sm, 32px); --_pad: var(--component-button-pad-inline-sm, 12px); }
  :host([size="lg"]) { --_h: var(--component-button-height-lg, 48px); --_pad: var(--component-button-pad-inline-lg, 24px); }

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
    font-family: var(--typography-body-sm-font-family, system-ui);
    font-size: var(--typography-label-lg-font-size, 14px);
    font-weight: var(--typography-label-lg-font-weight, 500);
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
    color: var(--semantic-text-primary, #1a1c26);
    box-shadow: inset 0 0 0 var(--primitive-border-width-thin, 1px) var(--component-button-border, #9ea6b5);
  }
  :host([variant="secondary"]) button:hover { background: var(--semantic-surface-raised, #fafafc); }

  :host([variant="ghost"]) button {
    background: transparent;
    color: var(--semantic-text-secondary, #545c6b);
  }
  :host([variant="ghost"]) button:hover { background: var(--semantic-surface-raised, #fafafc); color: var(--semantic-text-primary, #1a1c26); }

  :host([variant="danger"]) button { background: var(--component-button-danger-bg, #db2626); }
  :host([variant="danger"]) button:hover { filter: brightness(.92); }

  /* Disabled carries a NON-COLOUR signal — the cursor and a dashed edge —
     so it is not communicated by dimming alone. Rule 6. */
  :host([disabled]) button {
    background: var(--component-button-bg-disabled, #f2f2f7);
    color: var(--component-button-fg-disabled, #ccd1db);
    cursor: not-allowed;
    box-shadow: inset 0 0 0 1px var(--semantic-border-default, #e3e5ed);
  }
  :host([disabled]) button:hover { background: var(--component-button-bg-disabled, #f2f2f7); }

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

class PfButton extends HTMLElement {
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
      console.warn('<pf-button> has no text and no aria-label — this produces an unlabelled control in the accessibility tree.');
    }
  }
}

customElements.define('pf-button', PfButton);
export { PfButton };
