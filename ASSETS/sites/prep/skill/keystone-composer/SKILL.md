---
name: keystone-composer
description: Compose UI from an existing design system by reading its component metadata. Use whenever building a screen, layout, feature, or flow with a design system present, so that existing components are selected and composed rather than new ones generated. Pairs with keystone-ds, which produces the metadata this skill consumes.
---

# Keystone Composer

Your job is to build UI **out of the design system that already exists** — not to write
new components next to it.

`keystone-ds` is the producer: it encodes the rules and generates the component metadata.
This skill is the consumer. If both are loaded, the metadata is the inventory and
`keystone-ds` is the standard anything new must meet.

## The loop

**Read the inventory → parse intent → select against criteria → check anti-patterns →
verify provenance → compose → cite → flag gaps.**

Success is high reuse with decisions you can defend by pointing at a file.

## 1 · Read the inventory, cheaply

Read broad once, then narrow. Do not read every component record to answer one question.

**Once per conversation:** `design-system.metadata.json` — the system's philosophy,
conventions, and where the metadata lives. If it doesn't exist, infer from folder
structure and `package.json`, and say that you inferred it.

**Per decision:** the layer index (`atoms/index.metadata.json`), then only the specific
component records the decision needs.

If there is no metadata at all, say so before you build anything. Then either offer to
generate it with `keystone-ds`, or proceed by reading component source directly — and
label every conclusion as read-from-source rather than documented.

## 2 · Parse intent before you select

Convert the request into requirements. "A button like the one on the homepage" is not a
requirement; "the primary action in a hero, large, with a trailing icon" is.

When intent is genuinely ambiguous and the options differ materially, ask. When it's
ambiguous and they don't, pick the conventional one and say which you picked.

## 3 · Select against documented criteria

Match intent to `usage.selectionCriteria`. Those are decision rules, not descriptions —
they are the reason you chose this variant, and your justification quotes them.

Never select on aesthetics. `aiHints.keywords` are for finding candidates, never for
deciding between them; decisions come from `selectionCriteria`, `variants`, `props`, and
`antiPatterns`.

## 4 · Anti-patterns are hard rules

`usage.antiPatterns` are not warnings. Never emit one.

If the request can only be satisfied by violating one, stop and say so: name the
anti-pattern, its documented reason, and the alternative. If the user says "do it anyway,"
that's their decision to own — implement it, and note in `System notes` that a documented
anti-pattern was overridden and by whom.

Also honour `composition.forbiddenParents` and `parentConstraints`. Nesting an interactive
element inside another interactive element is the common one, and it is always a defect.

## 5 · Verify provenance before you trust a record

Every record carries a `provenance` block. Before relying on one:

- If `sourceChecksum` no longer matches the component source, the record is **stale**.
  Prefer the source, and report the drift.
- If `reviewedBy` is `unreviewed`, use it but say so.
- If `tokensVersion` is behind the current token version, flag any token reference that
  no longer resolves.

Silently composing from a stale record is the failure mode that makes people stop
trusting the whole system. Surfacing drift is more valuable than a clean-looking answer.

## 6 · Prefer the smaller move

In order:

1. **Compose existing components.**
2. **Native HTML plus tokens** where the system says to prefer it — check the system
   record for `preferNativeHTML` / `preferCSS` conventions. A `<p>` is usually better than
   a `Text` component; CSS `gap` is always better than a `Spacer`.
3. **Extend an existing component** via documented props or slots.
4. **New component** — only after the human agrees one is warranted.

## 7 · Flag gaps, don't fill them

When nothing fits, say so explicitly. Name what's missing, what's closest, why it doesn't
work, and the two or three real options with their trade-offs. Then stop and let a person
decide.

Quietly inventing a component that duplicates something already in the system is the
single most expensive thing you can do here. A flagged gap is cheap; a shadow component
found six months later is not.

## Output contract

```
Component   Button
Variant     primary
Props       { size: "lg", type: "submit" }

Composition
  <Button variant="primary" size="lg" type="submit">
    Get started <Icon name="arrow-right" size={16} />
  </Button>

Why
  · selectionCriteria.primary — "the single main action in a view"
  · commonPatterns.submit-with-loading — matches the form context
  · Icon in trailingIcon slot, per composition.slots

System notes
  · Read: atoms/index.metadata.json, Button.metadata.json (reviewed, provenance current)
  · No anti-patterns triggered
  · Gap: none
```

Every response ends with `System notes`: which records you read, their provenance status,
which anti-patterns you checked, and any gap or override. If you read nothing because
nothing existed, say that.

## Key reminders

1. **The metadata is the authority.** Suggestions map back to a documented field, never to
   your judgment about what looks right.
2. **Cite the file.** "Button.metadata.json says" beats "buttons are usually."
3. **Reuse beats generation, every time.**
4. **Stale is worse than missing.** Report drift loudly.
5. **Gaps are the human's call.** You identify them; you do not resolve them.
