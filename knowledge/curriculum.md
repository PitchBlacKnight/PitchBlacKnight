# Curriculum — Getting Un-Rusty
Mikel Rosenthal · started 2026-07-28 · 15 min/weekday

Two tracks, interleaved. **Track B runs first** (weeks 1–4) because it's the newest material, the biggest differentiator, and it upgrades a claim already on the resume. **Track A** (weeks 5–8) hardens what the resume already asserts.

The rule for every unit: **you end by having done something, not by having read something.** If a unit produces no artifact — a file, a mapping, a screenshot, a note in your own words — it doesn't count as complete.

---

## Confidence scale

Used in `state/claims.json`. Be honest; the whole system depends on it.

| | |
|---|---|
| **0** | Never heard of it / couldn't define it |
| **1** | Read about it, couldn't do it |
| **2** | Followed a tutorial, couldn't repeat it unaided |
| **3** | Did it with help or reference |
| **4** | Did it cold, unaided |
| **5** | Could teach it, and defend the tradeoffs in an interview |

**Anything on the resume should be a 4 or 5.** A claim sitting at 2 is an interview risk. That gap is what the dashboard's coverage map exists to show you.

---

# TRACK B — Get Current (Weeks 1–4)

## Week 1 — Figma MCP: what it actually is

Goal by Friday: you can explain, unprompted, what the Dev Mode MCP server gives an AI agent that a screenshot or a paste-in cannot.

| Day | Unit | Drill (produces an artifact) |
|---|---|---|
| 1 | What MCP is, minus the hype. Protocol vs. plugin vs. API. | Write 5 sentences in your own words: what a *server*, a *tool*, and a *client* are. No jargon you can't unpack. |
| 2 | The Dev Mode MCP server: what it exposes | Point Claude Code at one of your real Figma files. Run `get_metadata`, then `get_design_context`. Save both outputs to `notes/`. |
| 3 | Variables over the wire | Run `get_variable_defs` on a file with real tokens. Diff what comes back against what you *thought* was in there. |
| 4 | Why this matters for design systems | One paragraph: what an agent gets wrong without MCP, that it gets right with it. Use your own Verizon or Avant experience as the example. |
| 5 | **Weekly proof** | Explain the whole thing to a rubber duck in 90 seconds, out loud, no notes. If you stall, you're at a 3, not a 4. |

## Week 2 — Code Connect: the piece almost nobody has done

You already claim Code Connect on the resume (Verizon). This week takes it from *claimed* to *demoable*.

| Day | Unit | Drill |
|---|---|---|
| 1 | What Code Connect solves | Describe the failure mode it prevents: agent invents `<Btn>` when your repo has `<Button intent>`. |
| 2 | Reading an existing map | `get_code_connect_map` against a real file. What's mapped, what isn't. |
| 3 | Writing a mapping | Map one component end to end. Any component. Ship it. |
| 4 | Mapping at scale | How would you map 60 components without doing 60 by hand? Write the approach down. |
| 5 | **Weekly proof** | Interview answer, out loud: *"Tell me how you'd wire a design system to an AI coding agent."* 2 minutes. |

## Week 3 — Claude Code + Figma MCP as a working loop

| Day | Unit | Drill |
|---|---|---|
| 1 | Design → code, honestly | Generate a component from a real frame. Log every place it got it wrong. |
| 2 | Code → design | Push something back into Figma. Note what survived and what didn't. |
| 3 | Where the loop breaks | List the 3 failure modes you actually hit. These are your interview stories. |
| 4 | Governance implications | If agents can write components, what does contribution review become? One paragraph, your opinion. |
| 5 | **Weekly proof** | Write the "AI-augmented contribution pattern" your resume already claims. Make it real and specific. |

## Week 4 — Figma Make, assessed not hyped

| Day | Unit | Drill |
|---|---|---|
| 1 | What Figma Make is and isn't | Generate one screen from a prompt. |
| 2 | Make vs. your token system | Regenerate constrained to your tokens. Where does it drift? |
| 3 | The honest limits | Prototype vs. production; the credit model; the ~70–80% structural match. Note where it costs more than it saves. |
| 4 | Where it fits a real practice | One paragraph: when you'd reach for it, when you'd refuse. |
| 5 | **Weekly proof** | Interview answer: *"What's your take on Figma Make?"* Have a real position, not a shrug. |

---

# TRACK A — Defend the Claim (Weeks 5–8)

Each of these maps to a specific line on your resume. Week-level themes; the daily agent expands them day by day and pulls in whatever changed that week.

- **Week 5 — Tokens.** Primitive → semantic → component. Naming that survives a rebrand. *Claims: Verizon, Avant, BCBS, TransUnion.*
- **Week 6 — Variables, theming, platform variance.** Modes, scoping, cross-platform parity. The date-picker family problem from Verizon. *Claim: Verizon.*
- **Week 7 — Accessibility in regulated contexts.** WCAG 2.2 AA cold, the European Accessibility Act, what "regulated" changed at GE Healthcare. *Claims: GE Healthcare, BCBS.*
- **Week 8 — Governance, contribution, adoption.** Federated models, versioning, deprecation, detach rate as a health signal. *Claims: Avant, Verizon.*

---

## Daily unit structure (15 minutes)

1. **Brief — 3 min.** What changed since yesterday, and today's one idea.
2. **Drill — 9 min.** The hands-on task. Produces an artifact.
3. **Recall — 3 min.** Two items surfaced from the spaced-repetition queue.

## Spaced repetition

Every completed unit becomes a recall item. Intervals: **1 → 3 → 7 → 16 → 35 days.** Answer confidently, it advances. Stall, it resets to 1 day. Ratings live in `state/queue.json` and the daily agent schedules them.

## Sources the daily agent watches

- Figma release notes and the Figma blog (design systems / AI / Dev Mode)
- Figma Dev Mode MCP server documentation changes
- Claude Code changelog and docs
- Model Context Protocol spec releases
- W3C WCAG and European Accessibility Act updates

## Rules

- **Miss a day, don't backfill.** The queue reschedules itself. Backfilling turns a habit into a debt.
- **Confidence is self-reported and honest.** A dashboard full of 5s you can't defend is worse than useless.
- **Every claim on the resume must reach 4.** That's the finish line, not "completed the curriculum."
