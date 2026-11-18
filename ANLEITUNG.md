# Anleitung – Cool-Tec-Webseite

## Das CMS (Inhalte ändern)
1. **https://cool-tec.onrender.com/admin** öffnen – geht am PC, iPhone, iPad, überall.
2. Mit E-Mail + Passwort anmelden. Beim ersten Mal: oben rechts auf **🔑** klicken und ein eigenes Passwort festlegen.
3. Links den Bereich wählen:
   - **Startseite (Unternehmen)** – Firmenfoto, Text über die Firma, Zahlen, Leistungen, Kontakt
   - **Seite „Projekte“ / Seite „Partner“** – Überschriften, Einleitung, Hintergrundbild, Filter-Bereiche
   - **Projekte** – Referenzen anlegen, ändern, löschen, Reihenfolge mit ↑ ↓
   - **Partner** – Partner mit Logo, Text, „Partner seit“
   - **Weitere Seiten** – Impressum, Datenschutz, eigene Seiten
   - **Firma & Kontakt** – Logo, Öffnungszeiten oben rechts, Telefon, E-Mail, Adresse, Menü, Fußzeile, Google-Texte
   - **Kontakt-Nachrichten** – was Kunden über das Formular geschickt haben
4. **💾 Speichern** – nach wenigen Sekunden ist es auf der Webseite sichtbar.
5. Bilder: **⬆ Bild hochladen** – Fotos werden automatisch verkleinert.
6. Alles, was es nicht als Formularfeld gibt: Knopf **{ } JSON** (Experten-Ansicht).

**Passwort vergessen?** Auf der Anmeldeseite E-Mail eintragen → „Passwort vergessen“.
**Weitere Personen freischalten:** Claude fragen („Bitte X als Redakteur für Cool-Tec freischalten“).

## Gut zu wissen
- Gratis-Hosting (Render Free): Nach 15 Minuten ohne Besucher „schläft“ die Seite; der erste Aufruf dauert dann ca. 30–60 Sekunden.
- Die Seite ist in der Testphase **vor Google versteckt**. Für den Start: CMS → Firma & Kontakt → „Vor Google verstecken“ ausschalten.
- Vor dem echten Start: **Impressum und Datenschutz** durch echte Texte ersetzen, fiktive Projekte/Partner/Zahlen austauschen.
- Eigene Adresse (z. B. www.cool-tec.lu): Domain kaufen und bei Render eintragen – Claude hilft dabei.

## Änderungen am Aussehen / an Funktionen
Das macht Claude – immer so:
1. Arbeit auf einem eigenen **Arbeitszweig** (nie direkt auf `main`)
2. **Tests vor jedem Push** (`npm run check` muss grün sein)
3. Änderung als **Pull Request** nach `main`; GitHub prüft automatisch noch einmal
4. Erst nach dem Zusammenführen veröffentlicht **Render** (nur von `main`)
