# Keystone components

Anatomy is fixed. Variants change appearance, never structure.

---

## Button — `ks-button`

**Anatomy:** `[optional leading icon] label [optional trailing icon]`, inside a single
`<button>`. Never a `<div>`. Never a bare `<a>` unless it navigates.

**Variants**

| Variant | Background | Text | Border | Use for |
|---|---|---|---|---|
| `--primary` | `--color-action-bg` | `--color-action-fg` | none | The one main action per view |
| `--secondary` | `transparent` | `--color-text` | `1px --color-border-strong` | Supporting actions |
| `--ghost` | `transparent` | `--color-text-muted` | none | Low-emphasis, in-dense-UI actions |
| `--danger` | `--color-danger` | `--color-action-fg` | none | Destructive, confirmed actions |

**Sizes** — three, no more.

| Size | Height | Padding | Type |
|---|---|---|---|
| `--sm` | 32px | `--space-2` / `--space-3` | `--text-sm` |
| `--md` (default) | 40px | `--space-3` / `--space-5` | `--text-sm` |
| `--lg` | 48px | `--space-4` / `--space-6` | `--text-base` |

**Required states — all six, every time**

- `default`
- `:hover` — `--color-action-bg-hover`, transition `--duration-fast --ease-standard`
- `:active` — `--color-action-bg-active`, no scale transform
- `:focus-visible` — 2px `--color-focus-ring` ring, 2px offset, **always visible on dark
  and light**. Never `outline: none` without a replacement.
- `:disabled` — 40% opacity, `cursor: not-allowed`, `aria-disabled="true"`, still focusable
  for screen-reader discoverability
- `loading` — spinner replaces leading icon, label stays, `aria-busy="true"`, width does
  not change

**Radius:** `--radius-md`. **Min target:** 44×44 including invisible padding at `--sm`.

**Don't:** two primary buttons in one view · icon-only without `aria-label` · a button that
navigates (use a link) · custom heights.

---

## Text input — `ks-input`

**Anatomy:** `label` (always visible) → `input` → `helper text` OR `error text`, never both.

- Label sits above, `--text-sm`, `--weight-medium`, `--color-text`, `--space-2` below.
- Field height 40px, padding `--space-3`, radius `--radius-md`, border `1px --color-border`.
- Helper text `--text-xs`, `--color-text-muted`, `--space-2` above.

**States**

- `:hover` — border `--color-border-strong`
- `:focus-visible` — border `--color-focus-ring` + 2px ring, offset 0
- `error` — border `--color-danger`, message in `--color-danger` **prefixed with an alert
  icon**, `aria-invalid="true"`, `aria-describedby` pointing at the message id
- `:disabled` — surface `--color-surface-raised`, 40% text opacity
- `readonly` — no border change, `--color-text-muted`

**Don't:** placeholder as label · error signalled by color alone · a field with no
programmatic label.

---

## Card — `ks-card`

**Anatomy:** optional media → header (title + optional meta) → body → optional footer actions.

- Surface `--color-surface-raised`, border `1px --color-border`, radius `--radius-lg`,
  padding `--space-5`, gap `--space-4`.
- Elevation `--elev-1` at rest. `--elev-2` only if the whole card is interactive.
- Title `--text-lg` `--weight-medium`. Meta `--text-xs` `--color-text-muted`.

**Interactive cards:** the whole card is one link or button, with a `:focus-visible` ring on
the card itself. Never nest interactive elements inside an interactive card.

**Don't:** elevation as decoration · more than one primary action in a footer · a card
whose title isn't the accessible name of its link.
