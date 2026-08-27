# Component metadata — the machine-readable inventory

The rest of this skill encodes **how to build a component correctly**. This file encodes
**what already exists**, so the model selects from the system instead of generating
alongside it.

Both layers are required. Rules without an inventory produce well-formed reinvention.
An inventory without rules produces correct selection and sloppy implementation.

## Where it lives

One record per component, beside the component, plus an index per layer.

```
components/
├── design-system.metadata.json      philosophy, conventions, metadata map
├── atoms/
│   ├── index.metadata.json          selection guide across atoms
│   └── Button/
│       ├── Button.tsx
│       └── Button.metadata.json
├── molecules/…
└── organisms/…
```

Read broad first — the system record and the layer index — then pull only the component
records a decision actually needs. Do not read every record to answer one question.

## The schema

```jsonc
{
  "component": {
    "name": "Button",
    "category": "atoms",                  // atoms | molecules | organisms
    "type": "interactive",                // interactive | display | container | input | navigation
    "description": "One-line, plain language.",
    "status": "stable",                   // stable | beta | deprecated
    "since": "2.1.0",
    "replacedBy": null                    // component name when status is deprecated
  },

  // ── The layer their schema doesn't have. Every visual decision, bound. ──
  "tokens": {
    "height":        "size.control.md",
    "paddingInline": "space.5",
    "radius":        "radius.md",
    "background":    "color.action.bg",
    "foreground":    "color.action.fg",
    "focusRing":     "color.focus.ring",
    "motion":        "duration.fast"
  },

  "usage": {
    "useCases": ["primary-call-to-action", "form-submit", "destructive-confirm"],
    "requiredProps": ["children"],

    // Decision rules, not descriptions. The composer matches intent against these.
    "selectionCriteria": {
      "primary":   "The single main action in a view. One per view, never two.",
      "secondary": "Supporting actions alongside a primary.",
      "ghost":     "Tertiary actions in dense UI where visual weight would compete.",
      "danger":    "Destructive actions that have already been confirmed."
    },

    "commonPatterns": [
      {
        "name": "submit-with-loading",
        "description": "Form submit that must not change width while pending.",
        "composition": "<Button type=\"submit\" loading={isPending}>Save</Button>"
      }
    ],

    // Hard rules. A violation requires explicit human override, acknowledged out loud.
    "antiPatterns": [
      {
        "scenario": "Using Button to navigate to another page",
        "reason": "Buttons announce actions; links announce destinations. Screen reader users navigate by role.",
        "alternative": "Link"
      },
      {
        "scenario": "Two primary buttons in one view",
        "reason": "Primary means the single main action. Two primaries means neither is.",
        "alternative": "One primary, the rest secondary"
      },
      {
        "scenario": "Icon-only Button without an accessible name",
        "reason": "Produces an unlabelled control in the accessibility tree.",
        "alternative": "aria-label, or a visible label"
      }
    ]
  },

  "composition": {
    "slots": { "leadingIcon": "Icon", "children": "text", "trailingIcon": "Icon" },
    "nestedComponents": ["Icon", "Spinner"],
    "commonPartners": ["ButtonGroup", "Form", "Dialog"],
    "parentConstraints": ["Must not be nested inside another interactive element"],
    "forbiddenParents": ["Button", "Link", "Card[interactive]"]
  },

  "behavior": {
    // Each state carries its own token bindings and its own accessibility obligation.
    "states": [
      { "name": "default" },
      { "name": "hover",   "tokens": { "background": "color.action.bg.hover" } },
      { "name": "active",  "tokens": { "background": "color.action.bg.active" } },
      { "name": "focus-visible",
        "tokens": { "outline": "color.focus.ring" },
        "a11y": "2px ring, 2px offset, ≥3:1 against both the control and the page behind it" },
      { "name": "disabled",
        "a11y": "aria-disabled, remains focusable, never signalled by opacity alone" },
      { "name": "loading",
        "a11y": "aria-busy, label persists, width does not change" }
    ],
    "interactions": { "click": "fires onClick", "Enter": "activates", "Space": "activates" },
    "responsive": { "below": "sm → full width inside forms" }
  },

  "accessibility": {
    "role": "button",
    "accessibleName": "From children, or aria-label when icon-only",
    "keyboard": { "Tab": "moves focus", "Enter": "activate", "Space": "activate" },
    "screenReader": "Announces name, role, and disabled/busy state",
    "focusManagement": "Never traps; returns focus to trigger when opening a dialog",
    // Contrast pairs an auditor must verify, named as token pairs — checkable by a script.
    "contrast": [
      { "pair": ["color.action.fg", "color.action.bg"], "min": 4.5 },
      { "pair": ["color.focus.ring", "color.surface"],  "min": 3.0 }
    ],
    "nonColorSignal": "Disabled and loading both carry a non-color cue",
    "wcag": ["1.4.3", "1.4.11", "2.1.1", "2.4.7", "2.5.5", "4.1.2"],
    "targetSize": "44×44 minimum including invisible padding"
  },

  // ── The block that keeps this from rotting. Also absent from every version
  //    of this schema I've seen in the wild. ──
  "provenance": {
    "generatedFrom": "components/atoms/Button/Button.tsx",
    "sourceChecksum": "sha256:…",
    "tokensVersion": "4.2.0",
    "generatedAt": "2026-08-04T00:00:00Z",
    "reviewedBy": "human"                 // human | unreviewed
  },

  "aiHints": {
    "priority": "high",
    "keywords": ["button", "cta", "submit", "action"],
    "context": "Reach here for any action. For navigation, reach for Link instead."
  }
}
```

## Generating it

1. **Read the source, not the docs.** Props, variants, and states come from the component
   file. Anything you infer rather than read gets flagged, not guessed.
2. **Bind every visual value to a token.** A metadata record with a raw hex in it has
   documented a defect rather than a component.
3. **Write anti-patterns from real review comments.** The ones worth encoding are the
   mistakes that actually got made. Invented anti-patterns are noise.
4. **Stamp provenance.** Checksum the source and record the token version. A record whose
   checksum no longer matches its source is stale and must be treated as untrusted.
5. **Mark `reviewedBy: unreviewed` until a person reads it.** Generated metadata is a draft
   like any other generated artifact.

## Reporting

After generating across a system, report:

- **Coverage** — components with a record ÷ total components
- **Stale** — records whose `sourceChecksum` no longer matches
- **Unreviewed** — records no human has confirmed
- **Untokenised** — raw values found in `tokens` blocks
- **Thin** — records with no `antiPatterns`, which usually means nobody has used the
  component in anger yet

Those five numbers are the adoption metric. They're also the honest answer to "how do you
stop this from becoming another thing nobody updates."
