#!/usr/bin/env python3
"""
Builds the entire submission as ONE self-contained page: dist/petwatch.html

The four source pages share 26 class names (.card, .note, .lede, .chip, .n ...),
so their stylesheets cannot simply be concatenated. Each page's CSS is scoped
under a wrapper id, which also converts its :root custom properties into
wrapper-level properties - keeping every page's tokens isolated from the others.
"""
import os, re
import build as B                      # reuses the font/photo inlining and md converter

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, 'dist')

PANES = [
    ('overview',  'Overview',  'index.html'),
    ('prototype', 'Prototype', 'prototype/index.html'),
    ('maps',      'Maps',      'maps.html'),
    ('direction', 'Direction', 'design-options.html'),
]

# ── CSS scoping ──────────────────────────────────────────────────────
def split_rules(css):
    """Yield (prelude, block, is_at_rule) walking top-level braces only."""
    out, depth, buf, i = [], 0, '', 0
    while i < len(css):
        c = css[i]
        if c == '{':
            depth += 1
            if depth == 1:
                prelude, buf = buf, ''
                i += 1
                continue
        elif c == '}':
            depth -= 1
            if depth == 0:
                out.append((prelude.strip(), buf))
                buf = ''
                i += 1
                continue
        buf += c
        i += 1
    if buf.strip():
        out.append((buf.strip(), None))
    return out


def scope_selector(sel, scope):
    parts = []
    for one in sel.split(','):
        one = one.strip()
        if not one:
            continue
        if one in (':root', 'html', 'body', 'html, body'):
            parts.append(scope)
        elif one.startswith(':root'):
            parts.append(scope + one[len(':root'):])
        elif one.startswith('body'):
            parts.append(scope + one[len('body'):])
        elif one.startswith('html'):
            parts.append(scope + one[len('html'):])
        elif one == '*':
            parts.append(scope + ' *')
        elif one.startswith('@'):
            parts.append(one)
        else:
            parts.append(scope + ' ' + one)
    return ', '.join(parts)


def scope_css(css, scope):
    out = []
    for prelude, block in split_rules(css):
        if block is None:
            out.append(prelude)
            continue
        p = re.sub(r'/\*[\s\S]*?\*/', '', prelude).strip()
        if p.startswith('@font-face') or p.startswith('@keyframes') or p.startswith('@-webkit-keyframes'):
            out.append('%s{%s}' % (p, block))                      # never scope these
        elif p.startswith('@media') or p.startswith('@supports'):
            out.append('%s{%s}' % (p, scope_css(block, scope)))    # scope the inside
        else:
            out.append('%s{%s}' % (scope_selector(p, scope), block))
    return '\n'.join(out)


def extract(path):
    html = B.inline_assets(open(os.path.join(ROOT, path)).read())
    leftover = re.findall(r'https?://(?!www\.w3\.org)[^"\')\s]+', html)
    if leftover:                       # a published page cannot fetch anything
        raise SystemExit('%s still references external assets:\n  %s'
                         % (path, '\n  '.join(sorted(set(leftover))[:6])))
    html = re.sub(r'\n?<nav class="pnav"[\s\S]*?</nav>', '', html)   # per-page nav is replaced
    styles = re.findall(r'<style>([\s\S]*?)</style>', html)
    body = re.search(r'<body[^>]*>([\s\S]*)</body>', html).group(1)
    body = re.sub(r'<style>[\s\S]*?</style>', '', body)              # move any inline style up
    return '\n'.join(styles), body


SHELL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>PetWatch Care Handoff</title>
__FONT__
<style>
/* ── page frame: the only unscoped rules in the document ───────── */
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:#080B14;color:#F2F5FA;
  font-family:'Alexandria',system-ui,-apple-system,sans-serif;font-weight:300;
  -webkit-font-smoothing:antialiased}
#tabs{
  position:sticky;top:0;z-index:900;display:flex;gap:2px;justify-content:center;
  padding:12px;background:rgba(8,11,20,.82);backdrop-filter:blur(16px) saturate(140%);
  border-bottom:1px solid rgba(255,255,255,.08);flex-wrap:wrap;
}
#tabs button{
  font-family:inherit;font-size:11px;letter-spacing:.13em;text-transform:uppercase;
  color:#A7B2C6;background:transparent;border:1px solid transparent;border-radius:99px;
  padding:9px 16px;cursor:pointer;transition:background .2s,color .2s,border-color .2s;
  min-height:40px;
}
#tabs button:hover{background:rgba(255,255,255,.06);color:#F2F5FA}
#tabs button[aria-selected="true"]{
  background:rgba(77,141,255,.15);color:#93B9FF;border-color:rgba(77,141,255,.32);
}
#tabs button:focus-visible{outline:2px solid #4D8DFF;outline-offset:2px}
.pane:not(.on){display:none!important}
.pane.on{display:block}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
</style>
__STYLES__
</head>
<body>

<nav id="tabs" role="tablist" aria-label="Submission sections">
__TABS__
</nav>

__PANES__

<script>
(function(){
  var tabs  = [].slice.call(document.querySelectorAll('#tabs button'));
  var panes = [].slice.call(document.querySelectorAll('.pane'));
  function show(id, push){
    tabs.forEach(function(t){ t.setAttribute('aria-selected', String(t.dataset.pane === id)); });
    panes.forEach(function(p){ p.classList.toggle('on', p.id === 'pane-' + id); });
    if (push && location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    window.scrollTo(0, 0);
  }
  tabs.forEach(function(t){
    t.addEventListener('click', function(){ show(t.dataset.pane, true); });
    t.addEventListener('keydown', function(e){
      var i = tabs.indexOf(t), n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
      if (n >= 0 && n < tabs.length){ tabs[n].focus(); show(tabs[n].dataset.pane, true); }
    });
  });
  // deep links: #prototype, and #prd etc. jump into the documents pane
  var docIds = ['prd','backlog','research-plan','ways-of-working','ai-log'];
  var h = (location.hash || '').slice(1);
  if (docIds.indexOf(h) > -1){
    show('artifacts', false);
    var el = document.getElementById(h);
    if (el) setTimeout(function(){ el.scrollIntoView(); }, 60);
  } else {
    show(tabs.map(function(t){ return t.dataset.pane; }).indexOf(h) > -1 ? h : 'overview', false);
  }
  // in-page links to another pane switch to it instead of navigating
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (docIds.indexOf(id) > -1){
      e.preventDefault(); show('artifacts', true);
      var el = document.getElementById(id);
      if (el) setTimeout(function(){ el.scrollIntoView(); }, 60);
    } else if (tabs.some(function(t){ return t.dataset.pane === id; })){
      e.preventDefault(); show(id, true);
    }
  });
})();
</script>
</body>
</html>"""


def build():
    styles, panes, tabs = [], [], []

    for key, label, src in PANES:
        css, body = extract(src)
        styles.append('<style>/* ═══ %s ═══ */\n%s</style>' % (label, scope_css(css, '#pane-' + key)))
        panes.append('<div class="pane" id="pane-%s" role="tabpanel">%s</div>' % (key, body))
        tabs.append('<button role="tab" data-pane="%s" aria-selected="false">%s</button>' % (key, label))

    # documents pane, built from the markdown sources
    doc_body = ['<div class="wrap"><h1>Written Artifacts</h1>'
                '<p class="lede">The five working documents behind the submission, in the shape '
                'they would take in Notion and Linear. Each is honest about what it does not yet '
                'know.</p><nav class="toc">']
    secs = []
    for n, (fn, title) in enumerate(B.DOCS):
        slug = fn[:-3]
        md = re.sub(r'^#\s+.*\n', '', open(os.path.join(ROOT, 'artifacts', fn)).read(), count=1)
        doc_body.append('<a href="#%s"><span class="n">%d</span>%s</a>' % (slug, n + 1, title))
        secs.append('<section id="%s" class="docsec"><div class="docsec-h">'
                    '<span class="n">Document %d of 5</span><h2>%s</h2></div>%s</section>'
                    % (slug, n + 1, title, B.md_to_html(md)))
    doc_body.append('</nav>' + ''.join(secs) + '</div>')

    doc_css = re.search(r'<style>([\s\S]*?)</style>',
                        B.DOC_SHELL.replace('__FONT__', '')).group(1) + B.TOC_CSS
    styles.append('<style>/* ═══ Documents ═══ */\n%s</style>'
                  % scope_css(doc_css, '#pane-artifacts'))
    panes.append('<div class="pane" id="pane-artifacts" role="tabpanel">%s</div>' % ''.join(doc_body))
    tabs.append('<button role="tab" data-pane="artifacts" aria-selected="false">Documents</button>')

    html = (SHELL.replace('__FONT__', B.FONT_CSS)
            .replace('__STYLES__', '\n'.join(styles))
            .replace('__TABS__', '\n'.join(tabs))
            .replace('__PANES__', '\n'.join(panes)))

    # every cross-page link becomes an in-page pane switch
    for path, key in (('../index.html', 'overview'), ('prototype/index.html', 'prototype'),
                      ('../maps.html', 'maps'), ('../design-options.html', 'direction'),
                      ('design-options.html', 'direction'), ('maps.html', 'maps'),
                      ('index.html', 'overview')):
        html = html.replace('href="%s"' % path, 'href="#%s"' % key)
    for fn, _ in B.DOCS:
        html = html.replace('href="artifacts/%s"' % fn, 'href="#%s"' % fn[:-3])

    out = os.path.join(DIST, 'petwatch.html')
    open(out, 'w').write(html)
    print('wrote %s  (%.0f KB)' % (out, os.path.getsize(out) / 1024))


if __name__ == '__main__':
    build()
