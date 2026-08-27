# Verified: Claude Code for the live demo (researched 2026-08-06, official sources)

## DO FIRST — version drift
- Latest CLI v2.1.223; this machine runs v2.1.205. Run `claude update` before the interview.
- Docs moved to **code.claude.com/docs** (not docs.anthropic.com).

## WILL FAIL IF TYPED LIVE — do not demo these
- `/output-style` — REMOVED (v2.1.91). Use `/config` → Output style.
- `/agents` expecting an editor UI — now just shows a reminder (v2.1.198+).
- `get_code` as a Figma MCP tool — renamed **`get_design_context`**.
- Local Figma endpoint is `http://127.0.0.1:3845/mcp` — **not /sse**.
- Don't assert a Figma tool count ("13 tools" in blogs is wrong; docs and server are out of sync).
- Don't demo a `/design` command — unverified, only in third-party blogs. `/design-sync` is real (React-only).

## VERIFIED SAFE to type live
`claude mcp add --transport http <name> <url>` · `claude mcp list` · `/mcp` · `/plan` ·
Shift+Tab (cycles modes) · **Ctrl+G edits the proposed plan in your editor** (great demo move) ·
`/config` · `/context` · `/doctor` · `/plugin install figma@claude-plugins-official` ·
`@agent-<name>` · `claude --permission-mode plan`

## Figma MCP — current correct setup
```bash
# Recommended: official plugin (MCP + skills together)
claude plugin install figma@claude-plugins-official
# then /mcp → Figma → Authenticate

# Or raw remote server:
claude mcp add --transport http figma https://mcp.figma.com/mcp
# Or desktop server: Dev Mode (Shift+D) → Enable desktop MCP server, then:
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
```
- Plugin ships: `/implement-design`, `/create-design-system-rules`, `/code-connect-components`.
- Desktop server needs a **Dev or Full seat on a paid plan**.
- **Rate limits are per-seat**: View seat = 6 reads/MONTH even on Enterprise. Dev/Full: 200/day (Starter/Pro), 600/day (Org). `whoami` to debug.
- **Context blowup is the #1 live failure**: a full frame returns 100k–350k tokens vs a 25k cap.
  `export MAX_MCP_OUTPUT_TOKENS=50000` AND use `get_metadata` first, then fetch child nodes only.
- Key tools: `get_design_context` (primary), `get_metadata`, `get_variable_defs` (pair it — token
  mapping fails silently otherwise), `get_screenshot`, `get_code_connect_map`.
- Figma's own skill says the returned React+Tailwind is a REFERENCE, not final code. Hint priority:
  Code Connect > doc links > annotations > tokens > raw hex.
- Asset URLs expire ~7 days.

## Code Connect — format changed (good interview talking point)
- Legacy: parser-based `Button.figma.tsx` with `figma.connect()`.
- Current: **parserless template** `Button.figma.ts` with `figma.code\`...\`` — Figma's skill
  MANDATES template format and rejects .figma.tsx. Models working from memory produce the old one.
- Requires **Organization or Enterprise plan**.
- CLI: `npx figma connect create <node-url>` / `parse` / `preview` / `publish --label "React"` / `migrate`.

## Skills (SKILL.md) — current facts
- Commands and skills merged: `.claude/skills/<name>/SKILL.md` creates `/name`.
- Live in `~/.claude/skills/` (personal), `.claude/skills/` (project), plugins (namespaced).
- Frontmatter worth using: `description` (how Claude decides to load it — third person, says what
  AND when), `when_to_use`, `paths:` (globs gate auto-activation), `disable-model-invocation`,
  `allowed-tools` (grant lasts ONE turn only), `context: fork` + `agent:`.
- `!`cmd`` in the body runs at load time and injects output (e.g. live token list).
- `${CLAUDE_SKILL_DIR}` works in body AND allowed-tools → bundled scripts run without prompts.
- Progressive disclosure: description preloaded → body on invoke → references/ on read.
  Keep references ONE level deep; >100-line refs get a TOC.
- Portability gotcha: only `name/description/license/compatibility/metadata/allowed-tools` are
  portable to claude.ai — other fields HARD-ERROR on upload.
- Skill content persists in context all session; the tool grant does not.

## Subagents — current facts
- `.claude/agents/*.md`, only `name`+`description` required; `model:` defaults to inherit.
- Invoke guaranteed with `@agent-name`. `skills:` frontmatter preloads full skill content.
- **Background by default since v2.1.198, and background subagents get a narrowed toolset —
  tools outside it are stripped silently even if listed.** Set `background: false` if it matters.

## Hooks — the enforcement layer (talking point: CLAUDE.md is a request, a hook is a guarantee)
- `PreToolUse` exit 2 BLOCKS the call; `PostToolUse` runs after (can't block, Claude sees stderr).
- Conditional `if: "Edit(tokens/**)"` → e.g. run token build after any token edit.
- Handler types now include `prompt` (LLM check: "does this diff add a raw hex? YES/NO").
- Matcher: plain chars = literal/alternation; any regex char makes it a full regex.
- Hooks MERGE across sources (unlike skills/agents which override).

## CLAUDE.md — current facts
- Concatenated root→cwd, not overridden. Keep under ~200 lines. `@file` imports (4 hops).
- `.claude/rules/` = path-scoped rule files with `paths:` frontmatter — right home for DS rules.
- Delivered as a user message, NOT system prompt — context, not guarantee (hence hooks).
- After /compact only root CLAUDE.md is re-injected — nested rules reload on next file touch.
- `/context` shows what actually loaded.

## Decision table (Anthropic's own — quotable in the interview)
wrong convention twice → CLAUDE.md · same prompt repeatedly → skill · same playbook pasted → skill ·
browser copy-paste → MCP · side task floods context → subagent · must happen EVERY time → hook ·
second repo needs it → plugin

## Claude Design + /design-sync (newest, likely unknown to interviewer)
- Claude Design (Anthropic Labs, Apr 17 2026, research preview): builds a design system for your
  team by reading your codebase + design files; every project then uses your tokens/components.
- `/design-sync` bridges a React DS repo ↔ Claude Design: converts, uploads, validates generated
  UI against your tokens, round-trips edits. **React-only** currently.
- Browser pane (Desktop): auto-verify after every edit, `.claude/launch.json` defines dev servers.
  Committed to repo — no secrets in env.

## 12-month timeline (for "what's new" credibility)
Skills+plugins (Oct 25) · browser preview (Feb 26) · auto mode + if-hooks (Mar 26) · computer use
(Apr 26) · Claude Design (Apr 17) · /design-sync (Jun 18) · Sonnet 5 default + background subagents
(Jun 30) · in-app browser + /doctor (Jul 6) · /fork (Jul 13) · Opus 5 default, 1M context (Jul 24).

## Pre-demo checklist
claude update → /doctor → `claude mcp list` shows ✔ → export MAX_MCP_OUTPUT_TOKENS=50000 →
confirm Figma SEAT type (not plan) → pre-install the figma plugin so nothing downloads live.
