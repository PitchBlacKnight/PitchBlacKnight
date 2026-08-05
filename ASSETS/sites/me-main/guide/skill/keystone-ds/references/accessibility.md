# Keystone accessibility standards

WCAG 2.2 AA is the floor, applied at build time. These are requirements, not review notes —
apply them without being asked and without being reminded.

## Color and contrast

- Body and UI text: **4.5:1** minimum against its own background.
- Text 18px+ or 14px bold: **3:1** minimum.
- Interactive borders, focus rings, icons carrying meaning: **3:1** against adjacent color.
- **Never signal state by color alone.** Error gets an icon and text. Success gets an icon.
  Required gets a word, not just an asterisk in red.
- Verify contrast in **both** themes. A token pair that passes in light can fail in dark.

## Focus

- Every interactive element has a visible `:focus-visible` indicator: 2px
  `--color-focus-ring`, 2px offset, 3:1 against both the component and the page behind it.
- `outline: none` is only permitted when a replacement indicator is defined in the same rule.
- Focus order follows visual order. No positive `tabindex`.
- Focus is never trapped except in a modal, and a modal always restores focus to its trigger.

## Targets and spacing

- Minimum target **44×44 CSS px**, achieved with padding when the visual control is smaller.
- Adjacent targets separated by at least `--space-2`.

## Semantics

- Native elements first: `<button>`, `<a href>`, `<input>`, `<label>`, `<fieldset>`.
  ARIA is a last resort, never a substitute.
- Every input has a programmatically associated `<label>`. Placeholder is not a label.
- Icon-only controls carry `aria-label`. Decorative icons carry `aria-hidden="true"`.
- Errors: `aria-invalid="true"` on the field, `aria-describedby` to the message, and the
  message is in the accessibility tree at the time of the error.
- Live regions for async status: `aria-live="polite"` for progress, `role="alert"` for errors.
- One `<h1>` per page; heading levels never skip.

## Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
```

- No parallax, auto-playing motion, or content that moves for more than 5 seconds without a
  pause control.
- Nothing flashes more than 3 times per second.

## Zoom and reflow

- Content reflows at 320px width and 400% zoom with no horizontal scroll.
- Text resizes to 200% without loss of content or function. No fixed-height text containers.

## Self-check before returning code

State the result of each in the `System notes` block:
1. Contrast verified in light **and** dark.
2. Focus-visible present on every interactive element.
3. Targets ≥ 44×44.
4. Every state carries a non-color signal.
5. Native semantics used; ARIA only where native fell short.
