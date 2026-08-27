# Audit checks

Every check below reports **what · where · how many of how many · what it costs**.
A count without a denominator is not a finding.

---

## Tokens

**Raw values in components**
Any colour, spacing, radius or duration not resolving to a token.
*Cost:* the value can't be themed and won't move when the system does. This is the check
that predicts a failed dark-mode launch six months early.
*Segment by:* component, then team.

**Duplicate values under multiple names**
Same resolved value, more than one token name.
*Cost:* usually none — separate the two cases before reporting.
· **Semantic aliasing** — `text-on-action` and `surface` both resolving to white is the
  semantic layer working. Not a finding. Say so out loud.
· **Competing primitive namespaces** — `global/white`, `Color/Neutral/White` and bare
  `White` all resolving to the same value is generational drift. That *is* a finding.

**Near-duplicate values**
Two tokens within a just-noticeable difference of each other (≈2% in luminance).
*Cost:* usually an unintentional fork — someone eyedropped instead of picking. Also the
single most common source of "why are there two navies."

**Orphan tokens**
Defined, referenced by nothing.
*Cost:* low individually, corrosive in aggregate — they make the collection unsearchable
and make every naming decision harder.

**Broken or circular references**
An alias pointing at something that doesn't resolve, or a cycle.
*Cost:* build failure or silent fallback. Always report as blocking.

**Tier violations**
A component token referencing a primitive for colour, or any reference pointing up the
tier stack.
*Cost:* the semantic layer stops being load-bearing, which means theming silently breaks
for that component only — the worst kind of bug because it looks fine in review.

---

## Components

**Missing states**
Any interactive component without the full set the spec requires — especially
`focus-visible`, which is the one that gets skipped.
*Cost:* an accessibility defect that ships. If the token exists and the component doesn't
consume it, say that explicitly; it's a stronger finding than "no focus state."

**Shadow components**
Two or more teams having built the same thing locally.
*Cost:* this is a **system failure, not a team failure.** Report it as: the system didn't
offer this, so three teams solved it three ways. Never report it as three violations.

**Detachment hotspots**
Components with detachment well above the system median.
*Cost:* depends entirely on intent — segment before concluding.
· Built to be customised → high detachment may be correct.
· A button, an input, a badge → high detachment means the component is wrong.
*The signal that matters:* rising usage **and** rising detachment. People want it and it
doesn't fit. That's a roadmap item.

**Undocumented anti-patterns**
Components whose metadata has an empty `antiPatterns` array.
*Cost:* usually means nobody has used it in anger yet, so the record looks complete and
teaches an agent nothing. This is the highest-value gap in an AI-assisted system and the
easiest to miss, because the file passes schema validation.

**Structural drift**
Anatomy that no longer matches the component spec — nested interactive elements, slots
used for something other than their documented purpose.
*Cost:* accessibility failures and unpredictable composition.

---

## Documentation and metadata

**Checksum staleness**
A metadata record whose `sourceChecksum` no longer matches its component source.
*Cost:* the record is describing something that no longer exists. An agent consuming it
will confidently produce the wrong thing — worse than having no record at all.

**Count drift**
Documentation asserting a number the system no longer matches — "43 tokens" when there
are 62.
*Cost:* small on its own, diagnostic in general. It's the cheapest possible proof that
documentation is maintained separately from the system, and the strongest argument for
generating it instead.

**Unreviewed records**
`reviewedBy: unreviewed` on anything a team is consuming.
*Cost:* generated content being treated as authored content.

---

## Accessibility

**Contrast pairs**
Every documented pair, checked in **every mode**. A pair passing in light and failing in
dark is the common case and the one manual review misses.
*Cost:* legal exposure in regulated contexts. Report as blocking, not advisory.

**Colour-only signalling**
Any state distinguished by colour alone.
*Cost:* fails for colour-blind users and anyone in a high-contrast theme.

**Target size**
Interactive targets under 44×44 including padding.

**Focus suppression**
`outline: none` anywhere without a replacement indicator in the same rule.

---

## How to sequence the report

Order findings by **cost to leave alone**, not by count. Twelve orphan tokens are noisy;
one contrast pair failing in dark mode is a legal problem. An audit sorted by frequency
buries the thing that matters under the thing that's common.

Cap the "fix now" list at **three**. A list of forty findings gets filed; a list of three
gets done, and next quarter you produce three more.
