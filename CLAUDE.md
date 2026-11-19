# Notizen für Claude (Projektkontext)

- Nutzer arbeitet von überall (PC, iPhone) → alles in der **Cloud** (claude.ai/code), nie nur lokal liegen lassen.
- Nutzer ist Programmier-Anfänger → **auf Deutsch**, Schritt für Schritt, alles selbst erledigen, was geht.
- Nutzer ist **farbenblind**: Farben über hell/dunkel erklären, Textkontrast ≥ 4,5:1 messen, Zustände nie nur über Farbe zeigen (immer Symbol/Fettdruck/Form dazu).
- **Kostenregel:** nur Gratis-Dienste (Render Free, Supabase Free, GitHub). Kostenpflichtiges nur nach ausdrücklicher Zustimmung. (Fotos wurden mit dem vorhandenen ElevenLabs-Abo erzeugt.)
- Ziel: Webseite für **Cool-Tec** (Klimageräte aller Art), 4 Reiter: Unternehmen (/), Projekte (/projekte), Partner (/partner), Jobs (/jobs, Detail /jobs/<id>, Bewerbung per E-Mail oder Formular mit vorbelegtem Betreff). Vorbild-Layout: BM Project (Kopfzeile mit Öffnungszeiten/Telefon/E-Mail rechts oben, Logo links, Reiter rechts, großes Startbild). Inhalte fiktiv.
- Repo: https://github.com/slazed1979/cool-tec (privat). Render-Dienst `cool-tec` (Workspace „My Workspace“, Region Frankfurt, Free).

## Arbeitsweise (Pflicht, wie BerdorfSite)
Nie direkt auf `main` arbeiten. Immer auf einem eigenen Arbeitszweig (`claude/…`) committen.
1. **Vor jedem Push:** `npm run check` (= CMS bauen + `npm test`). Nur wenn alles **grün** ist, pushen.
2. **Push auf den Arbeitszweig** → GitHub Actions (`.github/workflows/auto-merge.yml`) prüft dort noch einmal Build + Tests.
3. **Nur bei Grün** legt GitHub den Pull Request nach `main` an und führt ihn **automatisch** zusammen (ausdrücklicher Wunsch des Nutzers – anders als BerdorfSite, wo der Nutzer selbst klickt). Erst dann veröffentlicht Render.
4. **Bei Rot:** nichts wird zusammengeführt, `main` und die Live-Seite bleiben unverändert. Fehler beheben, neu prüfen, erneut pushen. Nie Tests abschalten, um grün zu werden.
5. Nach dem Push prüfen, ob Render die neue Version live hat (`list_deploys`), und dem Nutzer Bescheid geben.
Keine Arbeit nur lokal liegen lassen – der Arbeitszweig wird immer gepusht.
- **Render** (`cool-tec`) veröffentlicht **nur** den Branch `main` (Auto-Deploy bei Commit, keine PR-Vorschauen).
- Vorschau: https://cool-tec.onrender.com (Free-Plan: schläft nach 15 min, erster Aufruf dauert ~30–60 s). CMS: `/admin`.
- Ändern sich Inhalte in der Datenbank mit (neue Felder/Sammlungen), DB-Update erst einspielen, wenn Render die neue Version live hat.
- `.github/workflows/test.yml` prüft zusätzlich jeden manuell angelegten Pull Request.
- `gh` funktioniert in der Cloud-Umgebung nicht. Falls Auto-Merge ausfällt: PR-Link `https://github.com/slazed1979/cool-tec/pull/new/<branch>` dem Nutzer geben; er führt nach grünem Check selbst zusammen.

## Aufbau
- `server/` Node.js ohne Framework (Node ≥ 22): `index.mjs` Routen + Kontaktformular, `views.mjs` HTML-Vorlagen, `data.mjs` Daten (Supabase → Fallback `data/seed.json`, 30 s Cache, `/api/refresh` leert ihn), `icons.mjs` Symbole.
- App-Symbol (Startbildschirm): `public/brand/` `apple-touch-icon.png`, `icon-192/512.png`, `icon-maskable-512.png`, `site.webmanifest`; CMS: `cms-*.png` + `cms.webmanifest`. `display: browser` – bewusst keine echte App. Erzeugt aus dem HD-Logo (Kreis mit Bär + Schriftzug).
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
- **E-Mail-Benachrichtigung:** `server/mail.mjs` → Brevo-API (HTTPS, gratis 300/Tag; Render Free blockiert SMTP). Render-Umgebungsvariablen `BREVO_API_KEY` (geheim, nur der Nutzer trägt ihn im Render-Dashboard ein – nie in Chat/Code) + `MAIL_FROM` (in Brevo bestätigter Absender). Empfänger: CMS-Feld `settings.notifyEmails` (Komma-Liste). Ohne Schlüssel/Empfänger: kein Versand. ⚠ `info@cool-tec.lu` war ursprünglich eine fiktive Adresse – Nutzer muss bestätigen, dass sie existiert. **⏸ AUF EIS (19.11.2026):** Einrichtung erst nach Umzug auf den endgültigen Server mit Domain cool-tec.lu. Brevo-Konto existiert; Gmail als Absender geht NICHT (DMARC) → Domain cool-tec.lu in Brevo authentifizieren (DNS), Absender `…@cool-tec.lu`, dann Schlüssel beim neuen Hosting hinterlegen. Beim Umzug aktiv daran erinnern.
- `cooltec_messages` (Kontaktformular, anon darf nur einfügen), `cooltec_editors` (E-Mails der Redakteure), Funktion `cooltec_is_editor()`, Storage-Bucket `cooltec-media`. SQL: `supabase/schema.sql`.
- **Benutzerverwaltung im CMS** (👥 Benutzer, `admin/src/Users.jsx`): Rollen `admin` (verwaltet Benutzer) / `editor`. DB-Funktionen `cooltec_is_admin`, `cooltec_list_editors`, `cooltec_create_editor`, `cooltec_set_password`, `cooltec_set_role`, `cooltec_remove_editor` (SECURITY DEFINER, prüfen selbst auf Admin). Nutzer (slazed@…) ist Admin. Benutzernamen ohne @ → `name@team.cool-tec.lu` (`admin/src/login.js`).
- Supabase ist aus der Cloud-Umgebung nicht direkt erreichbar → Datenbank über das Supabase-MCP-Werkzeug bearbeiten.
- `tools/seed.mjs` erzeugt `data/seed.json` (Startinhalte/Notlösung). Das CMS ist danach die Quelle der Wahrheit.

## Prüfen
- `npm test` → `tests/run.mjs`: Server mit seed.json, prüft Reiter/Logo/Öffnungszeiten, Sprachumschalter + FR-Texte, Formular, Spam-Falle, 404, noindex, Code-Filter, Alt-Texte, eine h1 pro Seite, klickt alle Seiten/Bilder in DE und FR durch. Neue Funktion → Prüfung ergänzen.
- Responsive: mit Playwright auf iPhone-Größe prüfen (kein waagrechtes Scrollen).
