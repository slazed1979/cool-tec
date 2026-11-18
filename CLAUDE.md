# Notizen für Claude (Projektkontext)

- Nutzer arbeitet von überall (PC, iPhone) → alles in der **Cloud** (claude.ai/code), nie nur lokal liegen lassen.
- Nutzer ist Programmier-Anfänger → **auf Deutsch**, Schritt für Schritt, alles selbst erledigen, was geht.
- Nutzer ist **farbenblind**: Farben über hell/dunkel erklären, Textkontrast ≥ 4,5:1 messen, Zustände nie nur über Farbe zeigen (immer Symbol/Fettdruck/Form dazu).
- **Kostenregel:** nur Gratis-Dienste (Render Free, Supabase Free, GitHub). Kostenpflichtiges nur nach ausdrücklicher Zustimmung. (Fotos wurden mit dem vorhandenen ElevenLabs-Abo erzeugt.)
- Ziel: Webseite für **Cool-Tec** (Klimageräte aller Art), 4 Reiter: Unternehmen (/), Projekte (/projekte), Partner (/partner), Jobs (/jobs, Detail /jobs/<id>, Bewerbung per E-Mail oder Formular mit vorbelegtem Betreff). Vorbild-Layout: BM Project (Kopfzeile mit Öffnungszeiten/Telefon/E-Mail rechts oben, Logo links, Reiter rechts, großes Startbild). Inhalte fiktiv.
- Repo: https://github.com/slazed1979/cool-tec (privat). Render-Dienst `cool-tec` (Workspace „My Workspace“, Region Frankfurt, Free).

## Arbeitsweise (Pflicht)
1. Nie direkt auf `main`. Immer eigener Arbeitszweig (`claude/…`).
2. Vor jedem Push: `npm run check` (= CMS bauen + `npm test`). Nur bei **grün** pushen.
3. Pull Request nach `main`; GitHub Actions (`.github/workflows/test.yml`) prüft Build + Tests.
4. Nur bei grünem PR-Check zusammenführen. **Render veröffentlicht nur `main`** (Auto-Deploy, keine PR-Vorschauen).
5. Bei Rot: nicht zusammenführen, Fehler beheben. Nie Tests abschalten, um grün zu werden.
- `gh` funktioniert in der Cloud-Umgebung nicht → PR-Link (`https://github.com/slazed1979/cool-tec/pull/new/<branch>`) dem Nutzer geben.

## Aufbau
- `server/` Node.js ohne Framework (Node ≥ 22): `index.mjs` Routen + Kontaktformular, `views.mjs` HTML-Vorlagen, `data.mjs` Daten (Supabase → Fallback `data/seed.json`, 30 s Cache, `/api/refresh` leert ihn), `icons.mjs` Symbole.
- `public/` CSS/JS, Bilder (`img/`, WebP), Partner-Logos (`img/partner/*.svg`, fiktiv), Logo (`brand/`), Schrift Manrope selbst gehostet (`fonts/`, keine Google Fonts).
- `admin/` CMS (Vite + React). Felder je Inhaltsart: `admin/src/schema.js`, Eingabefelder: `admin/src/fields.jsx`. Unter `/admin` ausgeliefert, wird beim Deploy gebaut.
- Farben (aus dem Logo): Marine `#0d2a42` (Kopf/Fuß), Blau `#0a6aa8` (Links/Knöpfe, 5,8:1), Grün `#2e7d1f` (Akzent, 5,2:1), Eisblau `#eef6fb` (Flächen). Originales Logoblau `#0090d8` nur Deko.

## Zweisprachig (DE/FR)
- Umschalter **DE | FR** oben rechts in der Topbar. Wahl wird im Cookie `lang` gemerkt (`/lang/de`, `/lang/fr?r=<zurück>`); ohne Cookie entscheidet die Browsersprache, sonst DE.
- Inhalte: jeder Text kann String (gilt für beide Sprachen) oder `{ de, fr }` sein. `server/data.mjs` → `localize()`, fehlt FR wird DE gezeigt.
- Feste Texte (Knöpfe, Formular, Fußzeile): `server/i18n.mjs` (Schlüssel = deutscher Text). Neue Festtexte immer mit `T('…')` schreiben und dort übersetzen.
- CMS: Textfelder (text/textarea/richtext/strings) sind automatisch DE/FR; `mono: true` in `admin/src/schema.js` = sprachneutral (Telefon, Jahr, Namen …).
- Startübersetzungen: `tools/i18n/fr.mjs` + `apply.mjs` (`bilingual()`), genutzt von `tools/seed.mjs`.

## Datenbank
- Supabase-Projekt **Familienplaner** (`qkcfrqlaaeooflyzcryq`) – Gratis-Kontingent war voll, Nutzer hat das so entschieden. **Alles mit Präfix `cooltec`**, Familienplaner-Tabellen nie anfassen.
- `cooltec_content(collection,id,data,sort,published)`: Sammlungen `settings` (id site), `home`, `projectsPage`, `partnersPage`, `jobsPage` (je 1 Zeile), `projects`, `partners`, `jobs`, `pages`.
- `cooltec_messages` (Kontaktformular, anon darf nur einfügen), `cooltec_editors` (E-Mails der Redakteure), Funktion `cooltec_is_editor()`, Storage-Bucket `cooltec-media`. SQL: `supabase/schema.sql`.
- Redakteur hinzufügen: `insert into public.cooltec_editors(email) values ('…')` + Supabase-Auth-Benutzer anlegen.
- Supabase ist aus der Cloud-Umgebung nicht direkt erreichbar → Datenbank über das Supabase-MCP-Werkzeug bearbeiten.
- `tools/seed.mjs` erzeugt `data/seed.json` (Startinhalte/Notlösung). Das CMS ist danach die Quelle der Wahrheit.

## Prüfen
- `npm test` → `tests/run.mjs`: Server mit seed.json, prüft Reiter/Logo/Öffnungszeiten, Sprachumschalter + FR-Texte, Formular, Spam-Falle, 404, noindex, Code-Filter, Alt-Texte, eine h1 pro Seite, klickt alle Seiten/Bilder in DE und FR durch. Neue Funktion → Prüfung ergänzen.
- Responsive: mit Playwright auf iPhone-Größe prüfen (kein waagrechtes Scrollen).
