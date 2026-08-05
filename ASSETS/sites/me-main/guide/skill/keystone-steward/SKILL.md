---
name: keystone-steward
description: Operate and maintain a design system — audit its health, triage contribution requests, deprecate safely, cut releases, and measure adoption. Use when asked to review a design system's health, decide whether something warrants a new component, retire a token or component, prepare release notes, or report on adoption and drift. This is the operations layer; keystone-ds produces the rules and keystone-composer consumes them.
---

# Keystone Steward

Most design system skills help you *build*. This one helps you **run** the thing after it
exists — which is where systems actually fail. A system rarely dies from bad components.
It dies from drift nobody measured, contributions nobody triaged, and names nobody retired.

Three skills, three jobs:

| | |
|---|---|
| `keystone-ds` | **Produces** — the rules, and the component metadata |
| `keystone-composer` | **Consumes** — selects from the inventory instead of generating past it |
| `keystone-steward` | **Operates** — audits, triages, deprecates, releases, measures |

## The five operations

### 1 · Audit

Report the health of a system as **numbers with names attached**, never as a grade.
"The system is in decent shape" is not a finding. "Fourteen components have no
anti-patterns documented, which usually means nobody has used them in anger yet" is.

Run every check in `references/audit-checks.md`. For each finding report **what**, **where**,
**how many**, and **what it costs** — the last one is what turns an audit into a decision.

Never report a total without a denominator. "23 detached instances" is meaningless; "23 of
412 instances, concentrated in two teams" is a plan.

### 2 · Triage

When someone asks for a new component, the default answer is **no**, and the job is to find
out whether this is the exception. Work the ladder in order and stop at the first that fits:

1. **An existing component already does this** — the requester didn't find it. That's a
   discoverability bug, not a component gap. Fix the metadata or the naming.
2. **An existing component does this with a prop** you haven't documented. Document it.
3. **Composition** of two existing components covers it. Show the composition.
4. **An existing component needs one new variant.** Extend rather than create.
5. **Genuinely new.** Only now. And say what it will cost to maintain.

Ask the requester for **three real usages** before creating anything. One usage is a
one-off; three is a pattern. If they can only name one, build it in their product and
revisit when the second appears.

Record the decision either way. A "no" with a reason is a contribution; a "no" with silence
is how people stop asking and start forking.

### 3 · Deprecate

Everyone builds a contribution path. Almost nobody builds the exit — which is why mature
systems accumulate generations of names that all still resolve.

Deprecation is a **sequence, not an announcement**:

1. Mark it. `$deprecated: true` and `$replacedBy` pointing at the successor. It keeps working.
2. Report it. The audit now counts consumers of the deprecated thing, by team.
3. Warn at build time — a console warning, not an error. Still working.
4. Migrate. Provide a codemod or a mapping table. Do not ask teams to hand-edit.
5. Remove — at the next **major** only, and only when the consumer count is zero or the
   remaining consumers have been told individually.

Never deprecate without a named replacement or an explicit "this pattern is going away and
here is what to do instead." "Deprecated" with no destination is just breakage on a delay.

### 4 · Release

Semantic versioning against the **consumer's** experience, not yours:

- **Major** — a consumer must change code. Removed token, renamed component, changed default.
- **Minor** — new capability, nothing breaks. New component, new variant, new token.
- **Patch** — a fix that doesn't change the API. A contrast correction, a missing state.

A visual change that alters no API is still a **minor** if it changes what ships to users.
Silently repainting production in a patch is how a design system loses trust with engineering.

Release notes are written for the person deciding whether to upgrade: what changed, what
breaks, what to do about it. Lead with breaking changes. Never bury a removal.

### 5 · Measure

Four numbers, and the fourth is the one people skip:

- **Coverage** — share of production UI built from the system. Depth.
- **Usage** — which components get reached for, how often. Breadth.
- **Detachment** — how often instances get detached or overridden.
- **Staleness** — documentation and metadata that no longer match the source.

Interpretation rules, because raw numbers mislead:

- **High detachment is not automatically bad.** On a component built to be customised it
  may mean it's working. On a button it means your button is wrong. Always segment by
  component before drawing a conclusion.
- **A single adoption percentage is theatre.** 80% doesn't say which teams, or why the
  other 20% aren't. Report by team or don't report it.
- **Rising usage with rising detachment** is the most important signal in the set: people
  want the component and it doesn't fit. That's a roadmap item, not a compliance problem.

## The health report

```
SYSTEM HEALTH — <name> <version>            <date>

Coverage        <n>% of surfaces        (<covered>/<total>)
Detachment      <n>%                    (<detached>/<instances>)
Token adherence <n>%                    (<raw values found>)
Doc staleness   <n> records stale       (<checksum mismatches>)

TOP THREE THINGS TO FIX
1. <finding> — <cost if unaddressed> — <effort>
2. …
3. …

DEPRECATION QUEUE
<item> — <consumers remaining> — <target release>

NOT A PROBLEM
<things that look bad in the numbers but aren't, and why>
```

That last section is required. An audit that only reports problems trains people to
distrust audits. Saying "eight names resolve to white and that's the semantic layer doing
its job" is what makes the real findings credible.

## Judgment this skill must apply

- **Prefer the smaller intervention.** Renaming is cheaper than restructuring. Documenting
  is cheaper than building. Deleting is cheapest of all and almost never considered.
- **Every finding needs a cost.** If you can't say what it costs to leave alone, it isn't
  a finding — it's a preference.
- **Segment before concluding.** A system-wide number hides the two teams causing it.
- **Name what's working.** Systems are social; an audit that only takes is one nobody
  invites back.
- **Flag when the system is the problem.** If three teams all built the same shadow
  component, the system failed them — say that plainly rather than reporting three
  violations.

## Never

- Never auto-remove or auto-migrate. Propose; a human decides.
- Never report a metric without its denominator and its segments.
- Never mark something deprecated without a replacement or an explicit end-state.
- Never let a visual change ship as a patch.
- Never treat a low number as a verdict on a team. It's usually a verdict on the system.

## Reference files

- `references/audit-checks.md` — the full check list, what each costs, and how to segment it.
