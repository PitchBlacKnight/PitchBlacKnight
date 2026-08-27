# Keystone

An unbranded design system built to demonstrate a complete design-to-code chain — the
argument, not the aesthetics.

```
tokens/*.tokens.json     W3C DTCG · three tiers · the only source
        │
        └─ build/build.mjs   resolve aliases · enforce one-way flow · fail on violations
             │
             ├─→ dist/keystone.css          CSS custom properties, light + dark
             ├─→ dist/keystone.tokens.json  flattened + resolved, for any other consumer
             ├─→ dist/Keystone.swift        iOS — proof the source is platform-agnostic
             └─→ dist/keystone.skill.md     machine-readable guidance, GENERATED
                                            from the same source as the CSS
components/              accessible web components consuming dist/keystone.css
docs/index.html          living documentation — renders the real components
```

## Run it

```bash
node build/build.mjs
python3 -m http.server 4321      # docs use fetch(), so http:// not file://
```

Then open `docs/index.html`.

## The four arguments this makes

**1 · Three tiers with a one-way flow.** `primitive → semantic → component`. The build
*fails* on a higher-tier reference and *warns* on a same-tier one, so the architecture is
enforced by the pipeline rather than by review. Only colour has a semantic tier, because
only colour re-themes — inventing `semantic.space.4` as an alias of `space.4` adds a hop
and no information.

**2 · Platform-agnostic by construction.** The same token file emits CSS, JSON, and Swift.
Figma becomes one consumer of the tokens rather than the place the truth lives.

**3 · Accessibility as a contract, not a review note.** Focus rings that are never
suppressed, 44×44 targets achieved with an invisible hit area rather than by inflating the
visual control, non-colour signals on every state, `aria-invalid` + `aria-describedby`
wired into the component, and a disabled control that stays focusable so a keyboard user
auditing a form can still find it.

**4 · Guidance that cannot rot.** `keystone.skill.md` is generated. A hand-written skill
file drifts from the system the first time a token changes — which is not hypothetical:
the design file this was modelled on documents 43 semantic tokens and contains 62.

## Deliberately not here

- No component tier for typography — nothing has needed a per-component exception yet, and
  a tier that isn't earning its keep is just indirection.
- No visual polish beyond what the tokens produce. The point is the chain, not the skin.
