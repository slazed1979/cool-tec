// Automatische Tests der Webseite: npm test
// Startet den Server mit data/seed.json (ohne Datenbank), prüft wichtige Adressen
// und klickt sich durch alle Seiten (jeder interne Link und jedes Bild muss funktionieren).
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = 3100 + Math.floor(Math.random() * 800);
const BASE = `http://localhost:${PORT}`;
const fails = [];
let checks = 0;
const ok = (cond, msg) => {
  checks++;
  if (!cond) fails.push(msg);
};

const server = spawn(process.execPath, ['server/index.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), CONTENT_SOURCE: 'seed' }, stdio: ['ignore', 'pipe', 'pipe'] });
let log = '';
server.stdout.on('data', (d) => (log += d));
server.stderr.on('data', (d) => (log += d));
const get = (path, opts = {}) => fetch(BASE + path, { redirect: 'manual', ...opts });
const post = (body) => get('/kontakt', { method: 'POST', body: new URLSearchParams(body).toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' } });

try {
  for (let i = 0; ; i++) {
    try {
      if ((await get('/healthz')).ok) break;
    } catch {}
    if (i > 50) throw new Error('Server startet nicht:\n' + log);
    await new Promise((r) => setTimeout(r, 200));
  }

  // ---- 1. Inhalte & Grundfunktionen
  const status = await (await get('/api/status')).json();
  ok(status.projects >= 3 && status.partners >= 3 && status.pages >= 2, 'api/status: zu wenig Inhalte ' + JSON.stringify(status));
  const home = await (await get('/')).text();
  ok(home.includes('<html lang="de">'), 'Startseite: Sprache fehlt');
  ok(/class="brand"[\s\S]*?\/brand\/logo\.png/.test(home), 'Logo oben links fehlt');
  ok(home.includes('Montag – Freitag') && home.includes('info@cool-tec.lu'), 'Öffnungszeiten/E-Mail oben rechts fehlen');
  ok((home.match(/<nav id="hauptmenu"[\s\S]*?<\/ul>/)?.[0].match(/<li>/g) || []).length === 3, 'Hauptmenü hat nicht genau 3 Reiter');
  ok(home.includes('aria-current="page"'), 'aktiver Reiter nicht markiert');
  ok(home.includes('id="kontakt"') && home.includes('action="/kontakt"'), 'Kontaktformular fehlt');
  ok(home.includes('name="viewport"'), 'Responsive: viewport fehlt');
  ok(!/fonts\.(googleapis|gstatic)\.com|cdn\.|unpkg/.test(home), 'Fremde Schriften/Skripte eingebunden (Datenschutz!)');
  ok((await get('/fonts/manrope-latin-wght-normal.woff2')).status === 200, 'Schriftdatei fehlt');
  ok((await (await get('/robots.txt')).text()).includes('Disallow: /'), 'robots.txt sperrt Google in der Testphase nicht');
  ok((await get('/')).headers.get('x-robots-tag')?.includes('noindex'), 'Startseite ohne noindex (Testphase)');
  ok((await get('/gibt-es-nicht')).status === 404, '404-Seite liefert nicht 404');
  ok((await get('/projekte/gibt-es-nicht')).status === 404, 'unbekanntes Projekt liefert nicht 404');
  ok((await get('/css/%E0%A4%A')).status !== 500, 'kaputte Adresse führt zu Fehler 500');
  ok((await get('/img/../server/index.mjs')).status !== 200, 'Ordner-Ausbruch möglich');
  ok((await get('/admin-icon/snow.svg')).status === 200, 'CMS-Symbole fehlen');

  // Projekt-Filter ohne JavaScript
  const filt = await (await get('/projekte?bereich=Privat')).text();
  const shown = (filt.match(/<article class="card project-card"/g) || []).length;
  const hidden = (filt.match(/<article hidden class="card project-card"/g) || []).length;
  ok(shown >= 1 && hidden >= 1, 'Projekt-Filter funktioniert nicht');

  // ---- 2. Kontaktformular
  let r = await post({ website: 'bot', name: 'x', email: 'x@y.lu', message: 'hi', back: '/' });
  ok(r.status === 303 && r.headers.get('location').includes('gesendet=ok'), 'Spam-Falle antwortet falsch');
  r = await post({ name: 'Test', email: 'kaputt', message: 'hi', back: '/partner' });
  ok(r.status === 303 && r.headers.get('location') === '/partner?gesendet=err#kontakt', 'Formular: ungültige E-Mail wird nicht abgelehnt');
  r = await post({ name: 'Test', email: 'test@example.lu', message: 'Hallo', back: 'https://boese.example' });
  ok(r.headers.get('location') === '/?gesendet=ok#kontakt', 'Formular: fremde Rücksprung-Adresse nicht abgefangen');
  ok((await (await get('/?gesendet=ok')).text()).includes('Vielen Dank'), 'Formular: Danke-Meldung fehlt');
  ok((await (await get('/?gesendet=err')).text()).includes('role="alert"'), 'Formular: Fehlermeldung fehlt');

  // ---- 3. Schutz vor eingeschleustem Code im Text-Editor
  const { rich, esc } = await import('../server/views.mjs');
  const bad = rich('<p onclick="x()">a</p><script>alert(1)</script><a href="javascript:alert(1)">b</a><iframe src="x"></iframe>');
  ok(!/onclick|<script|javascript:|<iframe/i.test(bad), 'rich() lässt gefährlichen Code durch: ' + bad);
  ok(esc('<b>"&') === '&lt;b&gt;&quot;&amp;', 'esc() maskiert nicht richtig');

  // ---- 4. Alle Seiten durchklicken
  const seen = new Set();
  const queue = [['/', 'Start']];
  let pages = 0;
  while (queue.length) {
    const [p, from] = queue.shift();
    if (seen.has(p)) continue;
    seen.add(p);
    const res = await get(p);
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location') || '';
      if (loc.startsWith('/')) queue.push([loc.split('#')[0], p]);
      continue;
    }
    checks++;
    if (res.status !== 200) {
      fails.push(`${p} → ${res.status} (Link auf ${from})`);
      continue;
    }
    if (!(res.headers.get('content-type') || '').includes('html')) continue;
    pages++;
    const html = await res.text();
    ok((html.match(/<h1[\s>]/g) || []).length === 1, `${p}: nicht genau eine Hauptüberschrift (h1)`);
    for (const m of html.matchAll(/<img\b[^>]*>/g)) ok(/\balt="/.test(m[0]), `${p}: Bild ohne alt-Text ${m[0].slice(0, 80)}`);
    for (const m of html.matchAll(/(?:href|src)="([^"]+)"|url\('([^']+)'\)/g)) {
      const u = (m[1] || m[2]).replace(/&amp;/g, '&').split('#')[0];
      if (!u || !u.startsWith('/') || u.startsWith('//') || u.startsWith('/admin')) continue;
      if (/^\/(css|js|img|brand|fonts)\//.test(u)) {
        const f = u.split('?')[0];
        if (!seen.has(f)) {
          seen.add(f);
          checks++;
          const a = await get(f);
          if (a.status !== 200) fails.push(`Datei ${f} → ${a.status} (auf ${p})`);
        }
        continue;
      }
      if (!seen.has(u)) queue.push([u, p]);
    }
  }
  ok(pages >= 12, 'zu wenige Seiten gefunden: ' + pages);
  console.log(`Seiten durchgeklickt: ${pages}`);

  // ---- 5. Daten-Dateien
  const seed = JSON.parse(readFileSync(ROOT + 'data/seed.json', 'utf8'));
  for (const r of seed) for (const v of JSON.stringify(r.data).match(/"\/(?:img|brand)\/[^"]+"/g) || []) ok(existsSync(ROOT + 'public' + JSON.parse(v)), `Bild fehlt im Repo: ${v}`);
  const cfg = JSON.parse(readFileSync(ROOT + 'data/supabase.json', 'utf8'));
  ok(!/service_role|sb_secret/.test(JSON.stringify(cfg)), 'Geheimer Supabase-Schlüssel im Code!');
} catch (e) {
  fails.push(e.stack || String(e));
} finally {
  server.kill();
}

if (/\bError\b|TypeError|ReferenceError/.test(log)) fails.push('Fehler im Server-Protokoll:\n' + log.split('\n').filter((l) => /Error/.test(l)).slice(0, 5).join('\n'));
console.log(`Prüfungen: ${checks}, Fehler: ${fails.length}`);
for (const f of fails.slice(0, 40)) console.log('  ✗ ' + f);
console.log(fails.length ? '❌ ROT – nicht nach main zusammenführen!' : '✅ GRÜN – alles in Ordnung');
process.exit(fails.length ? 1 : 0);
