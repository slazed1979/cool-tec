// Macht aus deutschen Texten zweisprachige { de, fr }, wenn es eine Übersetzung in fr.mjs gibt.
// Texte ohne Übersetzung bleiben unverändert (gelten dann für beide Sprachen).
// Bereits zweisprachige Felder werden nicht angefasst → mehrfach ausführen ist ungefährlich.
import FR from './fr.mjs';

const isTr = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0 && Object.keys(v).every((k) => k === 'de' || k === 'fr');

export function bilingual(v) {
  if (typeof v === 'string') return FR[v] ? { de: v, fr: FR[v] } : v;
  if (Array.isArray(v)) return v.map(bilingual);
  if (!v || typeof v !== 'object' || isTr(v)) return v;
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, bilingual(x)]));
}
