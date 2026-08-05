---
name: keystone-ds
description: The Keystone Design System — design tokens, component rules, and accessibility standards. Use whenever generating, editing, reviewing, or documenting UI components, design tokens, interface code, or front-end markup, so that output is on-system rather than generic. Also use when auditing existing code against system rules.
---

# Keystone Design System

You are working inside Keystone, a token-driven design system. Everything you produce
must resolve to Keystone tokens. Never invent a raw value when a token exists.

## The output contract

Every generation MUST follow all five rules. These are not preferences.

1. **Token-first.** Every color, space, radius, type size, and duration comes from
   `references/tokens.md`. Raw hex, raw px, and magic numbers are defects.
2. **Annotate the source.** Every declaration that consumes a token carries an inline
   comment naming the token it came from — e.g. `padding: var(--space-3) var(--space-5); /* space.3 / space.5 */`.
   This is how a reviewer verifies the system was used, not guessed.
3. **Full state coverage.** A component is not complete until every state in its spec
   exists: default, hover, active, focus-visible, disabled, and loading where applicable.
   Ship the states even when the request only asks for "a button."
4. **Accessibility is architecture.** Apply `references/accessibility.md` without being
   asked. A visible `:focus-visible` ring, a 44×44 minimum target, a 4.5:1 contrast floor,
   and a non-color signal for every status are non-negotiable.
5. **Close with a system note.** End every response with a short `System notes` block:
   which tokens were used, which states were generated, and any place you had to make a
   judgment call the system doesn't yet cover. Flag gaps — don't paper over them.

## Output format

Default to a **React function component in TypeScript**, styled with CSS custom properties
(a co-located `.css` file or CSS module — not inline styles, not a utility-class soup).
Props are typed. Variants and sizes are props, never separate components. Emit plain
HTML/CSS only when explicitly asked for it.

## Working from a Figma file

When a Figma frame is provided via the Figma MCP server:

- Read the **variables**, not the rendered values. `get_variable_defs` is the source of
  truth; a hex you inferred from a screenshot is a defect.
- Check `get_code_connect_map` before generating. If a component in the frame is already
  mapped to a component in the repo, **compose with it** — do not regenerate it.
- Where the file uses a raw value with no variable behind it, do not silently launder it
  into a token. Flag it in `System notes` as design-side drift that needs fixing at source.
- The file supplies the values. This skill supplies the rules. When they conflict, follow
  the skill and say so.

## How to build

- Semantic tokens over primitives. Reach for `--color-action-bg`, not `--brand-600`.
  Primitives are the private layer; semantics are the API.
- One component, one anatomy. Variants change appearance, never structure.
- Compose from existing components before creating a new one. If a request needs a new
  primitive, say so explicitly rather than quietly inventing it.
- CSS custom properties for theming. Light and dark resolve from the same semantic layer,
  so a component is authored once and re-themed, never forked.
- Class naming: `ks-<component>`, modifiers `ks-<component>--<variant>`,
  elements `ks-<component>__<part>`.

## Reference files

Read the relevant file before generating.

- `references/tokens.md` — the full token scale: color, space, type, radius, elevation, motion.
- `references/components.md` — anatomy, variants, states, and do/don't rules for button, input, and card.
- `references/accessibility.md` — WCAG 2.2 AA rules applied as build-time requirements.
- `references/metadata.md` — the machine-readable component inventory schema, and how to generate it.

## Generating component metadata

This skill has two jobs. Everything above is the first: **build a component correctly.**
The second is **describe what already exists**, so the system can be selected from rather
than generated alongside.

When asked to produce metadata for a component — or when standing a system up for
AI-assisted workflows — follow `references/metadata.md`. The rules that matter most:

- Read the component source. Anything inferred rather than read gets flagged, not guessed.
- Every visual value in the record binds to a token. A raw hex in a metadata record has
  documented a defect, not a component.
- Anti-patterns come from real review comments, and they are **hard rules** — a violation
  needs an explicit human override, acknowledged out loud.
- Stamp `provenance`: source checksum, token version, and `reviewedBy: unreviewed` until a
  person has read it. A record whose checksum no longer matches its source is stale and
  must be treated as untrusted rather than quietly used.

Rules without an inventory produce well-formed reinvention. An inventory without rules
produces correct selection and sloppy implementation. Ship both.

## Auditing existing code

When given code to review, report in this order:
1. **Off-system values** — every raw value with the token it should have been.
2. **Missing states** — states the spec requires that the code doesn't implement.
3. **Accessibility failures** — mapped to the specific rule in `accessibility.md`.
4. **Structural drift** — anatomy that deviates from the component spec.

Give a corrected version after the report, not instead of it.
