# Responding to Stephen — the plan

## The one rule that shapes everything

**Do not send Stephen the `/guide` link.** It is a prep kit *about* him. It contains
"Say this. Then stop talking.", "Questions for Stephen — pick four, ask two early",
a page called "Stephen brief", and voice-coaching talk tracks. If he opens it, the
read is that he was being managed. Whatever goes to him is a separate, clean artifact.

## Format

**The email carries the answer. One link carries the proof.**

The email must be complete on its own — Stephen is a recruiter, and the likeliest thing
he does is forward it to the State Farm hiring manager. It has to survive being read
with nothing clicked. The link is for the person who wants to verify the claims.

Not a slide deck. He wrote prose and asked for examples; prose answers prose.

---

## Phase 0 — today

Send `stephen-reply-short.md`. Buys the time, and his answer to "which areas are
time-sensitive" tells you where to spend effort.

## Phase 1 — fix the proof before it gets shown

The running code is the differentiator, so it has to actually run.

1. **`pathfinder/build/metadata.mjs --check` crashes.** It still looks for
   `components/ks-button.js`, renamed to `pf-button.js`. This is the provenance gate —
   the literal answer to his "Documentation as a Source of Truth" question. It also
   **exits 0 on the crash**, so as a CI gate it silently passes while doing nothing.
   Fixing the exit code is part of the story: a gate that fails open isn't a gate.
2. **The three skill files still say "keystone."** Naming drift from the Pathfinder
   rename — in the artifact whose selling point is that it prevents naming drift.
3. **Decide on the 7 severity=fail audit findings**, including a real contrast failure
   (3.28:1 where 4.5:1 is required). Either fix them, or keep them and let the audit
   output be the demo. Recommend: fix the contrast, keep the rest as evidence the
   audit works.

## Phase 2 — the public artifact

New page, separate from the prep kit, mirroring his eight headings. Each section:
environment → what I owned → the decision → what changed. Every claim linked to the
thing that proves it:

| His ask | The proof that already exists |
|---|---|
| Tokens + architecture | 5 token files, 3 tiers, `figma-source.json` → `figma-extract.js` pipeline |
| Web components | `pf-button.js`, `pf-input.js` — shadow DOM, custom-property theming |
| Advanced Figma | The DTCG exporter plugin (alias preservation), Dev Mode annotations |
| Tool-agnostic | The build: one neutral source → CSS, Swift, docs, skill file |
| Documentation | `metadata.mjs` provenance hashes + the 43-vs-62 confession |
| Design-to-code | Code Connect at Verizon; MCP-over-plugins reasoning |
| AI | 3 skill files, the audit scripts, "10x mechanical / 0x decisions" |
| Point of view | The machine-readable-contract thesis; duplication as the real failure mode |

`stephen.html` already exists locally with all eight sections outlined — it is the
starting draft, but it is **not deployed** and it is written as prep, not as a
deliverable. It needs a rewrite in outward voice before anyone sees it.

## Phase 3 — send

Full email + the one link. Lead with whichever areas he flags in reply to Phase 0.

---

## Open decisions for Mikel

1. **How much does Stephen see of the running code?** A link to a page describing it,
   or an actual repo he can clone? Repo is stronger and riskier.
2. **Keep the 7 audit failures visible or fix them first?**
3. **Does the Figma file get shared?** It has the honest findings in it — that is the
   strongest material and the most exposed.
