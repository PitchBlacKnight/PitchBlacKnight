# Keystone tokens

Three tiers, with a **strict one-way dependency flow**:

```
primitive  →  semantic  →  component
what it is    what it means   where it lives
#3B82F6       color.action.bg  button.bg.default
```

- **Primitives** are the raw scale and are private. Never reference one from a component.
- **Semantics** are the public API — meaning and intent, and the layer that themes.
- **Component tokens** are *localised exceptions*, not global rules. They exist so one
  component can change without disturbing everything else that shares its semantic.

References only ever point left to right. A semantic may reference a primitive; a component
token may reference a semantic. Never the reverse, and never sideways between two tokens in
the same tier — circular references break build-time resolution and make theming
unpredictable at runtime.

A component tier is worth adding when you first need a per-component exception. Adding it
before that is indirection for its own sake; adding it after you've already hardcoded ten
exceptions is a migration.

## Primitives — color

```
--ks-neutral-0:    #FFFFFF
--ks-neutral-50:   #F7F6F3
--ks-neutral-100:  #EDEBE6
--ks-neutral-200:  #D9D5CC
--ks-neutral-400:  #9A938A
--ks-neutral-600:  #5C564E
--ks-neutral-800:  #2A2724
--ks-neutral-900:  #1A1917
--ks-neutral-1000: #121110

--ks-brand-100:  #FBE3D8
--ks-brand-300:  #F2A882
--ks-brand-500:  #E86A33
--ks-brand-600:  #C8552B
--ks-brand-700:  #9E4222

--ks-success-500: #3F7D52
--ks-warning-500: #B7791F
--ks-danger-500:  #C0392B
--ks-danger-600:  #9B2D22
```

## Semantics — color

Light theme is the default; dark resolves the same names to different primitives, so a
component is authored once.

```
--color-surface            neutral-0        (dark: neutral-1000)
--color-surface-raised     neutral-50       (dark: neutral-900)
--color-border             neutral-200      (dark: neutral-800)
--color-border-strong      neutral-400      (dark: neutral-600)
--color-text               neutral-900      (dark: neutral-50)
--color-text-muted         neutral-600      (dark: neutral-400)
--color-text-on-action     neutral-0        (dark: neutral-0)

--color-action-bg          brand-500        (dark: brand-500)
--color-action-bg-hover    brand-600        (dark: brand-300)
--color-action-bg-active   brand-700        (dark: brand-500)
--color-action-fg          neutral-0

--color-focus-ring         brand-600        (dark: brand-300)
--color-danger             danger-500       (dark: danger-500)
--color-success            success-500
--color-warning            warning-500
```

## Component tokens

Only where a component needs to diverge from its semantic. Each one references a semantic —
never a primitive, never a raw value.

```
--button-bg-default        → color.action.bg
--button-bg-hover          → color.action.bg-hover
--button-fg               → color.action.fg
--button-radius           → radius.md
--input-border-rest       → color.border
--input-border-invalid    → color.danger
--card-surface            → color.surface-raised
```

If a component token would just restate its semantic with a new name, don't create it.
The tier earns its keep only when the indirection is load-bearing.

## Space — 4px base

```
--space-0: 0      --space-1: 4px    --space-2: 8px
--space-3: 12px   --space-4: 16px   --space-5: 24px
--space-6: 32px   --space-7: 48px   --space-8: 64px
```

Never use a value between steps. If the design needs 20px, the design is wrong or the
scale needs a token — say which.

## Type

```
--font-sans: 'Alexandria', system-ui, -apple-system, sans-serif
--font-mono: 'Space Mono', ui-monospace, monospace

--text-xs:   12px / 1.4  / 0.02em
--text-sm:   14px / 1.45 / 0.01em
--text-base: 16px / 1.55 / 0
--text-lg:   18px / 1.5  / 0
--text-xl:   24px / 1.3  / -0.01em
--text-2xl:  32px / 1.2  / -0.02em

--weight-regular: 400   --weight-medium: 500   --weight-bold: 700
```

## Radius

```
--radius-sm: 4px    --radius-md: 8px    --radius-lg: 12px    --radius-full: 999px
```

## Elevation

```
--elev-1: 0 1px 2px rgba(18,17,16,.08)
--elev-2: 0 4px 12px rgba(18,17,16,.10)
--elev-3: 0 12px 32px rgba(18,17,16,.14)
```

## Motion

```
--duration-fast: 120ms   --duration-base: 180ms   --duration-slow: 280ms
--ease-standard: cubic-bezier(.2,0,.1,1)
--ease-exit:     cubic-bezier(.4,0,1,1)
```

All motion must be wrapped by `@media (prefers-reduced-motion: reduce)` — see
`accessibility.md`.
