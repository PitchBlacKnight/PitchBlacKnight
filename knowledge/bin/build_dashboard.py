#!/usr/bin/env python3
"""
Regenerates knowledge/dashboard.html from the knowledge base.
Stdlib only — no install step, no dependencies to rot.

    python3 knowledge/bin/build_dashboard.py
"""

import json, re, html, datetime, pathlib, sys

ROOT   = pathlib.Path(__file__).resolve().parent.parent
STATE  = ROOT / "state"
DAILY  = ROOT / "daily"
OUT    = ROOT / "dashboard.html"

TARGET = 4  # every resume claim must reach this


# ─────────────────────────────── loading ───────────────────────────────

def load_json(name, fallback):
    p = STATE / name
    if not p.exists():
        return fallback
    try:
        return json.loads(p.read_text())
    except json.JSONDecodeError as e:
        print(f"  !! {name} is not valid JSON ({e}) — using fallback", file=sys.stderr)
        return fallback


def parse_frontmatter(text):
    """Minimal YAML subset: `key: value` and `key: [a, b]`."""
    meta, body = {}, text
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if m:
        body = m.group(2)
        for line in m.group(1).splitlines():
            if ":" not in line:
                continue
            k, v = line.split(":", 1)
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                inner = v[1:-1].strip()
                v = [x.strip() for x in inner.split(",") if x.strip()] if inner else []
            meta[k.strip()] = v
    return meta, body


def latest_daily():
    files = sorted(DAILY.glob("*.md"))
    if not files:
        return None, {}, ""
    f = files[-1]
    meta, body = parse_frontmatter(f.read_text())
    return f, meta, body


# ──────────────────────────── markdown-lite ────────────────────────────

def inline(s):
    s = html.escape(s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", s)
    s = re.sub(r"_([^_\n]+)_", r"<em>\1</em>", s)
    return s


def md(text):
    """Handles the subset the daily notes actually use."""
    out, lines, i = [], text.split("\n"), 0
    list_open = None  # 'ul' | 'ol' | None

    def close_list():
        nonlocal list_open
        if list_open:
            out.append(f"</{list_open}>")
            list_open = None

    while i < len(lines):
        ln = lines[i].rstrip()

        if not ln.strip():
            close_list(); i += 1; continue

        h = re.match(r"^(#{1,4})\s+(.*)$", ln)
        if h:
            close_list()
            lvl = len(h.group(1))
            out.append(f"<h{lvl+1}>{inline(h.group(2))}</h{lvl+1}>")
            i += 1; continue

        ol = re.match(r"^\s*(\d+)\.\s+(.*)$", ln)
        if ol:
            if list_open != "ol":
                close_list(); out.append("<ol>"); list_open = "ol"
            out.append(f"<li>{inline(ol.group(2))}</li>")
            i += 1; continue

        ul = re.match(r"^\s*[-*]\s+(.*)$", ln)
        if ul:
            if list_open != "ul":
                close_list(); out.append("<ul>"); list_open = "ul"
            out.append(f"<li>{inline(ul.group(1))}</li>")
            i += 1; continue

        close_list()
        para = [ln]
        while i + 1 < len(lines) and lines[i+1].strip() and not re.match(r"^\s*([-*]|\d+\.|#{1,4})\s", lines[i+1]):
            i += 1; para.append(lines[i].rstrip())
        out.append(f"<p>{inline(' '.join(para))}</p>")
        i += 1

    close_list()
    return "\n".join(out)


def section(body, name):
    """Pull one '## Name' section out of a daily note."""
    m = re.search(rf"^##\s+{re.escape(name)}[^\n]*\n(.*?)(?=^##\s|\Z)", body, re.S | re.M)
    return m.group(1).strip() if m else ""


# ───────────────────────────── components ──────────────────────────────

def claim_row(c):
    conf   = c.get("confidence", 0) or 0
    target = TARGET if c.get("onResume") else 3
    gap    = conf < target
    pips = "".join(
        f'<i class="pip{" on" if n <= conf else ""}{" tgt" if n == target and conf < target else ""}"></i>'
        for n in range(1, 6)
    )
    badge = '<span class="badge res">ON RESUME</span>' if c.get("onResume") else ""
    return f"""
      <li class="claim{' gap' if gap else ''}">
        <div class="c-main">
          <div class="c-label">{html.escape(c.get('label',''))} {badge}</div>
          <div class="c-src">{html.escape(c.get('source',''))}</div>
        </div>
        <div class="c-pips" title="confidence {conf} of 5 · target {target}">{pips}</div>
      </li>"""


def build():
    claims_doc = load_json("claims.json", {"claims": []})
    progress   = load_json("progress.json", {})
    queue      = load_json("queue.json", {"items": []})
    _, meta, body = latest_daily()

    claims  = claims_doc.get("claims", [])
    on_res  = [c for c in claims if c.get("onResume")]
    gaps    = [c for c in on_res if (c.get("confidence") or 0) < TARGET]
    current = [c for c in claims if c.get("track") == "current"]
    defend  = [c for c in claims if c.get("track") == "defend"]

    ready = len(on_res) - len(gaps)
    pct   = round(ready / len(on_res) * 100) if on_res else 0

    today = datetime.date.today()
    due = [q for q in queue.get("items", []) if q.get("due", "9999") <= str(today)]

    brief  = md(section(body, "Brief"))  or "<p>No brief yet — the daily agent writes this each morning.</p>"
    drill  = md(section(body, "Drill"))  or "<p>No drill yet.</p>"
    recall = md(section(body, "Recall")) or "<p>Nothing due.</p>"

    title = meta.get("title", "—")
    wk, dy = meta.get("week", "?"), meta.get("day", "?")

    return f"""<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Knowledge — Daily</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=Space+Grotesk:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root{{--ink:#0F0C0A;--ink2:#171210;--ink3:#1F1815;--cream:#F1E8D6;--c70:rgba(241,232,214,.72);
--c45:rgba(241,232,214,.45);--c25:rgba(241,232,214,.25);--line:rgba(241,232,214,.13);
--coral:#EF7A5E;--slate:#8FA8A6;
--serif:"Fraunces","Iowan Old Style","Palatino Linotype",Georgia,serif;
--sans:"Space Grotesk","Avenir Next","Helvetica Neue",Helvetica,Arial,sans-serif}}
*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
body{{background:var(--ink);color:var(--c70);font-family:var(--sans);font-weight:300;
font-size:16px;line-height:1.65;-webkit-font-smoothing:antialiased;padding:0 0 80px}}
.wrap{{max-width:940px;margin:0 auto;padding:0 28px}}
code{{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.87em;
background:var(--ink3);padding:2px 6px;border-radius:3px;color:var(--cream)}}
strong{{color:var(--cream);font-weight:500}} em{{color:var(--cream);font-style:italic}}
a{{color:var(--coral)}}

header{{border-bottom:1px solid var(--line);padding:44px 0 26px;margin-bottom:34px}}
.kicker{{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--coral);margin-bottom:14px}}
h1{{font-family:var(--serif);font-weight:300;font-size:clamp(30px,5vw,50px);line-height:1.04;
color:var(--cream);letter-spacing:-.02em;margin-bottom:8px}}
h1 em{{font-style:italic;color:var(--coral)}}
.sub{{font-size:14px;color:var(--c45);letter-spacing:.02em}}

.metrics{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;
background:var(--line);border:1px solid var(--line);border-radius:6px;overflow:hidden;margin:26px 0 0}}
.metric{{background:var(--ink2);padding:18px 20px}}
.metric .n{{font-family:var(--serif);font-weight:300;font-size:34px;line-height:1;color:var(--cream);
font-variant-numeric:tabular-nums}}
.metric .n em{{font-style:italic;color:var(--coral)}}
.metric .l{{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--c45);margin-top:7px;line-height:1.5}}

section{{margin-top:46px}}
.sec-k{{font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--coral);
margin-bottom:12px;padding-bottom:11px;border-bottom:1px solid var(--line)}}
.card{{background:var(--ink2);border:1px solid var(--line);border-radius:6px;padding:26px 26px 24px}}
.card h2{{font-family:var(--serif);font-weight:400;font-size:24px;color:var(--cream);
margin-bottom:14px;letter-spacing:-.01em}}
.card h3{{font-family:var(--serif);font-weight:400;font-size:19px;color:var(--cream);margin:20px 0 8px}}
.card p{{margin-bottom:13px}} .card p:last-child{{margin-bottom:0}}
.card ul,.card ol{{margin:0 0 13px 20px}} .card li{{margin-bottom:7px}}

.two{{display:grid;grid-template-columns:1fr 1fr;gap:18px}}
@media(max-width:760px){{.two{{grid-template-columns:1fr}}}}

.claims{{list-style:none}}
.claim{{display:flex;align-items:center;gap:18px;padding:13px 16px;border:1px solid transparent;
border-bottom:1px solid var(--line)}}
.claim.gap{{background:rgba(239,122,94,.05);border-color:rgba(239,122,94,.22);border-radius:4px;margin:3px 0}}
.c-main{{flex:1;min-width:0}}
.c-label{{color:var(--cream);font-size:15px;line-height:1.4}}
.c-src{{font-size:11.5px;color:var(--c25);letter-spacing:.02em;margin-top:3px}}
.badge{{font-size:8.5px;letter-spacing:.14em;border:1px solid var(--c25);border-radius:2px;
padding:2px 5px;color:var(--c45);vertical-align:middle;margin-left:5px;white-space:nowrap}}
.badge.res{{border-color:rgba(239,122,94,.4);color:var(--coral)}}
.c-pips{{display:flex;gap:4px;flex-shrink:0}}
.pip{{width:9px;height:9px;border-radius:50%;border:1px solid var(--c25);display:block}}
.pip.on{{background:var(--cream);border-color:var(--cream)}}
.pip.tgt{{border-color:var(--coral);box-shadow:0 0 0 2px rgba(239,122,94,.2)}}

.note{{font-size:13px;color:var(--c45);margin-top:14px;line-height:1.6}}
footer{{margin-top:56px;padding-top:20px;border-top:1px solid var(--line);
font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--c25);
display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}}
</style></head><body>
<div class="wrap">

<header>
  <div class="kicker">Week {wk} · Day {dy} · {today.strftime('%A %d %B %Y')}</div>
  <h1>{html.escape(str(title))}</h1>
  <div class="sub">15 minutes. End by having <em>done</em> something.</div>

  <div class="metrics">
    <div class="metric"><div class="n">{progress.get('streak',0)}<em>d</em></div><div class="l">Current streak</div></div>
    <div class="metric"><div class="n">{progress.get('daysCompleted',0)}</div><div class="l">Units completed</div></div>
    <div class="metric"><div class="n">{ready}<em>/{len(on_res)}</em></div><div class="l">Resume claims at target</div></div>
    <div class="metric"><div class="n">{len(due)}</div><div class="l">Recall items due</div></div>
  </div>
</header>

<section>
  <div class="sec-k">Today · Brief</div>
  <div class="card">{brief}</div>
</section>

<section>
  <div class="sec-k">Today · Drill</div>
  <div class="card">{drill}</div>
</section>

<section>
  <div class="sec-k">Recall</div>
  <div class="card">{recall}</div>
</section>

<section>
  <div class="sec-k">Claim coverage — {pct}% of resume claims at target</div>
  <div class="card">
    <h2>Defend the claim</h2>
    <p class="note">On the resume. Target is <strong>4 — did it cold, unaided</strong>. Anything highlighted is an interview risk.</p>
    <ul class="claims">{''.join(claim_row(c) for c in defend)}</ul>
    <h3>Get current</h3>
    <p class="note">Not claimed yet. Target is 3 — enough to hold a real conversation.</p>
    <ul class="claims">{''.join(claim_row(c) for c in current)}</ul>
  </div>
</section>

<footer>
  <span>Knowledge · PBK</span>
  <span>Generated {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}</span>
</footer>

</div></body></html>"""


if __name__ == "__main__":
    OUT.write_text(build())
    print(f"✓ {OUT}")
