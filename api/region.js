export const config = { runtime: 'edge' };

export default function handler(request) {
  const country = request.headers.get('x-vercel-ip-country') ?? '';
  const region = country === 'ZA' ? 'ZA' : 'AUD';
  return new Response(JSON.stringify({ region, country }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': 'https://burnout-os.app'
    }
  });
}
