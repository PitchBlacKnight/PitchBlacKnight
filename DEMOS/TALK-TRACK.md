# Process talk track — brief to handoff

Spoken version of https://pbk-demos.vercel.app/process. Not deployed
(excluded in .vercelignore). One breath per beat, contractions and all.
The receipts column tells you what to pull up if they lean in.

---

## The 60-second version (lead with this)

"When a brief lands, the first thing I do is feed the machine everything.
The brief, the old research, the analytics, the emails nobody rereads. The
AI reads all of it in minutes and builds me a synthesis, and my job on day
one is to find the hole, the thing the documents assume but never say,
because absences don't pattern-match and a model won't catch them.

From there it's a rhythm. I rank the assumptions by risk and write the
decision rules before the research runs. I get the team in a room once,
early, and we leave with one metric and one page of truth. The AI drafts
the documents from my decisions and keeps every ID and cross-reference
aligned so the definition never contradicts itself. Then we build the real
thing fast, because a prototype beats an opinion, and I spend my hours on
the part no model has: the scope cuts and the taste.

And handoff isn't a file dump. The docs are generated from the same source
as the artifact so they can't drift, the tokens ship in formats a pipeline
eats, and there's a skill file so even their AI tooling inherits the rules.
The test of my handoff is whether they still need me in the room. They
shouldn't."

---

## Stage by stage (the long walk)

### 01 · Intake
"Day one is ingestion, not sketching. Everything goes in the room:
documents, research, tickets, the stakeholder emails. The AI does the
archaeology that used to eat my first week, and I read the brief twice
and hunt for what's missing. On PetWatch that was a product with no
completion state. The stories were internally consistent, nothing flagged
it, and that's exactly why it's still a designer's job to find it."
- Receipt: petwatch-exercise.vercel.app

### 02 · Research
"I don't research everything, I research what would collapse the product
if I'm wrong about it. And I write the decision rule before the study
runs, so I can't rationalize afterwards. Four of six watchers react fine,
we build the active version. Three or more hate it, we ship passive. The
AI does the desk research, drafts the guides, and synthesizes transcripts
the same afternoon. I do the interviews myself. You don't delegate
listening."
- Receipt: the validation plan, decision rules included

### 03 · Alignment
"Ninety minutes, everyone in the room, before anything is designed. First
exercise: everyone writes the problem in one sentence, silently, then we
read them out loud. They always disagree. Cheaper to find that out in a
room than in cycle four. We leave with one metric, a v1 cut line, and one
page that becomes the source of truth. If a decision isn't on that page,
it didn't happen. The AI doesn't attend, it just makes the meeting cheap
to prep and impossible to lose."
- Receipt: ways-of-working, the week-zero agenda

### 04 · Definition
"I outline and dictate the decisions, the AI writes the first prose draft,
and I rewrite until it's mine. The part I'm proudest of in any PRD is the
Not-Building table. Models are additive by nature, they always want to add,
so deciding what not to build is where the design actually happens. And the
AI quietly does the thing humans are worst at: it keeps every ID, ticket
number, and cross-reference aligned across five documents, forever."
- Receipt: PetWatch product definition, flows and screen inventory

### 05 · The artifact
"This is the stage AI changed most. A working prototype used to be a
luxury you got at the end. Now it exists in days, and it's the thing that
resolves arguments. I make the interaction decisions, the state model, the
undo mechanics. The AI builds the front end at production speed. And then
taste does the part no model can. On PetWatch the first pass at overdue
styling was red and urgent, confidently produced, standard pattern. Wrong
product. It shouts at a volunteer doing you a favor. The amber treatment
is the correction, and the reasoning lives as a note on the prototype."
- Receipt: the prototype, Pathfinder 2.0, the live stage

### 06 · Pressure-test
"Edge cases are the one place the model is genuinely better than me, not
just faster. The invite link opened in the wrong account is what a tired
human misses at 4pm and QA finds in week six. So I generate that list
early and curate it by hand, which moves QA thinking into the design
phase. Then acceptance criteria get written with QA before the build, and
mid-cycle we review staging, not mockups. The gap between what was
intended and what exists is where products quietly get worse."
- Receipt: the edge-case sweep in the exercise

### 07 · Handoff
"Handoff is a package, not a goodbye deck. The decision log says what we
chose, what we rejected, and what would reopen each call. The docs are
generated from the same source as the components so they physically can't
drift. Tokens ship as standard DTCG that Style Dictionary eats. Component
metadata carries a checksum, so if someone edits a component the build
reports the docs stale and exits non-zero. And there's a skill file, so
the team's own AI tooling inherits the system's rules on day one.
Engineering gets a system, not a folder of pictures."
- Receipt: generated docs, the Figma plugin, the skill files

---

## The closer (always land here)

"One honest thing, because a process that only lists successes is
marketing: the AI is sometimes confidently wrong, and it matters. It
produces the standard pattern with total confidence when this product
needed a different one. The workflow works because a designer is standing
exactly where the judgment goes. That's the job now. I think it's a
better job than the one it replaced."

## If they push back

- "Doesn't AI make designers lazy?" → "It makes lazy designers faster and
  rigorous designers more rigorous. The edge-case sweep moved QA thinking
  earlier. That's more rigor, not less."
- "How do we know what's yours?" → "I keep an AI-usage log on every
  project, with the failures in it. It's on the demo index. Ask me about
  the red overdue styling."
- "What if the team doesn't use AI?" → "Nothing in the package requires
  it. Generated docs, standard tokens, a decision log. The skill file is
  a bonus for whenever they're ready, not a dependency."
