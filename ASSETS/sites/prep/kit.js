/* ── helpers ──────────────────────────────────────────────
   Pages don't all have every widget — the Goji page has a live
   component preview, the others don't. Look-ups must no-op rather
   than throw, or one missing element kills every feature below it. */
function $(id){ return document.getElementById(id); }
function on(id, ev, fn){ var el = $(id); if(el) el.addEventListener(ev, fn); return el; }

/* ── config injection ─────────────────────────────────── */
document.querySelectorAll('[data-kit]').forEach(function(el){
  var v = KIT[el.getAttribute('data-kit')];
  if(v) el.textContent = v;
});
document.title = KIT.pageTitle || ("Interview Command Center — " + KIT.company);

/* ── nav ──────────────────────────────────────────────── */
var nav = $('nav');
if(nav){
  SECTIONS.forEach(function(s){
    var a = document.createElement('a');
    a.href = '#' + s.id;
    a.innerHTML = '<span class="n">' + s.n + '</span><span>' + s.t + '</span>';
    a.dataset.for = s.id;
    nav.appendChild(a);
  });
}

var navLinks = nav ? nav.querySelectorAll('a') : [];
var obs = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){
      navLinks.forEach(function(l){ l.classList.toggle('on', l.dataset.for === e.target.id); });
    }
  });
}, {rootMargin:'-15% 0px -70% 0px'});
SECTIONS.forEach(function(s){ var el = document.getElementById(s.id); if(el) obs.observe(el); });

/* ── toast ────────────────────────────────────────────── */
var toastEl = $('toast'), toastT;
function toast(msg){
  if(!toastEl) return;
  toastEl.textContent = msg;
  toastEl.dataset.on = '1';
  clearTimeout(toastT);
  toastT = setTimeout(function(){ toastEl.dataset.on = '0'; }, 1500);
}

/* ── copy ─────────────────────────────────────────────── */
document.querySelectorAll('.copy').forEach(function(b){
  b.addEventListener('click', function(){
    var src = document.getElementById(b.dataset.copy);
    if(!src) return;
    var txt = src.innerText;
    var done = function(){
      b.textContent = 'Copied';
      b.classList.add('done');
      toast('Copied to clipboard');
      setTimeout(function(){ b.textContent = 'Copy'; b.classList.remove('done'); }, 1600);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done, fallback);
    } else { fallback(); }
    function fallback(){
      var ta = document.createElement('textarea');
      ta.value = txt; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); done(); }catch(e){ toast('Select and copy manually'); }
      document.body.removeChild(ta);
    }
  });
});

/* ── preview theme (Goji page only) ───────────────────── */
var stage = $('stage');
on('pvToggle', 'click', function(){
  if(!stage) return;
  stage.dataset.t = stage.dataset.t === 'dark' ? 'light' : 'dark';
  toast(stage.dataset.t + ' theme — same semantic layer');
});

/* ── checklist persistence ────────────────────────────── */
['ck1','ck2'].forEach(function(gid){
  var g = document.getElementById(gid);
  if(!g) return;
  g.querySelectorAll('input[type=checkbox]').forEach(function(box, i){
    var key = 'ik.' + gid + '.' + i;
    try{ if(localStorage.getItem(key) === '1') box.checked = true; }catch(e){}
    box.addEventListener('change', function(){
      try{ localStorage.setItem(key, box.checked ? '1' : '0'); }catch(e){}
    });
  });
});

/* ── rehearsal ────────────────────────────────────────── */
var reh = $('reh');
var rehI = 0, rehSec = 0, rehTimer = null;

function rehRender(){
  var b = BEATS[rehI];
  $('rehName').textContent = b.name;
  $('rehScript').textContent = b.script;
  $('rehTarget').textContent = 'target · ' + b.sec + ' seconds';
  var dots = $('rehDots').children;
  for(var i=0;i<dots.length;i++) dots[i].classList.toggle('on', i <= rehI);
  rehTick();
}
function rehTick(){
  var m = Math.floor(rehSec/60), s = rehSec % 60;
  var c = $('rehClock');
  c.textContent = m + ':' + (s<10?'0':'') + s;
  c.classList.toggle('over', rehSec > BEATS[rehI].sec);
}
function rehOpen(){
  if(!reh) return;
  reh.dataset.open = '1'; reh.setAttribute('aria-hidden','false');
  rehI = 0; rehSec = 0; rehRender();
  clearInterval(rehTimer);
  rehTimer = setInterval(function(){ rehSec++; rehTick(); }, 1000);
}
function rehClose(){
  if(!reh) return;
  reh.dataset.open = '0'; reh.setAttribute('aria-hidden','true');
  clearInterval(rehTimer); rehTimer = null;
}
function rehStep(d){
  var next = rehI + d;
  if(next < 0) return;
  if(next >= BEATS.length){ rehClose(); toast('Arc complete — run it again'); return; }
  rehI = next; rehSec = 0; rehRender();
}
on('rehBtn',   'click', rehOpen);
on('rehClose', 'click', rehClose);
on('rehNext',  'click', function(){ rehStep(1); });
on('rehPrev',  'click', function(){ rehStep(-1); });
on('rehReset', 'click', function(){ rehSec = 0; rehTick(); });

/* ── command palette ──────────────────────────────────── */
var pal = $('pal'),
    palIn = $('palIn'),
    palList = $('palList'),
    palSel = 0, palItems = [];

function palRender(q){
  if(!palList) return;
  q = (q||'').toLowerCase();
  palItems = SECTIONS.filter(function(s){ return (s.n + ' ' + s.t).toLowerCase().indexOf(q) > -1; });
  palSel = 0;
  palList.innerHTML = '';
  palItems.forEach(function(s, i){
    var li = document.createElement('li');
    li.innerHTML = '<span class="n">' + s.n + '</span><span>' + s.t + '</span>';
    if(i === 0) li.classList.add('on');
    li.addEventListener('click', function(){ palGo(i); });
    palList.appendChild(li);
  });
}
function palMove(d){
  if(!palItems.length) return;
  palSel = (palSel + d + palItems.length) % palItems.length;
  Array.prototype.forEach.call(palList.children, function(li, i){ li.classList.toggle('on', i === palSel); });
  palList.children[palSel].scrollIntoView({block:'nearest'});
}
function palGo(i){
  var s = palItems[i === undefined ? palSel : i];
  if(!s) return;
  palToggle(false);
  var el = document.getElementById(s.id);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
}
function palToggle(open){
  if(!pal) return;
  pal.dataset.open = open ? '1' : '0';
  pal.setAttribute('aria-hidden', open ? 'false' : 'true');
  if(open && palIn){ palIn.value = ''; palRender(''); palIn.focus(); }
}
on('palBtn', 'click', function(){ palToggle(true); });
on('pal',    'click', function(e){ if(e.target === pal) palToggle(false); });
on('palIn',  'input', function(){ palRender(palIn.value); });
on('palIn',  'keydown', function(e){
  if(e.key === 'ArrowDown'){ e.preventDefault(); palMove(1); }
  else if(e.key === 'ArrowUp'){ e.preventDefault(); palMove(-1); }
  else if(e.key === 'Enter'){ e.preventDefault(); palGo(); }
  else if(e.key === 'Escape'){ palToggle(false); }
});

/* ── global keys ──────────────────────────────────────── */
function inField(e){
  var t = e.target.tagName;
  return t === 'INPUT' || t === 'TEXTAREA' || e.target.isContentEditable;
}
document.addEventListener('keydown', function(e){
  if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); palToggle(true); return; }
  if(e.key === 'Escape'){
    if(pal && pal.dataset.open === '1') palToggle(false);
    else if(reh && reh.dataset.open === '1') rehClose();
    return;
  }
  if(reh && reh.dataset.open === '1'){
    if(e.key === ' '){ e.preventDefault(); rehStep(1); }
    return;
  }
  if(inField(e) || e.metaKey || e.ctrlKey || e.altKey) return;
  var k = e.key.toLowerCase();
  if(k === 'r'){ e.preventDefault(); rehOpen(); }
  else if(k === 'j' || k === 'k'){
    e.preventDefault();
    var cur = 0;
    navLinks.forEach(function(l, i){ if(l.classList.contains('on')) cur = i; });
    var nx = Math.max(0, Math.min(SECTIONS.length - 1, cur + (k === 'j' ? 1 : -1)));
    var el = document.getElementById(SECTIONS[nx].id);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  }
});
