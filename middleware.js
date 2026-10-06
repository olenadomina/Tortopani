/**
 * Vercel Routing Middleware: en.tortopani.com/ serves the English landing.
 *
 * A vercel.json rewrite cannot do this — "/" exists on disk (index.html, the
 * Ukrainian home) and the filesystem wins over rewrites. Middleware runs
 * before that lookup. It is matched to "/" only, and on every other host it
 * passes the request through untouched. The rest of the en host's routing
 * (keeping it inside the English pages) is in vercel.json redirects.
 */
export const config = { matcher: "/" };

export default function middleware(request) {
  const hosts = [
    new URL(request.url).hostname,
    request.headers.get("x-forwarded-host"),
    request.headers.get("host"),
  ].map((h) => (h || "").toLowerCase().split(":")[0]);
  if (!hosts.includes("en.tortopani.com")) return;
  return new Response(null, {
    headers: { "x-middleware-rewrite": new URL("/choco_bombs", request.url).toString() },
  });
}
