Subject: Re: Follow-up — the eight areas

Stephen,

Likewise — thanks for the clear direction. I've kept each of these to the shape you asked for: the environment, what I personally owned, the decisions, and what changed. Several of them are easier shown than told, so I'm glad to walk through any of this on a screen.

**Design Tokens + Architecture**

My architecture is three tiers with strictly one-way references — primitives are private, semantics are the public API and the only layer that themes, and component tokens exist only where a component genuinely breaks from the rest. The best proof it holds: at Avant I owned Pathfinder's token architecture end to end for three years, and it carried the product from 2.0 to 3.0 without a redesign. At GE Healthcare, Edison ran four theme targets — light and dark, across desktop and touch — off one semantic layer, and the components never forked.

On connecting Figma to production: I wrote a plugin that exports Figma variable collections as DTCG token JSON — the format that went stable in 2025, so tokens can leave Figma and feed a build. The challenge worth mentioning is aliases. If you flatten the semantic layer into resolved values you get a file that's technically valid and architecturally dead — preserving the reference chains was most of the work. (Figma also has a single FLOAT type where the spec distinguishes dimension from number; I solved that upstream, in the naming convention.)

**Web Components + Design System Engineering**

My most recent build is a set of custom elements with shadow DOM, styled entirely through CSS custom properties — deliberately, because custom properties are the one styling channel that inherits through the shadow boundary, which lets the token layer theme everything without breaking encapsulation. The same token source emits the CSS, an iOS file, and the documentation.

On partnering with engineers, my favorite example is being overruled. At Avant, the engineers rejected my first semantic token set because the names read like design words instead of API names — and they were right. A semantic token is an interface, and interfaces get named by the people who call them; tokens have been named with engineers in the room ever since. The governance lesson I learned the honest way: I audited my own long-running system and found three generations of naming conventions, all still resolving. I had built how things enter the system and never how they leave. A deprecation path is now part of my initial architecture, not a cleanup project.

**Advanced Figma / Design System Expertise**

The deeper work is writing against the file rather than in it: the Plugin API (the DTCG exporter above), programmatic Dev Mode annotations, and Code Connect. Variables are set up as multi-collection alias chains mirroring the token tiers, with modes switching at the semantic layer only. For components: variants carry state, properties carry content and configuration, slots via instance swap — and a hard rule that a variant changes appearance, never structure.

On what should become part of the system: the default answer to a new component is no. Then I work down a ladder and stop at the first rung that fits — does something existing already do this (that's a discoverability bug, not a gap); is it an undocumented prop; can two components compose into it; does one need a new variant; and only then is it genuinely new.

**Tool-Agnostic Design Systems**

This is the part of your description I most wanted to see. My position: tokens live in a neutral DTCG-format file in Git, and a build carries them to every consumer — CSS, iOS, the documentation, and the Figma variables themselves. Figma becomes a consumer instead of the origin, and any tool in the chain can be replaced without touching the contract.

The operational part people get wrong is the migration order: you take nothing away. First an exporter pulls the existing variables into the neutral file; then the neutral source starts generating the Figma variables back. A designer's day doesn't change — the origin does, and drift stops being possible instead of being policed. Being honest about the edge: the spec finally answered modes last October — the Resolver module in DTCG 2025.10 — but it's only half-shipped. Style Dictionary hasn't implemented resolvers yet, and the spec standardizes how contexts compose, not what you emit at runtime. So authoring is settled; the pipeline is not, and I'd rather name that than pretend it's done.

**Documentation as a Source of Truth**

I'll answer this one with a confession. I went back through my own system and the documentation said 43 tokens while the collection had 62. Nobody had noticed — including me, and I owned it. The fix wasn't better discipline; it was removing the possibility. Documentation is now generated from the same token source as the code, every generated artifact carries a hash of the source it was built from, and a staleness check fails CI when they diverge. Docs stopped being a description of the system and became an output of it. Descriptions drift; outputs can't.

**Design-to-Code**

Design-to-code has two halves, and people only ever do the fun one. Generating code from a design is the fun half. The unglamorous half is mapping every component to the real one in the repo — that's what makes anyone trust the output, and it's the half that gets skipped. At Verizon I wired up Code Connect so an engineer opening a component in Dev Mode sees our actual production code, not a generated guess at it. Specs go out with states enumerated and theming hooks in place, so implementation isn't a re-draw.

I did evaluate the export-plugin route — Anima, Locofy, Builder — and it's the wrong shape for systems work: they export a finished frame, so you get a one-off. I use the Figma MCP server inside Claude Code instead, because it reads the live file — real variable names and real values, not hexes inferred from a screenshot.

**AI + Design Systems**

Everything here is implemented, not theoretical — Claude Code is my daily working environment. The pieces that matter: skill files that act as an output contract, so the tokens, required states, and the accessibility floor travel with every generation; plus a rule that every generated value is annotated with the token it came from, so output is auditable instead of trusted. Documentation generation with the staleness gate above. Audit scripts for drift, variant coverage, and contrast written as token-pair ratios a script can verify.

The honest numbers: on mechanical work — audits, coverage, documentation, drift — it's easily 10x. On the decisions it's zero, and I wouldn't want it otherwise. And generated code is a draft PR: same review bar as anything a person wrote. The risk isn't bad output — it's plausible output nobody checked.

**Where I See This Going**

The system becomes a machine-readable contract. For fifteen years design systems were documentation for humans; now every artifact — the tokens, the component inventory, the accessibility rules — has a second consumer that will do exactly what the system says. If the rules are prose, AI can't follow them; if they're structured, it can't ignore them. That doesn't remove the judgment — it moves it upstream. The design decisions happen once, in the system, instead of once per component.

If I were modernizing a large system today, in order: audit first, so drift is a number instead of a feeling. Move tokens to a neutral source that generates every platform, Figma included. Map components to the repo before generating anything. Encode the rules and the inventory as machine-readable files — the inventory is what stops a model from generating a fourth button next to your three. And govern the exits: a real deprecation path, and adoption measured by team rather than a single percentage. At enterprise scale the failure mode of AI isn't malformed output — it's duplication. The system's job is to make generating a duplicate harder than finding the original.

Questions welcome on any of this. The exporter, the token build, and the skill files all exist as running code, so if a live walkthrough is useful, I'm happy to set that up.

Thanks again,
Mikel
