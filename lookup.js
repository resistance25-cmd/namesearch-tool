// Vercel Serverless Function
// Proxies requests to behindthename.com/api/related.json server-side,
// so the browser never hits CORS and the API key never ships to the client.
//
// Set BTN_API_KEY in your Vercel project's Environment Variables.
// (Settings -> Environment Variables -> add BTN_API_KEY = ga203019723)
// A hardcoded fallback is included so it still works if you skip that step,
// but using the env var is the safer option long-term.

export default async function handler(req, res) {
  const name = (req.query.name || '').trim();

  if (!name) {
    res.status(400).json({ error: 'missing "name" query parameter' });
    return;
  }

  const key = process.env.BTN_API_KEY || 'ga203019723';
  const url = `https://www.behindthename.com/api/related.json?name=${encodeURIComponent(name)}&key=${encodeURIComponent(key)}`;

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();

    // Allow the browser to read this response (same-origin anyway since
    // it's called from the same Vercel deployment, but harmless to set).
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'upstream request failed', detail: String(err) });
  }
}
