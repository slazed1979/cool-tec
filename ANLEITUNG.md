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
   - **Firma & Kontakt** – u. a. **zweites Logo** neben dem Cool-Tec-Logo (BM Project): Bild, Zusatz darunter („by Cool-Tec“) und **Link** (z. B. https://bmproject.lu/, öffnet im neuen Tab). Bild leer lassen = ausgeblendet.
     Außerdem: Logo, Öffnungszeiten oben rechts, Telefon, E-Mail, Adresse, Menü, Fußzeile, Google-Texte
   - **Nachrichten** – was Kunden über das Formular geschickt haben. Neue Nachrichten erkennt man an **„3 neu“** links, am Knopf **„✉ 3 neue Nachrichten“** oben und an der Zahl im Browser-Tab „(3) CMS“. Wird jede Minute aktualisiert. Auf „in Arbeit“ oder „erledigt“ setzen → die Zahl sinkt.
4. **Zwei Sprachen:** Jedes Textfeld hat eine Zeile **DE** und eine Zeile **FR** (große Texte: Reiter DE / FR). Ein ⚠ heißt „noch nicht übersetzt“ – dann zeigt die französische Seite den deutschen Text.
5. **💾 Speichern** – nach wenigen Sekunden ist es auf der Webseite sichtbar.
6. Bilder: **⬆ Bild hochladen** – Fotos werden automatisch verkleinert.
7. Alles, was es nicht als Formularfeld gibt: Knopf **{ } JSON** (Experten-Ansicht).

**Passwort vergessen?** Auf der Anmeldeseite E-Mail eintragen → „Passwort vergessen“.
**Weitere Personen freischalten (nur Admins):** CMS → links unten **👥 Benutzer** → „Neuen Zugang anlegen“: Name, Benutzername (z. B. `marc`) oder E-Mail, Passwort (🎲 erzeugt eins), Rolle. → **✓ Zugang anlegen** → **📋 Zugangsdaten kopieren** und z. B. per SMS weiterschicken. Das Passwort wird nur in diesem Moment angezeigt.
- **Redakteur** = darf Inhalte bearbeiten · **Admin** = darf zusätzlich Benutzer verwalten.
- Passwort vergessen? Admin klickt beim Benutzer auf **🔑 Neues Passwort**. Zugang sperren: **Entfernen**.

## Gut zu wissen
- **Auf den Startbildschirm legen** (Webseite oder CMS): iPhone → in Safari unten auf Teilen ⬆ → „Zum Home-Bildschirm“. Android → in Chrome ⋮ → „Zum Startbildschirm hinzufügen“. Es erscheint das Cool-Tec-Symbol (beim CMS mit „CMS“-Schild). Antippen öffnet die Seite ganz normal im Browser.
- Gratis-Hosting (Render Free): Nach 15 Minuten ohne Besucher „schläft“ die Seite; der erste Aufruf dauert dann ca. 30–60 Sekunden.
- Die Seite ist in der Testphase **vor Google versteckt**. Für den Start: CMS → Firma & Kontakt → „Vor Google verstecken“ ausschalten.
- Vor dem echten Start: **Impressum und Datenschutz** durch echte Texte ersetzen, fiktive Projekte/Partner/Zahlen austauschen.
- Eigene Adresse (z. B. www.cool-tec.lu): Domain kaufen und bei Render eintragen – Pepper hilft dabei.

## 💡 Ideen für später (noch nicht umgesetzt)
- *(zurzeit keine offenen Ideen)*

## ✉️ E-Mail-Benachrichtigung bei neuen Kontakt-Nachrichten
Bei jeder Nachricht über das Kontaktformular geht sofort eine E-Mail an die Adresse(n) aus dem CMS (**⚙️ Firma & Kontakt → „✉️ Benachrichtigung bei neuen Kontakt-Nachrichten an“**, mehrere mit Komma). „Antworten“ in der Mail schreibt direkt dem Kunden. Die Nachricht steht zusätzlich im CMS. Kostenlos über **Brevo** (300 Mails/Tag).

**Einmalig einrichten:**
1. Gratis-Konto anlegen: https://www.brevo.com → „Sign up free“ (keine Kreditkarte nötig).
2. Absender bestätigen: Brevo → oben rechts Name → **Senders, Domains & Dedicated IPs** → **Senders** → „Add a sender“ → eine E-Mail-Adresse eintragen, **auf die du Zugriff hast** → Bestätigungs-Link in der Mail anklicken.
3. Schlüssel erzeugen: Brevo → **SMTP & API** → Reiter **API Keys** → „Generate a new API key“ → Namen „cool-tec“ → Schlüssel kopieren (beginnt mit `xkeysib-`). **Nicht in den Chat schicken!**
4. Bei Render eintragen: https://dashboard.render.com → Dienst **cool-tec** → links **Environment** → „Add Environment Variable“:
   - `BREVO_API_KEY` = der kopierte Schlüssel
   - `MAIL_FROM` = die in Schritt 2 bestätigte Absender-Adresse
   → **Save Changes** (Render startet die Seite neu, ca. 1 Minute).
5. Testen: auf der Webseite das Kontaktformular abschicken → nach 1–2 Minuten sollte die Mail da sein (beim ersten Mal auch im **Spam-Ordner** nachsehen und „Kein Spam“ markieren).

Fehlt der Schlüssel oder ist das Empfänger-Feld leer, wird einfach keine Mail verschickt – die Nachrichten landen trotzdem im CMS.

## Änderungen am Aussehen / an Funktionen
Das macht Pepper Potts – immer so:
1. Arbeit auf einem eigenen **Arbeitszweig** (nie direkt auf `main`)
2. **Tests vor jedem Push** (`npm run check` muss grün sein)
3. GitHub prüft nach dem Push **automatisch** noch einmal alles. Nur wenn alles grün ist, wird automatisch ein Pull Request angelegt und nach `main` zusammengeführt – du musst nichts klicken.
4. **Render** veröffentlicht danach automatisch (nur von `main`). Bei Rot passiert nichts, die Live-Seite bleibt unverändert.
Wo sehe ich das? GitHub → Repo **cool-tec** → Reiter **Actions** (✓ = grün, ✗ = rot) bzw. **Pull requests → Closed**.
