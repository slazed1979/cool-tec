// Welche Felder es pro Inhaltsart gibt. Texte sind automatisch zweisprachig (DE/FR); mono: true = gilt für beide Sprachen.
// Neues Feld? → hier ergänzen (keine Datenbank-Änderung nötig)
// und in server/views.mjs anzeigen. Was hier fehlt, ist trotzdem über „{ } JSON“ bearbeitbar.

export const ICONS = ['snow', 'box', 'heat', 'fan', 'wrench', 'clock', 'phone', 'mail', 'pin', 'check', 'building', 'calendar', 'user', 'leaf', 'shield', 'link'];

/** Anzeigetext eines (evtl. zweisprachigen) Felds – deutsch bevorzugt */
export const L = (v) => (typeof v === 'string' ? v : v && typeof v === 'object' ? v.de || v.fr || '' : '');

export const slugify = (s) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const link = (key, label) => ({ key, label, type: 'object', fields: [
  { key: 'label', label: 'Beschriftung', type: 'text' },
  { key: 'href', label: 'Ziel', type: 'link', help: 'z. B. /projekte, #kontakt oder https://…' },
] });
const navList = (key, label, help) => ({ key, label, help, type: 'list', itemTitle: 'label', fields: [
  { key: 'label', label: 'Beschriftung', type: 'text' },
  { key: 'href', label: 'Ziel', type: 'link' },
] });
const sectionHead = [
  { key: 'eyebrow', label: 'Kleine Überzeile', type: 'text' },
  { key: 'title', label: 'Überschrift', type: 'text' },
];

export const COLLECTIONS = [
  // ------------------------------------------------ Webseite
  {
    key: 'home', group: 'Seiten', label: 'Startseite (Unternehmen)', emoji: '🏠', single: true, singleId: 'home', view: () => '/',
    description: 'Erster Reiter: Startbild mit Firmenfoto, Zahlen, Text über die Firma, Leistungen, Projekt- und Partner-Vorschau, Kontakt.',
    title: () => 'Startseite',
    fields: [
      { key: 'hero', label: '① Startbild (ganz oben)', type: 'object', fields: [
        { key: 'image', label: 'Foto der Firma (breit, mind. 1600 px)', type: 'image' },
        { key: 'eyebrow', label: 'Kleine Überzeile', type: 'text' },
        { key: 'title', label: 'Große Überschrift', type: 'text' },
        { key: 'text', label: 'Text darunter', type: 'textarea' },
        link('button1', 'Knopf 1 (blau)'),
        link('button2', 'Knopf 2 (weiß umrandet)'),
      ] },
      { key: 'stats', label: '② Zahlen-Leiste', help: 'Am besten 4 Einträge. Leer = Leiste ausgeblendet.', type: 'list', itemTitle: 'value', fields: [
        { key: 'value', label: 'Zahl / Wert', type: 'text', mono: true },
        { key: 'label', label: 'Beschriftung', type: 'text' },
      ] },
      { key: 'about', label: '③ Über die Firma', type: 'object', fields: [
        ...sectionHead,
        { key: 'html', label: 'Beschreibung', type: 'richtext' },
        { key: 'points', label: 'Häkchen-Punkte', type: 'strings' },
        { key: 'image', label: 'Bild rechts', type: 'image' },
        { key: 'imageAlt', label: 'Bildbeschreibung (für Blinde & Google)', type: 'text' },
      ] },
      { key: 'services', label: '④ Leistungen', type: 'object', fields: [
        ...sectionHead,
        { key: 'text', label: 'Einleitung (optional)', type: 'textarea' },
        { key: 'items', label: 'Leistungen', type: 'list', itemTitle: 'title', fields: [
          { key: 'icon', label: 'Symbol', type: 'icon' },
          { key: 'title', label: 'Titel', type: 'text' },
          { key: 'text', label: 'Text', type: 'textarea' },
        ] },
      ] },
      { key: 'projects', label: '⑤ Projekt-Vorschau', type: 'object', fields: [
        ...sectionHead,
        { key: 'text', label: 'Text', type: 'textarea' },
        { key: 'count', label: 'Wie viele Projekte zeigen?', type: 'select', options: [{ value: '3', label: '3' }, { value: '6', label: '6' }] },
        { key: 'button', label: 'Knopf-Text', type: 'text' },
        { key: 'hidden', label: 'Abschnitt ausblenden', type: 'bool0' },
      ] },
      { key: 'partners', label: '⑥ Partner-Logos', type: 'object', fields: [
        ...sectionHead,
        { key: 'button', label: 'Knopf-Text', type: 'text' },
        { key: 'hidden', label: 'Abschnitt ausblenden', type: 'bool0' },
      ] },
      { key: 'contact', label: '⑦ Kontakt', type: 'object', fields: [
        ...sectionHead,
        { key: 'text', label: 'Text', type: 'textarea' },
        { key: 'showForm', label: 'Kontaktformular anzeigen', type: 'bool' },
      ] },
    ],
  },
  {
    key: 'projectsPage', group: 'Seiten', label: 'Seite „Projekte“', emoji: '🗂', single: true, singleId: 'projectsPage', view: () => '/projekte',
    description: 'Zweiter Reiter: Kopfbereich und Filter-Bereiche. Die Projekte selbst unter „Projekte“.',
    title: () => 'Seite „Projekte“',
    fields: [
      ...sectionHead,
      { key: 'text', label: 'Einleitung', type: 'textarea' },
      { key: 'image', label: 'Hintergrundbild', type: 'image' },
      { key: 'categories', label: 'Bereiche (Filter-Knöpfe)', help: 'Jedes Projekt bekommt einen dieser Bereiche.', type: 'strings' },
    ],
  },
  {
    key: 'partnersPage', group: 'Seiten', label: 'Seite „Partner“', emoji: '🤝', single: true, singleId: 'partnersPage', view: () => '/partner',
    description: 'Dritter Reiter: Kopfbereich und Schlusstext. Die Partner selbst unter „Partner“.',
    title: () => 'Seite „Partner“',
    fields: [
      ...sectionHead,
      { key: 'text', label: 'Einleitung', type: 'textarea' },
      { key: 'image', label: 'Hintergrundbild', type: 'image' },
      { key: 'outro', label: 'Text unter den Partnern', type: 'richtext' },
    ],
  },
  {
    key: 'jobsPage', group: 'Seiten', label: 'Seite „Jobs“', emoji: '💼', single: true, singleId: 'jobsPage', view: () => '/jobs',
    description: 'Vierter Reiter: Kopfbereich, Vorteile für Bewerber, Bewerbungstext. Die Stellen selbst unter „Jobs“.',
    title: () => 'Seite „Jobs“',
    fields: [
      ...sectionHead,
      { key: 'text', label: 'Einleitung', type: 'textarea' },
      { key: 'image', label: 'Hintergrundbild', type: 'image' },
      { key: 'benefitsTitle', label: 'Überschrift Vorteile', type: 'text' },
      { key: 'benefits', label: 'Vorteile (am besten 4)', type: 'list', itemTitle: 'title', fields: [
        { key: 'icon', label: 'Symbol', type: 'icon' },
        { key: 'title', label: 'Titel', type: 'text' },
        { key: 'text', label: 'Text', type: 'textarea' },
      ] },
      { key: 'applyTitle', label: 'Überschrift Bewerbung (über dem Formular)', type: 'text' },
      { key: 'applyText', label: 'Text Bewerbung', type: 'textarea' },
      { key: 'emptyText', label: 'Text, wenn keine Stelle offen ist', type: 'textarea' },
    ],
  },
  {
    key: 'pages', group: 'Seiten', label: 'Weitere Seiten', emoji: '📄', sortable: true, view: (d) => d.path,
    description: 'Impressum, Datenschutz oder beliebige weitere Seiten. Verlinken über Einstellungen → Fußzeilen-Links.',
    title: (d) => L(d.title), subtitle: (d) => d.path,
    newId: (d) => slugify(L(d.title)),
    defaults: () => ({ title: { de: '', fr: '' }, path: '/', html: { de: '', fr: '' } }),
    fields: [
      { key: 'title', label: 'Titel', type: 'text' },
      { key: 'path', label: 'Adresse', type: 'text', mono: true, help: 'Beginnt mit /, z. B. /impressum' },
      { key: 'html', label: 'Inhalt', type: 'richtext' },
    ],
  },
  // ------------------------------------------------ Inhalte
  {
    key: 'projects', group: 'Inhalte', label: 'Projekte', emoji: '🏗', sortable: true, view: (d, id) => '/projekte/' + id,
    description: 'Referenzprojekte. Reihenfolge mit ↑ ↓ ändern. „Auf Startseite“ = erscheint bevorzugt in der Vorschau.',
    title: (d) => L(d.title), subtitle: (d) => [L(d.category), L(d.location), d.year].filter(Boolean).join(' · '),
    newId: (d) => slugify(L(d.title)),
    defaults: () => ({ title: '', category: '', location: '', year: String(new Date().getFullYear()), image: '', summary: '', html: '' }),
    fields: [
      { key: 'title', label: 'Titel', type: 'text' },
      { key: 'category', label: 'Bereich', type: 'category' },
      { key: 'location', label: 'Ort', type: 'text' },
      { key: 'year', label: 'Jahr', type: 'text', mono: true },
      { key: 'customer', label: 'Objekt / Kunde', type: 'text', help: 'z. B. „Bürogebäude, 4.200 m²“' },
      { key: 'service', label: 'Leistung', type: 'text', help: 'z. B. „VRF-System mit 86 Deckenkassetten“' },
      { key: 'image', label: 'Hauptbild', type: 'image' },
      { key: 'imageAlt', label: 'Bildbeschreibung', type: 'text' },
      { key: 'summary', label: 'Kurzbeschreibung (für die Karte)', type: 'textarea' },
      { key: 'html', label: 'Ausführliche Beschreibung', type: 'richtext' },
      { key: 'images', label: 'Weitere Bilder (Galerie)', type: 'list', itemTitle: 'alt', fields: [
        { key: 'src', label: 'Bild', type: 'image' },
        { key: 'alt', label: 'Bildbeschreibung', type: 'text' },
      ] },
      { key: 'featured', label: 'Auf Startseite bevorzugt zeigen', type: 'bool0' },
    ],
  },
  {
    key: 'partners', group: 'Inhalte', label: 'Partner', emoji: '🤝', sortable: true, view: (d, id) => '/partner#' + id,
    description: 'Hersteller, Großhändler, Planer … Gruppiert nach „Art“. Reihenfolge mit ↑ ↓.',
    title: (d) => L(d.name), subtitle: (d) => L(d.category),
    newId: (d) => slugify(L(d.name)),
    defaults: () => ({ name: '', category: 'Hersteller', logo: '', text: '', url: '', since: '' }),
    fields: [
      { key: 'name', label: 'Name', type: 'text', mono: true },
      { key: 'category', label: 'Art (Gruppe)', type: 'text', help: 'z. B. Hersteller, Großhandel, Planung' },
      { key: 'logo', label: 'Logo (am besten SVG oder PNG mit transparentem Hintergrund)', type: 'image' },
      { key: 'text', label: 'Beschreibung', type: 'textarea' },
      { key: 'since', label: 'Partner seit (Jahr)', type: 'text', mono: true },
      { key: 'url', label: 'Webseite', type: 'link' },
    ],
  },
  {
    key: 'jobs', group: 'Inhalte', label: 'Jobs', emoji: '💼', sortable: true, view: (d, id) => '/jobs/' + id,
    description: 'Offene Stellen. Besetzt? → „Veröffentlicht“ ausschalten (bleibt gespeichert) oder löschen.',
    title: (d) => L(d.title), subtitle: (d) => [L(d.type), L(d.location)].filter(Boolean).join(' · '),
    newId: (d) => slugify(L(d.title)),
    defaults: () => ({ title: { de: '', fr: '' }, type: { de: 'Vollzeit · CDI', fr: 'Temps plein · CDI' }, location: 'Windhof', start: { de: 'ab sofort', fr: 'dès que possible' }, summary: { de: '', fr: '' }, html: { de: '<h2>Ihre Aufgaben</h2><ul><li></li></ul><h2>Ihr Profil</h2><ul><li></li></ul>', fr: '<h2>Vos missions</h2><ul><li></li></ul><h2>Votre profil</h2><ul><li></li></ul>' } }),
    fields: [
      { key: 'title', label: 'Stellenbezeichnung', type: 'text', help: 'z. B. „Servicetechniker (m/w/d)“' },
      { key: 'type', label: 'Anstellung', type: 'text', help: 'z. B. Vollzeit · CDI, Teilzeit, Lehre' },
      { key: 'location', label: 'Arbeitsort', type: 'text' },
      { key: 'start', label: 'Start', type: 'text', help: 'z. B. ab sofort, September 2027' },
      { key: 'summary', label: 'Kurzbeschreibung (für die Liste)', type: 'textarea' },
      { key: 'html', label: 'Stellenbeschreibung (Aufgaben, Profil …)', type: 'richtext' },
    ],
  },
  // ------------------------------------------------ Einstellungen
  {
    key: 'settings', group: 'Einstellungen', label: 'Firma & Kontakt', emoji: '⚙️', single: true, singleId: 'site', view: () => '/',
    description: 'Gilt für alle Seiten: Logo, Kontaktdaten, Öffnungszeiten oben rechts, Menü, Fußzeile, Google-Texte.',
    title: () => 'Firma & Kontakt',
    fields: [
      { key: 'name', label: 'Firmenname (kurz)', type: 'text', mono: true },
      { key: 'legalName', label: 'Firmenname (vollständig, z. B. mit S.à r.l.)', type: 'text', mono: true },
      { key: 'logo', label: 'Logo (oben links)', type: 'image' },
      { key: 'logoAlt', label: 'Logo-Beschreibung', type: 'text' },
      { key: 'logo2', label: 'Zweites Logo daneben (kleiner, z. B. BM Project) – leer = ausgeblendet', type: 'image' },
      { key: 'logo2Alt', label: 'Zweites Logo – Beschreibung (für Blinde & Google)', type: 'text' },
      { key: 'logo2Text', label: 'Zweites Logo – Zusatz klein darunter', type: 'text', help: 'z. B. „by Cool-Tec“ – leer lassen = kein Zusatz' },
      { key: 'logo2Href', label: 'Zweites Logo – Link (Klick aufs Logo)', type: 'link', help: 'z. B. https://www.bmproject.lu – öffnet in neuem Tab. Leer = nicht anklickbar.' },
      { key: 'hoursTop', label: 'Öffnungszeiten oben rechts (eine Zeile)', type: 'text' },
      { key: 'phone', label: 'Telefon', type: 'text', mono: true },
      { key: 'emergencyPhone', label: 'Notdienst-Telefon (leer = ausblenden)', type: 'text', mono: true },
      { key: 'email', label: 'E-Mail', type: 'text', mono: true },
      { key: 'street', label: 'Straße', type: 'text', mono: true },
      { key: 'city', label: 'PLZ & Ort', type: 'text', mono: true },
      { key: 'country', label: 'Land', type: 'text' },
      { key: 'hours', label: 'Öffnungszeiten (Fußzeile)', type: 'list', itemTitle: 'days', fields: [
        { key: 'days', label: 'Tage', type: 'text' },
        { key: 'time', label: 'Uhrzeit', type: 'text' },
      ] },
      navList('nav', 'Hauptmenü (die Reiter oben)', 'Reihenfolge mit ↑ ↓. Vorhandene Seiten: / (Unternehmen), /projekte, /partner'),
      { key: 'ctaLabel', label: 'Knopf rechts im Menü – Text (leer = kein Knopf)', type: 'text' },
      { key: 'ctaHref', label: 'Knopf rechts im Menü – Ziel', type: 'link' },
      { key: 'footerText', label: 'Text in der Fußzeile', type: 'textarea' },
      navList('footerLinks', 'Fußzeilen-Links', 'z. B. Impressum, Datenschutz'),
      { key: 'seoTitle', label: 'Titel für Google (Startseite)', type: 'text' },
      { key: 'seoDescription', label: 'Beschreibung für Google', type: 'textarea' },
      { key: 'noindex', label: 'Vor Google verstecken (Testphase)', type: 'bool', help: 'Erst ausschalten, wenn die Seite mit echten Inhalten online gehen soll.' },
    ],
  },
];
