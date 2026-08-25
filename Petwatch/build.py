#!/usr/bin/env python3
"""
Builds the publishable version of the PetWatch submission into dist/.

Every page is made fully self-contained: the Alexandria variable font and both
pet photographs are inlined as data URIs, because published artifacts block all
external requests. The same inlining means the local copies work with no network.

Run it twice: once to publish and collect URLs, then again with urls.json filled
in so the cross-page navigation points at the real addresses.
"""
import base64, json, os, re, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
SP   = os.environ.get('SP', '')
DIST = os.path.join(ROOT, 'dist')

def b64(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode()

FONT = b64(os.path.join(SP, 'alex.woff2'))
PUG  = b64(os.path.join(SP, 'pug.jpg'))
CAT  = b64(os.path.join(SP, 'cat.jpg'))

FONT_CSS = ('<style>\n@font-face{font-family:"Alexandria";font-style:normal;'
            'font-weight:300 700;font-display:swap;'
            'src:url(data:font/woff2;base64,' + FONT + ') format("woff2")}\n</style>')

URLS = {}
if os.path.exists(os.path.join(ROOT, 'urls.json')):
    URLS = json.load(open(os.path.join(ROOT, 'urls.json')))

# ── shared navigation ────────────────────────────────────────────────
NAV_ITEMS = [('overview', 'Overview'), ('prototype', 'Prototype'),
             ('maps', 'Maps'), ('direction', 'Direction')]

def nav(current):
    out = ['<nav class="pnav" aria-label="Submission sections">']
    for key, label in NAV_ITEMS:
        if key == current:
            out.append('<span class="here" aria-current="page">%s</span>' % label)
        elif URLS.get(key):
            out.append('<a href="%s">%s</a>' % (URLS[key], label))
    out.append('</nav>')
    return '\n'.join(out)

NAV_CSS = """
<style>
.pnav{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:999;
  display:flex;gap:2px;background:rgba(8,11,20,.9);backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,.15);border-radius:99px;padding:5px;
  font-size:10px;letter-spacing:.12em;text-transform:uppercase;
  box-shadow:0 10px 30px rgba(0,0,0,.5);font-family:'Alexandria',system-ui,sans-serif}
.pnav a,.pnav .here{padding:8px 14px;border-radius:99px;text-decoration:none;
  color:#A7B2C6;white-space:nowrap}
.pnav a:hover{background:rgba(255,255,255,.08);color:#F2F5FA}
.pnav .here{background:rgba(77,141,255,.15);color:#93B9FF}
@media(max-width:640px){.pnav{font-size:9px}.pnav a,.pnav .here{padding:8px 10px}}
</style>"""


def inline_assets(html):
    """Strip font CDN links, inline the face, and embed both photographs."""
    html = re.sub(r'<link rel="preconnect"[^>]*>\s*', '', html)
    html = re.sub(r'<link href="https://fonts\.googleapis\.com[^>]*>', FONT_CSS, html)
    for pat, data in ((r'https://images\.unsplash\.com/photo-1517849845537-4d257902454a\?[^"\')]*', PUG),
                      (r'https://images\.unsplash\.com/photo-1574158622682-e40e69881006\?[^"\')]*', CAT)):
        html = re.sub(pat, 'data:image/jpeg;base64,' + data, html)
    return html


def rewrite_links(html):
    """Point in-page links at the published addresses. Longest paths first so
    'prototype/index.html' is not clobbered by the bare 'index.html' rule."""
    for path, key in (('../index.html', 'overview'), ('prototype/index.html', 'prototype'),
                      ('../maps.html', 'maps'), ('../design-options.html', 'direction'),
                      ('design-options.html', 'direction'), ('maps.html', 'maps'),
                      ('index.html', 'overview')):
        if URLS.get(key):
            html = html.replace('href="%s"' % path, 'href="%s"' % URLS[key])
    return html


def finish(html, current):
    """Replace any existing presenter nav with one pointing at published URLs."""
    html = re.sub(r'\n?<nav class="pnav"[\s\S]*?</nav>', '', html)
    html = re.sub(r'<style>\s*\.pnav\{[\s\S]*?</style>', '', html)
    return html.replace('</body>', NAV_CSS + '\n' + nav(current) + '\n</body>')


# ── markdown → styled HTML ───────────────────────────────────────────
def md_inline(t):
    t = (t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![\*\w])\*([^*\n]+)\*(?!\*)', r'<em>\1</em>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', t)
    return t


def md_to_html(md):
    lines, out, i = md.split('\n'), [], 0
    list_stack = []

    def close_lists():
        while list_stack:
            out.append('</%s>' % list_stack.pop())

    while i < len(lines):
        ln = lines[i]
        s = ln.strip()

        if not s:
            close_lists(); i += 1; continue

        if s.startswith('```'):
            close_lists(); i += 1
            buf = []
            while i < len(lines) and not lines[i].strip().startswith('```'):
                buf.append(lines[i].replace('&', '&amp;').replace('<', '&lt;')); i += 1
            i += 1
            out.append('<pre><code>%s</code></pre>' % '\n'.join(buf)); continue

        if re.match(r'^---+$', s):
            close_lists(); out.append('<hr>'); i += 1; continue

        m = re.match(r'^(#{1,6})\s+(.*)$', s)
        if m:
            close_lists()
            lvl = len(m.group(1))
            out.append('<h%d>%s</h%d>' % (lvl, md_inline(m.group(2)), lvl)); i += 1; continue

        # table
        if s.startswith('|') and i + 1 < len(lines) and re.match(r'^\s*\|[\s:\-|]+\|\s*$', lines[i + 1]):
            close_lists()
            cells = lambda r: [c.strip() for c in r.strip().strip('|').split('|')]
            head = cells(s); i += 2
            out.append('<div class="tw"><table><thead><tr>' +
                       ''.join('<th>%s</th>' % md_inline(c) for c in head) + '</tr></thead><tbody>')
            while i < len(lines) and lines[i].strip().startswith('|'):
                out.append('<tr>' + ''.join('<td>%s</td>' % md_inline(c) for c in cells(lines[i])) + '</tr>')
                i += 1
            out.append('</tbody></table></div>'); continue

        if s.startswith('>'):
            close_lists()
            buf = []
            while i < len(lines) and lines[i].strip().startswith('>'):
                buf.append(lines[i].strip().lstrip('>').strip()); i += 1
            out.append('<blockquote>%s</blockquote>' % md_inline(' '.join(buf))); continue

        m = re.match(r'^(\s*)([-*]|\d+\.)\s+(.*)$', ln)
        if m:
            indent, marker, body = len(m.group(1)), m.group(2), m.group(3)
            tag = 'ul' if marker in '-*' else 'ol'
            depth = indent // 2
            while len(list_stack) > depth + 1:
                out.append('</%s>' % list_stack.pop())
            if len(list_stack) < depth + 1:
                out.append('<%s>' % tag); list_stack.append(tag)
            out.append('<li>%s</li>' % md_inline(body)); i += 1; continue

        close_lists()
        buf = []
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#{1,6}\s|\||>|```|---+$)', lines[i].strip()) \
                and not re.match(r'^\s*([-*]|\d+\.)\s+', lines[i]):
            buf.append(lines[i].strip()); i += 1
        if buf:
            if len(buf) > 1 and all(b.startswith('**') for b in buf):
                out.append('<p class="meta">%s</p>' % '<br>'.join(md_inline(b) for b in buf))
            else:
                out.append('<p>%s</p>' % md_inline(' '.join(buf)))
    close_lists()
    cleaned = []
    for n, tag in enumerate(out):
        if tag == '<hr>' and n + 1 < len(out) and out[n + 1].startswith('<h2'):
            continue
        cleaned.append(tag)
    return '\n'.join(cleaned)


TOC_CSS = """
.lede{font-size:16.5px;color:var(--ink-2);max-width:64ch;margin:0 0 34px}
.toc{display:grid;gap:2px;margin:0 0 12px;border:1px solid var(--line);
  border-radius:16px;padding:8px;background:var(--surf)}
.toc a{display:flex;align-items:center;gap:14px;padding:13px 16px;border-radius:11px;
  text-decoration:none;color:var(--ink);font-size:14.5px;transition:background .2s}
.toc a:hover{background:var(--surf-2)}
.toc .n{font-size:11px;color:var(--accent);font-variant-numeric:tabular-nums;
  border:1px solid rgba(77,141,255,.3);border-radius:7px;padding:2px 8px}
.docsec{padding-top:20px;scroll-margin-top:24px}
.docsec-h{margin:76px 0 26px;padding-top:30px;border-top:1px solid var(--line)}
.docsec-h .n{display:block;font-size:10px;letter-spacing:.18em;text-transform:uppercase;
  color:var(--accent-2);margin-bottom:10px}
.docsec-h h2{margin:0;padding:0;border:0;font-size:30px;letter-spacing:-.035em}
.docsec h2{font-size:21px}
"""

DOC_SHELL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>__TITLE__</title>
__FONT__
<style>
:root{
  --bg:#080B14; --surf:rgba(255,255,255,.035); --surf-2:rgba(255,255,255,.06);
  --line:rgba(255,255,255,.09); --ink:#F2F5FA; --ink-2:#A7B2C6; --ink-3:#6D7A90;
  --accent:#4D8DFF; --accent-2:#93B9FF; --violet:#8B7CF6;
  --sans:'Alexandria',system-ui,-apple-system,sans-serif;
  --mono:ui-monospace,'SF Mono',Menlo,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink-2);font-family:var(--sans);font-weight:300;
  line-height:1.72;-webkit-font-smoothing:antialiased;font-size:15px}
body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;
  background:radial-gradient(1000px 560px at 80% -12%,rgba(77,141,255,.17),transparent 62%),
             radial-gradient(760px 460px at 6% 6%,rgba(139,124,246,.10),transparent 60%)}
::selection{background:var(--accent);color:#fff}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}
.wrap{max-width:760px;margin:0 auto;padding:84px 24px 140px}
.crumb{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-3);
  margin-bottom:26px;display:flex;gap:10px;align-items:center}
.crumb a{color:var(--accent-2);text-decoration:none}
.crumb a:hover{text-decoration:underline}
h1{font-size:clamp(30px,4.6vw,44px);font-weight:500;letter-spacing:-.04em;line-height:1.06;
  color:var(--ink);margin:0 0 30px;text-wrap:balance;
  background:linear-gradient(165deg,#FFF 35%,#9FB6D9 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
h2{font-size:23px;font-weight:500;letter-spacing:-.03em;color:var(--ink);
  margin:56px 0 14px;padding-top:22px;border-top:1px solid var(--line);text-wrap:balance}
h3{font-size:16.5px;font-weight:500;letter-spacing:-.02em;color:var(--ink);margin:34px 0 10px}
h4{font-size:14px;font-weight:500;color:var(--accent-2);margin:24px 0 8px;
  letter-spacing:.02em}
p{margin:0 0 16px;max-width:68ch}
p.meta{font-size:13px;color:var(--ink-3);line-height:2;background:var(--surf);border:1px solid var(--line);border-radius:12px;padding:16px 20px;margin-bottom:30px}
p.meta strong{color:var(--ink-2);font-weight:500}
strong{color:var(--ink);font-weight:500}
em{color:var(--ink);font-style:italic}
a{color:var(--accent-2)}
ul,ol{margin:0 0 18px;padding-left:22px}
li{margin-bottom:7px;max-width:66ch}
li::marker{color:var(--ink-3)}
hr{border:0;border-top:1px solid var(--line);margin:40px 0}
code{font-family:var(--mono);font-size:12.5px;background:var(--surf-2);
  border:1px solid var(--line);border-radius:5px;padding:1px 6px;color:var(--accent-2)}
pre{background:var(--surf);border:1px solid var(--line);border-radius:14px;
  padding:20px;overflow-x:auto;margin:0 0 20px}
pre code{background:none;border:0;padding:0;color:var(--ink-2);font-size:12px;line-height:1.7}
blockquote{border-left:2px solid var(--accent);background:rgba(77,141,255,.07);
  border-radius:0 12px 12px 0;padding:16px 20px;margin:0 0 20px;color:var(--ink-2)}
blockquote strong{color:var(--ink)}
.tw{overflow-x:auto;margin:0 0 22px;border:1px solid var(--line);border-radius:14px}
table{border-collapse:collapse;width:100%;font-size:13.5px;min-width:480px}
th{text-align:left;font-weight:500;color:var(--ink-3);font-size:10px;letter-spacing:.14em;
  text-transform:uppercase;padding:13px 16px;border-bottom:1px solid var(--line);
  background:var(--surf-2);white-space:nowrap}
td{padding:13px 16px;border-bottom:1px solid var(--line);vertical-align:top;line-height:1.62}
tr:last-child td{border-bottom:0}
td strong{color:var(--ink)}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
</head>
<body>
<div class="wrap">
<div class="crumb">__CRUMB__</div>
<h1>__TITLE__</h1>
__BODY__
</div>
</body>
</html>"""

DOCS = [
    ('prd.md',             'PetWatch Product Definition'),
    ('backlog.md',         'PetWatch Release Plan'),
    ('research-plan.md',   'PetWatch Validation Plan'),
    ('ways-of-working.md', 'Working With This Team'),
    ('ai-log.md',          'How AI Was Used'),
]

def build():
    os.makedirs(DIST, exist_ok=True)

    # main pages
    for src, key in (('index.html', 'overview'), ('maps.html', 'maps'),
                     ('design-options.html', 'direction'),
                     ('prototype/index.html', 'prototype')):
        html = open(os.path.join(ROOT, src)).read()
        html = finish(rewrite_links(inline_assets(html)), key)
        name = 'prototype.html' if key == 'prototype' else os.path.basename(src)
        if key == 'overview':
            name = 'overview.html'
        elif key == 'direction':
            name = 'direction.html'
        # point hub document links at published doc pages
        for fn, _ in DOCS:
            if URLS.get('artifacts'):
                html = html.replace('artifacts/' + fn,
                                    URLS['artifacts'] + '#' + fn[:-3])
        open(os.path.join(DIST, name), 'w').write(html)

    # document pages
    for fn, title in DOCS:
        md = open(os.path.join(ROOT, 'artifacts', fn)).read()
        md = re.sub(r'^#\s+.*\n', '', md, count=1)          # h1 comes from the shell
        crumb = 'PetWatch · Goji Labs exercise'
        if URLS.get('overview'):
            crumb = '<a href="%s">← Submission overview</a> <span>·</span> <span>PetWatch</span>' % URLS['overview']
        page = (DOC_SHELL.replace('__TITLE__', title).replace('__FONT__', FONT_CSS)
                .replace('__CRUMB__', crumb).replace('__BODY__', md_to_html(md)))
        page = page.replace('</body>', NAV_CSS + '\n' + nav('') + '\n</body>')
        open(os.path.join(DIST, fn[:-3] + '.html'), 'w').write(page)

    # ── combined documents page ──────────────────────────────────
    toc, body = [], []
    for n, (fn, title) in enumerate(DOCS):
        slug = fn[:-3]
        md = open(os.path.join(ROOT, 'artifacts', fn)).read()
        md = re.sub(r'^#\s+.*\n', '', md, count=1)
        toc.append('<a href="#%s"><span class="n">%d</span>%s</a>' % (slug, n + 1, title))
        body.append('<section id="%s" class="docsec"><div class="docsec-h">'
                    '<span class="n">Document %d of 5</span><h2>%s</h2></div>%s</section>'
                    % (slug, n + 1, title, md_to_html(md)))
    crumb = 'PetWatch · Goji Labs exercise'
    if URLS.get('overview'):
        crumb = ('<a href="%s">← Submission overview</a> <span>·</span> '
                 '<span>Written artifacts</span>') % URLS['overview']
    combined = (DOC_SHELL.replace('__TITLE__', 'PetWatch Written Artifacts')
                .replace('__FONT__', FONT_CSS).replace('__CRUMB__', crumb)
                .replace('__BODY__', '<p class="lede">The five working documents behind the '
                         'submission, in the shape they would take in Notion and Linear. Each is '
                         'honest about what it does not yet know.</p>'
                         '<nav class="toc">' + ''.join(toc) + '</nav>' + ''.join(body)))
    combined = combined.replace('</style>', TOC_CSS + '</style>', 1)
    combined = combined.replace('</body>', NAV_CSS + '\n' + nav('') + '\n</body>')
    open(os.path.join(DIST, 'artifacts.html'), 'w').write(combined)

    print('built %d files into dist/' % len(os.listdir(DIST)))
    for f in sorted(os.listdir(DIST)):
        print('  %-22s %6.0f KB' % (f, os.path.getsize(os.path.join(DIST, f)) / 1024))

if __name__ == '__main__':
    build()
