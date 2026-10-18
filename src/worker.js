export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle newsletter subscription
    if (url.pathname === '/api/subscribe' && request.method === 'POST') {
      return handleSubscribe(request, env);
    }

    // /surprise: password check, and the files behind it (see wrangler.jsonc run_worker_first)
    if (url.pathname === '/surprise/unlock') {
      return handleSurpriseUnlock(request, env, url);
    }
    if (url.pathname.startsWith('/surprise/clips/') || url.pathname.startsWith('/surprise/thumbs/')) {
      return handleSurpriseAsset(request, env);
    }

    // All other requests: serve static assets
    return env.ASSETS.fetch(request);
  }
};

/* ──────────────────────────────────────────────────────────────
   /surprise — password gate

   The page itself (public/surprise/index.html) is public and only shows a lock screen.
   What is protected are the clips and thumbnails: the Worker only serves
   /surprise/clips/* and /surprise/thumbs/* to browsers that carry a cookie that
   POST /surprise/unlock hands out after a correct password.

   Password: "lala", any capitalization. Change it by setting a SURPRISE_PASSWORD variable
   in Cloudflare (or edit the default below). Optionally set a SURPRISE_SECRET secret, a long
   random string, so the cookie can't be worked out from this file.
   ────────────────────────────────────────────────────────────── */

const SURPRISE_DEFAULT_PASSWORD = 'lala';
const SURPRISE_COOKIE = 'surprise_pass';
const SURPRISE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const normalizePassword = s => String(s == null ? '' : s).trim().toLowerCase();

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

// The cookie value: an HMAC that only this Worker can produce.
async function surpriseToken(env) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(env.SURPRISE_SECRET || 'benares-surprise-v1'),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('surprise-unlocked'));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function sameString(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

async function isSurpriseUnlocked(request, env) {
  const cookie = readCookie(request, SURPRISE_COOKIE);
  return !!cookie && sameString(cookie, await surpriseToken(env));
}

async function handleSurpriseUnlock(request, env, url) {
  // GET: is this browser already unlocked?
  if (request.method === 'GET') {
    return jsonResponse({ ok: await isSurpriseUnlocked(request, env) });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false }, 405, { Allow: 'GET, POST' });
  }

  let password = '';
  try {
    password = (await request.json()).password;
  } catch {
    return jsonResponse({ ok: false }, 400);
  }

  const expected = normalizePassword(env.SURPRISE_PASSWORD || SURPRISE_DEFAULT_PASSWORD);
  if (!sameString(normalizePassword(password), expected)) {
    return jsonResponse({ ok: false }, 401);
  }

  const cookie = [
    `${SURPRISE_COOKIE}=${await surpriseToken(env)}`,
    'Path=/surprise',
    `Max-Age=${SURPRISE_COOKIE_MAX_AGE}`,
    'HttpOnly',
    'SameSite=Lax',
    url.protocol === 'https:' ? 'Secure' : '',
  ].filter(Boolean).join('; ');
  return jsonResponse({ ok: true }, 200, { 'Set-Cookie': cookie });
}

async function handleSurpriseAsset(request, env) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  if (!(await isSurpriseUnlocked(request, env))) {
    return new Response('Locked', { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  return withRange(request, await env.ASSETS.fetch(request));
}

// Serve an asset response, honouring a single "Range: bytes=a-b" request. Browsers seek in video
// with Range, and iOS Safari only plays video from servers that answer it with 206. If the assets
// service already answered with 206 (or anything but 200) the response is passed through as is.
async function withRange(request, res) {
  const headers = new Headers(res.headers);
  headers.set('Accept-Ranges', 'bytes');
  // behind a password: browsers may keep it for a week, shared caches must not
  if (res.ok) headers.set('Cache-Control', 'private, max-age=604800');

  const m = /^bytes=(\d*)-(\d*)$/.exec((request.headers.get('Range') || '').trim());
  if (res.status !== 200 || request.method === 'HEAD' || !m || (m[1] === '' && m[2] === '')) {
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }

  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  let start, end;
  if (m[1] === '') {                       // "-500": the last 500 bytes
    start = Math.max(0, size - Number(m[2]));
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) {
    headers.set('Content-Range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(buf.slice(start, end + 1), { status: 206, headers });
}

async function handleSubscribe(request, env) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  let email;
  try {
    const body = await request.json();
    email = body.email;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers });
  }

  const server = env.MAILCHIMP_SERVER;
  const listId = env.MAILCHIMP_LIST_ID;
  const apiKey = env.MAILCHIMP_API_KEY;

  const res = await fetch(
    `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: email, status: 'subscribed' }),
    }
  );

  const data = await res.json();

  // Already subscribed is not an error
  if (res.ok || data.title === 'Member Exists') {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ error: data.detail || 'Error' }), { status: 500, headers });
}
