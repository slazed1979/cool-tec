// Inhalte laden: zuerst aus Supabase (Tabelle cooltec_content), sonst aus data/seed.json.
// Ergebnis wird 30 Sekunden zwischengespeichert; das CMS ruft nach dem Speichern /api/refresh auf.
import { readFileSync } from 'node:fs';
import config from '../data/supabase.json' with { type: 'json' };

const SB_URL = process.env.SUPABASE_URL || config.url;
const SB_KEY = process.env.SUPABASE_KEY || config.key;
const TABLE = config.table;
const TTL = 30_000;

export const LANGS = [
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'fr', label: 'FR', name: 'Français' },
];
const CODES = LANGS.map((l) => l.code);

let cache = null; // Rohdaten (alle Sprachen)
let perLang = new Map(); // fertig übersetzte Daten je Sprache
let cacheAt = 0;
let loading = null;
export let source = 'seed';

function fromSeed() {
  return JSON.parse(readFileSync(new URL('../data/seed.json', import.meta.url), 'utf8')).filter((r) => r.published !== false);
}

async function fromSupabase() {
  const res = await fetch(`${SB_URL}/rest/v1/${TABLE}?select=collection,id,data,sort&published=eq.true&order=sort.asc`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const rows = await res.json();
  if (!rows.some((r) => r.collection === 'settings')) throw new Error(`${TABLE} ist leer`);
  return rows;
}

// Jeder Text kann eine Zeichenkette sein (gilt für alle Sprachen) oder { de: '…', fr: '…' }.
const isTr = (o) => o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).length > 0 && Object.keys(o).every((k) => CODES.includes(k));
const filled = (x) => x != null && (Array.isArray(x) ? x.length > 0 : String(x).trim() !== '');
/** Text in der gewünschten Sprache – fehlt die Übersetzung, wird die andere Sprache gezeigt */
export function localize(v, lang) {
  if (Array.isArray(v)) return v.map((x) => localize(x, lang));
  if (!v || typeof v !== 'object') return v;
  if (isTr(v)) {
    for (const l of [lang, ...CODES]) if (filled(v[l])) return localize(v[l], lang);
    return '';
  }
  const out = {};
  for (const [k, x] of Object.entries(v)) out[k] = localize(x, lang);
  return out;
}

/** Zeilen → { site, home, projectsPage, partnersPage, projects[], partners[], pages[] } */
function prepare(rows, lang) {
  const seed = localize(fromSeed(), lang); // fehlende Einzel-Inhalte (z. B. neu eingeführte) aus seed.json ergänzen
  const single = (col) => (rows.find((r) => r.collection === col) || seed.find((r) => r.collection === col) || { data: {} }).data;
  const list = (col) => rows.filter((r) => r.collection === col).sort((a, b) => a.sort - b.sort).map((r) => ({ ...r.data, id: r.id }));
  const d = {
    site: single('settings'),
    home: single('home'),
    projectsPage: single('projectsPage'),
    partnersPage: single('partnersPage'),
    projects: list('projects'),
    partners: list('partners'),
    pages: list('pages'),
  };
  d.pageByPath = new Map(d.pages.map((p) => [p.path, p]));
  return d;
}

export async function getData(lang = 'de') {
  if (!cache || Date.now() - cacheAt >= TTL) {
    loading ??= (async () => {
      try {
        if (process.env.CONTENT_SOURCE === 'seed') throw new Error('CONTENT_SOURCE=seed');
        cache = await fromSupabase();
        source = 'supabase';
      } catch (e) {
        if (!cache || source === 'seed') {
          if (process.env.CONTENT_SOURCE !== 'seed') console.warn('[data] Supabase nicht erreichbar → seed.json:', e.message);
          cache = fromSeed();
          source = 'seed';
        } else console.warn('[data] Supabase-Fehler, nutze letzte Inhalte:', e.message);
      }
      perLang = new Map();
      cacheAt = Date.now();
      loading = null;
    })();
    await loading;
  }
  if (!CODES.includes(lang)) lang = CODES[0];
  if (!perLang.has(lang)) perLang.set(lang, prepare(localize(cache, lang), lang));
  return perLang.get(lang);
}

export function invalidate() {
  cacheAt = 0;
}

/** Nachricht aus dem Kontaktformular speichern (öffentlicher Schlüssel darf nur EINFÜGEN) */
export async function saveMessage(msg) {
  if (process.env.CONTENT_SOURCE === 'seed') return; // Tests: nichts in die echte Datenbank schreiben
  const res = await fetch(`${SB_URL}/rest/v1/${config.messages}`, {
    method: 'POST',
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(msg),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
}
