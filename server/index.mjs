// Webserver der Cool-Tec-Webseite (ohne Framework, nur Node.js ≥ 22).
// Start: npm start  → http://localhost:3000   CMS: /admin
import http from 'node:http';
import { createGzip } from 'node:zlib';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getData, invalidate, saveMessage, source, LANGS } from './data.mjs';
import * as V from './views.mjs';
import { icon, ICON_NAMES } from './icons.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const ADMIN = join(ROOT, 'admin', 'dist');
const PORT = Number(process.env.PORT) || 3000;
const VERSION = Date.now().toString(36);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};
const PACKABLE = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt', '.webmanifest']);
const SECURITY = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' };

const safeDecode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

function sendFile(res, file, cache) {
  const st = statSync(file);
  const ext = extname(file).toLowerCase();
  const type = TYPES[ext] || 'application/octet-stream';
  if (PACKABLE.has(ext) && st.size > 1024 && /\bgzip\b/.test(res.req.headers['accept-encoding'] || '')) {
    res.writeHead(200, { ...SECURITY, 'Content-Type': type, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding', 'Cache-Control': cache });
    return createReadStream(file).pipe(createGzip()).pipe(res);
  }
  res.writeHead(200, { ...SECURITY, 'Content-Type': type, 'Content-Length': st.size, 'Cache-Control': cache });
  createReadStream(file).pipe(res);
}

function tryStatic(res, base, path, cache) {
  const file = normalize(join(base, safeDecode(path)));
  if (!file.startsWith(base)) return false;
  if (existsSync(file) && statSync(file).isFile()) {
    sendFile(res, file, cache);
    return true;
  }
  return false;
}

function html(res, body, status = 200, noindex = true, lang) {
  const h = { ...SECURITY, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', Vary: 'Cookie, Accept-Language' };
  if (lang) h['Content-Language'] = lang;
  if (noindex) h['X-Robots-Tag'] = 'noindex, nofollow';
  res.writeHead(status, h);
  res.end(body);
}

function redirect(res, to, status = 302) {
  res.writeHead(status, { Location: to });
  res.end();
}

function readBody(req, max = 20000) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > max) {
        reject(new Error('zu groß'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

// Spam-Bremse fürs Kontaktformular: max. 5 Nachrichten pro Stunde und IP
const sentBy = new Map();
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=').map(safeDecode)).filter((x) => x[0]));
}
const CODES = LANGS.map((l) => l.code);
/** Sprache: 1. gewählte (Cookie), 2. Browser-Sprache, 3. Deutsch */
function pickLang(req) {
  const c = cookies(req).lang;
  if (CODES.includes(c)) return c;
  const wanted = (req.headers['accept-language'] || '').toLowerCase().split(',').map((x) => x.trim().slice(0, 2));
  return wanted.find((w) => CODES.includes(w)) || CODES[0];
}
const localPath = (p) => (typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !p.includes('\\') ? p.split('#')[0].split('?')[0] : '/');

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const path = safeDecode(url.pathname).replace(/\/+$/, '') || '/';

    if (path === '/healthz') return res.end('ok');

    // ---- Symbole für die Auswahl im CMS
    const ic = path.match(/^\/admin-icon\/(\w+)\.svg$/);
    if (ic && ICON_NAMES.includes(ic[1])) {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' });
      return res.end(icon(ic[1], '', 24).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace('currentColor', '#0a6aa8'));
    }

    // ---- CMS (React-App aus admin/dist)
    if (path === '/admin' || path.startsWith('/admin/')) {
      const sub = path.slice('/admin'.length) || '/index.html';
      if (sub !== '/' && tryStatic(res, ADMIN, sub, sub.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache')) return;
      const index = join(ADMIN, 'index.html');
      if (existsSync(index)) return sendFile(res, index, 'no-cache');
      return html(res, '<h1>CMS ist noch nicht gebaut</h1><p>Bitte <code>npm run build</code> ausführen.</p>', 503);
    }

    // ---- API
    if (path === '/api/refresh') {
      invalidate();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end('{"ok":true}');
    }
    if (path === '/api/status') {
      const d = await getData();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      return res.end(JSON.stringify({ source, languages: CODES, projects: d.projects.length, partners: d.partners.length, jobs: d.jobs.length, pages: d.pages.length }));
    }

    // ---- Statische Dateien
    if (/^\/(css|js|img|brand|fonts)\//.test(path)) {
      const long = /^\/(img|fonts|brand)\//.test(path) ? 'public, max-age=2592000' : 'public, max-age=300';
      if (tryStatic(res, PUBLIC, path, long)) return;
      return html(res, 'Nicht gefunden', 404);
    }

    // ---- Sprache wechseln: /lang/de oder /lang/fr (merkt sich die Wahl 1 Jahr)
    const lm = path.match(/^\/lang\/([a-z]{2})$/);
    if (lm && CODES.includes(lm[1])) {
      res.setHeader('Set-Cookie', `lang=${lm[1]}; Path=/; Max-Age=31536000; SameSite=Lax`);
      const r = url.searchParams.get('r') || '/';
      return redirect(res, r.startsWith('/') && !r.startsWith('//') && !r.includes('\\') ? r : '/');
    }

    const lang = pickLang(req);
    const data = await getData(lang);
    const site = data.site;
    const noindex = site.noindex !== false;
    if (path === '/robots.txt') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(noindex ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nDisallow: /admin\n');
    }
    const query = url.searchParams.get('bereich') ? '?bereich=' + encodeURIComponent(url.searchParams.get('bereich')) : '';
    const ctx = { data, site, lang, version: VERSION, path, query, sent: url.searchParams.get('gesendet'), cat: url.searchParams.get('bereich') || '' };
    const page = (body, status = 200) => html(res, body, status, noindex, lang);

    // ---- Kontaktformular absenden
    if (path === '/kontakt' && req.method === 'POST') {
      const form = new URLSearchParams(await readBody(req));
      const back = localPath(form.get('back'));
      const done = (r) => redirect(res, `${back}?gesendet=${r}#kontakt`, 303);
      if (form.get('website')) return done('ok'); // Spam-Falle: Bots füllen das versteckte Feld aus
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      const now = Date.now();
      const list = (sentBy.get(ip) || []).filter((t) => now - t < 3600_000);
      if (list.length >= 5) return done('err');
      const msg = {};
      for (const k of ['name', 'email', 'phone', 'subject', 'message']) msg[k] = (form.get(k) || '').trim().slice(0, k === 'message' ? 5000 : k === 'phone' ? 60 : 200);
      if (!msg.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email) || !msg.message) return done('err');
      sentBy.set(ip, [...list, now]);
      if (sentBy.size > 5000) for (const [k, v] of sentBy) if (now - v[v.length - 1] > 3600_000) sentBy.delete(k);
      try {
        await saveMessage(msg);
        return done('ok');
      } catch (e) {
        console.warn('[kontakt]', e.message);
        return done('err');
      }
    }
    if (path === '/kontakt') return redirect(res, '/#kontakt');

    // ---- Seiten
    if (path === '/' || path === '/index.html') return page(V.home(ctx));
    if (path === '/projekte') return page(V.projectList(ctx));
    const pm = path.match(/^\/projekte\/([\w.-]+)$/);
    if (pm) {
      const p = data.projects.find((x) => x.id === pm[1]);
      if (p) return page(V.projectDetail(ctx, p));
    }
    if (path === '/partner') return page(V.partnerList(ctx));
    if (path === '/jobs') return page(V.jobList(ctx));
    const jm = path.match(/^\/jobs\/([\w.-]+)$/);
    if (jm) {
      const j = data.jobs.find((x) => x.id === jm[1]);
      if (j) return page(V.jobDetail(ctx, j));
    }
    const cp = data.pageByPath.get(path);
    if (cp) return page(V.page(ctx, cp));
    return page(V.notFound(ctx), 404);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) html(res, '<h1>Fehler</h1><p>Bitte später noch einmal versuchen.</p>', 500);
  }
});

server.listen(PORT, () => {
  console.log(`Cool-Tec-Webseite läuft auf http://localhost:${PORT}  (CMS: /admin)`);
  getData().then(() => console.log('Inhalte geladen aus:', source));
});
