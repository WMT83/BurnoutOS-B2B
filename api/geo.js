// api/geo.js — Vercel Edge Function.
// Returns the visitor's 2-letter country from Vercel's reliable edge geolocation,
// for the baseline assessment page to attach to its submission. Same-origin call.
// Vercel injects x-vercel-ip-country on every edge request; no third party needed.
export const config = { runtime: 'edge' };

export default function handler(request) {
  const raw = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
  const ok = /^[A-Z]{2}$/.test(raw) && !['XX', 'ZZ', 'T1'].includes(raw);
  return new Response(JSON.stringify({ country: ok ? raw : null }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
  });
}
