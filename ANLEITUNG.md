# Anleitung – Cool-Tec-Webseite

## Das CMS (Inhalte ändern)
1. **https://cool-tec.onrender.com/admin** öffnen – geht am PC, iPhone, iPad, überall.
2. Mit E-Mail + Passwort anmelden. Beim ersten Mal: oben rechts auf **🔑** klicken und ein eigenes Passwort festlegen.
3. Links den Bereich wählen:
   - **Startseite (Unternehmen)** – Firmenfoto, Text über die Firma, Zahlen, Leistungen, Kontakt
   - **Seite „Projekte“ / Seite „Partner“** – Überschriften, Einleitung, Hintergrundbild, Filter-Bereiche
   - **Projekte** – Referenzen anlegen, ändern, löschen, Reihenfolge mit ↑ ↓
   - **Partner** – Partner mit Logo, Text, „Partner seit“
   - **Jobs** – offene Stellen; besetzt? „Veröffentlicht“ ausschalten
   - **Seite „Jobs“** – Einleitung, Vorteile für Bewerber, Bewerbungstext
   - **Weitere Seiten** – Impressum, Datenschutz, eigene Seiten
   - **Firma & Kontakt** – Logo, Öffnungszeiten oben rechts, Telefon, E-Mail, Adresse, Menü, Fußzeile, Google-Texte
   - **Nachrichten** – was Kunden über das Formular geschickt haben. Neue Nachrichten erkennt man an **„3 neu“** links, am Knopf **„✉ 3 neue Nachrichten“** oben und an der Zahl im Browser-Tab „(3) CMS“. Wird jede Minute aktualisiert. Auf „in Arbeit“ oder „erledigt“ setzen → die Zahl sinkt.
4. **Zwei Sprachen:** Jedes Textfeld hat eine Zeile **DE** und eine Zeile **FR** (große Texte: Reiter DE / FR). Ein ⚠ heißt „noch nicht übersetzt“ – dann zeigt die französische Seite den deutschen Text.
5. **💾 Speichern** – nach wenigen Sekunden ist es auf der Webseite sichtbar.
6. Bilder: **⬆ Bild hochladen** – Fotos werden automatisch verkleinert.
7. Alles, was es nicht als Formularfeld gibt: Knopf **{ } JSON** (Experten-Ansicht).

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
3. GitHub prüft nach dem Push **automatisch** noch einmal alles. Nur wenn alles grün ist, wird automatisch ein Pull Request angelegt und nach `main` zusammengeführt – du musst nichts klicken.
4. **Render** veröffentlicht danach automatisch (nur von `main`). Bei Rot passiert nichts, die Live-Seite bleibt unverändert.
Wo sehe ich das? GitHub → Repo **cool-tec** → Reiter **Actions** (✓ = grün, ✗ = rot) bzw. **Pull requests → Closed**.
