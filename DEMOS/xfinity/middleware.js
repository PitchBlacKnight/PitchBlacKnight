// Edge password gate for the whole demo. The password is checked here, at the
// edge, before any page is served — not in client JS.
const KEY = encodeURIComponent('ComcastDemo#1');

export const config = {
  matcher: ['/((?!gate|orbits\\.gif|og\\.jpg|favicon.ico).*)'],
};

export default function middleware(req) {
  const cookie = req.headers.get('cookie') || '';
  if (cookie.split(/;\s*/).includes('dxd_key=' + KEY)) return;
  const url = new URL(req.url);
  const to = encodeURIComponent(url.pathname + url.search);
  return Response.redirect(new URL('/gate?to=' + to, req.url), 307);
}
