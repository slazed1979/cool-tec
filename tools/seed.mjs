// Erzeugt data/seed.json = Startinhalte der Webseite (fiktiv, Deutsch + Französisch) und Notlösung, falls die Datenbank nicht erreichbar ist.
// Aufruf: node tools/seed.mjs   (überschreibt data/seed.json – die echten Inhalte liegen danach in Supabase/CMS)
import { writeFileSync } from 'node:fs';
import { bilingual } from './i18n/apply.mjs';

const site = {
  name: 'Cool-Tec',
  legalName: 'Cool-Tec S.à r.l.',
  tagline: 'Klima- & Kältetechnik in Luxemburg',
  logo: '/brand/logo-cooltec.png',
  logoAlt: 'Cool-Tec – Klima- und Kältetechnik',
  phone: '+352 26 31 47 80',
  emergencyPhone: '+352 621 47 80 00',
  email: 'info@cool-tec.lu',
  street: '7, rue de l’Innovation',
  city: 'L-8399 Windhof',
  country: 'Luxemburg',
  hoursTop: 'Montag – Freitag: 07:30 bis 17:30 Uhr',
  hours: [
    { days: 'Montag – Freitag', time: '07:30 – 17:30 Uhr' },
    { days: 'Samstag', time: 'nach Vereinbarung' },
    { days: 'Notdienst', time: '24 h / 7 Tage' },
  ],
  nav: [
    { label: 'Unternehmen', href: '/' },
    { label: 'Projekte', href: '/projekte' },
    { label: 'Partner', href: '/partner' },
    { label: { de: 'Jobs', fr: 'Emplois' }, href: '/jobs' },
  ],
  ctaLabel: 'Anfrage stellen',
  ctaHref: '/#kontakt',
  footerText: 'Ihr Fachbetrieb für Klimaanlagen, Kältetechnik, Wärmepumpen und Lüftung – Planung, Montage und Service aus einer Hand.',
  footerLinks: [
    { label: 'Impressum', href: '/impressum' },
    { label: 'Datenschutz', href: '/datenschutz' },
  ],
  seoTitle: 'Cool-Tec – Klimaanlagen, Kältetechnik & Wärmepumpen in Luxemburg',
  seoDescription: 'Cool-Tec plant, installiert und wartet Klimaanlagen, Kälteanlagen, Wärmepumpen und Lüftungen für Privat, Gewerbe und Industrie in Luxemburg.',
  noindex: true,
};

const home = {
  hero: {
    image: '/img/firma.webp',
    eyebrow: 'Klima · Kälte · Wärmepumpen',
    title: 'Das richtige Klima für jeden Raum.',
    text: 'Seit 2009 sorgt Cool-Tec in ganz Luxemburg für angenehme Temperaturen – im Wohnzimmer, im Büro, im Rechenzentrum und in der Großküche.',
    button1: { label: 'Unsere Projekte', href: '/projekte' },
    button2: { label: 'Kostenlose Beratung', href: '#kontakt' },
  },
  about: {
    eyebrow: 'Über uns',
    title: 'Ein Team. Ein Ansprechpartner. Alles aus einer Hand.',
    html: '<p>Cool-Tec ist ein inhabergeführter Fachbetrieb für Klima- und Kältetechnik mit Sitz in Windhof. Unser Team aus zertifizierten Kälteanlagenbauern, Technikern und Planern betreut private Haushalte ebenso wie Gewerbe- und Industriekunden.</p><p>Von der ersten Beratung über die Planung und fachgerechte Montage bis zur regelmäßigen Wartung bleiben wir Ihr fester Ansprechpartner. Wir arbeiten herstellerunabhängig und setzen auf energieeffiziente Lösungen mit natürlichen Kältemitteln.</p>',
    image: '/img/split.webp',
    imageAlt: 'Ein Cool-Tec-Techniker montiert ein Klimagerät in einem Schlafzimmer',
    points: ['Zertifizierter Fachbetrieb (F-Gase)', 'Herstellerunabhängige Beratung', 'Eigener 24/7-Notdienst', 'Feste Ansprechpartner'],
  },
  stats: [
    { value: '2009', label: 'gegründet' },
    { value: '1.400+', label: 'installierte Anlagen' },
    { value: '14', label: 'Fachkräfte im Team' },
    { value: '24/7', label: 'Notdienst' },
  ],
  services: {
    eyebrow: 'Leistungen',
    title: 'Was wir für Sie tun',
    items: [
      { icon: 'snow', title: 'Klimaanlagen', text: 'Split-, Multi-Split- und VRF-Systeme für Wohnung, Praxis und Büro – leise, effizient und passend dimensioniert.' },
      { icon: 'box', title: 'Kältetechnik', text: 'Kühlzellen, Tiefkühlräume und gewerbliche Kälteanlagen für Gastronomie, Handel und Industrie.' },
      { icon: 'heat', title: 'Wärmepumpen', text: 'Luft-Wasser-Wärmepumpen zum Heizen und Kühlen – inklusive Hilfe bei den staatlichen Förderungen.' },
      { icon: 'fan', title: 'Lüftung', text: 'Kontrollierte Wohnraumlüftung und Lüftungsanlagen mit Wärmerückgewinnung für gesunde Raumluft.' },
      { icon: 'wrench', title: 'Wartung & Service', text: 'Regelmäßige Wartung, Dichtheitsprüfungen nach F-Gase-Verordnung und Reparaturen aller Marken.' },
      { icon: 'clock', title: '24/7-Notdienst', text: 'Wenn die Kühlung ausfällt, zählt jede Stunde. Unser Notdienst ist rund um die Uhr für Sie erreichbar.' },
    ],
  },
  projects: { eyebrow: 'Referenzen', title: 'Aktuelle Projekte', text: 'Eine Auswahl unserer letzten Arbeiten.', count: 3, button: 'Alle Projekte ansehen' },
  partners: { eyebrow: 'Partner', title: 'Starke Partner an unserer Seite', button: 'Alle Partner' },
  contact: {
    eyebrow: 'Kontakt',
    title: 'Sprechen Sie mit uns',
    text: 'Sie planen eine neue Anlage oder brauchen einen Service-Termin? Schreiben Sie uns – wir melden uns in der Regel innerhalb eines Werktags.',
    showForm: true,
  },
};

const projectsPage = {
  eyebrow: 'Referenzen',
  title: 'Unsere Projekte',
  text: 'Vom Einfamilienhaus bis zum Rechenzentrum: Hier zeigen wir eine Auswahl der Anlagen, die wir geplant, installiert oder modernisiert haben.',
  image: '/img/dach.webp',
  categories: ['Privat', 'Gewerbe', 'Industrie', 'Gastronomie'],
};

const partnersPage = {
  eyebrow: 'Netzwerk',
  title: 'Unsere Partner',
  text: 'Gute Anlagen entstehen im Zusammenspiel. Wir arbeiten seit Jahren mit ausgewählten Herstellern, Großhändlern und Planungsbüros zusammen.',
  image: '/img/hero.webp',
  outro: '<p>Sie möchten mit uns zusammenarbeiten? Wir freuen uns über Anfragen von Architekten, Planern und Bauunternehmen.</p>',
};

const jobsPage = {
  eyebrow: { de: 'Karriere', fr: 'Carrière' },
  title: { de: 'Jobs bei Cool-Tec', fr: 'Emplois chez Cool-Tec' },
  text: {
    de: 'Wir wachsen und suchen Menschen, die mit anpacken: Techniker, Planer und Auszubildende, die Lust auf moderne Klima- und Kältetechnik haben.',
    fr: 'Nous grandissons et recherchons des personnes motivées : techniciens, dessinateurs et apprentis passionnés par la climatisation et le froid modernes.',
  },
  image: '/img/team.webp',
  benefitsTitle: { de: 'Was wir Ihnen bieten', fr: 'Ce que nous vous offrons' },
  benefits: [
    { icon: 'shield', title: { de: 'Sicherer Arbeitsplatz', fr: 'Emploi stable' }, text: { de: 'Unbefristeter Vertrag (CDI) in einem gesunden, wachsenden Familienbetrieb.', fr: 'Contrat à durée indéterminée (CDI) dans une entreprise familiale saine et en croissance.' } },
    { icon: 'wrench', title: { de: 'Top-Ausstattung', fr: 'Équipement moderne' }, text: { de: 'Eigener Servicewagen, hochwertiges Werkzeug, Tablet und Firmenhandy.', fr: 'Véhicule de service, outillage de qualité, tablette et téléphone professionnel.' } },
    { icon: 'calendar', title: { de: 'Weiterbildung', fr: 'Formation continue' }, text: { de: 'Regelmäßige Schulungen bei Herstellern und Unterstützung bei Meister- oder Technikerkursen.', fr: 'Formations régulières chez les fabricants et soutien pour le brevet de maîtrise ou de technicien.' } },
    { icon: 'user', title: { de: 'Starkes Team', fr: 'Une équipe soudée' }, text: { de: 'Flache Hierarchien, kurze Wege und ein Team, das zusammenhält.', fr: 'Hiérarchie plate, décisions rapides et une équipe solidaire.' } },
  ],
  applyTitle: { de: 'So bewerben Sie sich', fr: 'Comment postuler' },
  applyText: {
    de: 'Schicken Sie uns Ihren Lebenslauf per E-Mail oder schreiben Sie uns kurz über das Formular – wir melden uns innerhalb weniger Tage. Keine passende Stelle dabei? Wir freuen uns auch über Initiativbewerbungen.',
    fr: 'Envoyez-nous votre CV par e-mail ou écrivez-nous brièvement via le formulaire – nous vous répondons sous quelques jours. Aucun poste ne vous correspond ? Les candidatures spontanées sont également les bienvenues.',
  },
  emptyText: { de: 'Zurzeit sind keine Stellen ausgeschrieben – Initiativbewerbungen sind aber jederzeit willkommen.', fr: 'Aucun poste n’est ouvert actuellement – les candidatures spontanées sont toutefois toujours les bienvenues.' },
};

const P = (id, o) => ({ id, ...o });
const ul = (items) => '<ul>' + items.map((x) => `<li>${x}</li>`).join('') + '</ul>';
const jobHtml = (de, fr) => ({
  de: `<h2>Ihre Aufgaben</h2>${ul(de[0])}<h2>Ihr Profil</h2>${ul(de[1])}`,
  fr: `<h2>Vos missions</h2>${ul(fr[0])}<h2>Votre profil</h2>${ul(fr[1])}`,
});
const jobs = [
  P('kaelteanlagenbauer', {
    title: { de: 'Kälteanlagenbauer / Mechatroniker für Kältetechnik (m/w/d)', fr: 'Frigoriste / mécatronicien en froid (h/f/x)' },
    type: { de: 'Vollzeit · CDI', fr: 'Temps plein · CDI' }, location: 'Windhof', start: { de: 'ab sofort', fr: 'dès que possible' },
    summary: { de: 'Montage und Inbetriebnahme von Kälte- und Klimaanlagen bei Privat- und Gewerbekunden in ganz Luxemburg.', fr: 'Montage et mise en service d’installations frigorifiques et de climatisation chez des clients privés et professionnels dans tout le Luxembourg.' },
    html: jobHtml(
      [['Montage von Split-, VRF- und Kälteanlagen', 'Inbetriebnahme, Einregulierung und Dokumentation', 'Löt- und Pressarbeiten an Kupferleitungen', 'Kundenberatung direkt vor Ort'], ['Abgeschlossene Ausbildung im Bereich Kälte-/Klimatechnik oder vergleichbar', 'F-Gase-Zertifikat (Kategorie I) oder Bereitschaft, es zu erwerben', 'Führerschein Klasse B', 'Deutsch oder Französisch, Luxemburgisch ist ein Plus']],
      [['Montage de systèmes split, VRF et frigorifiques', 'Mise en service, réglage et documentation', 'Brasage et sertissage de tuyauteries cuivre', 'Conseil aux clients sur place'], ['Formation achevée en froid/climatisation ou équivalent', 'Certificat gaz fluorés (catégorie I) ou disposition à l’obtenir', 'Permis de conduire B', 'Allemand ou français, le luxembourgeois est un atout']],
    ),
  }),
  P('servicetechniker', {
    title: { de: 'Servicetechniker Klima- & Kältetechnik (m/w/d)', fr: 'Technicien de service climatisation & froid (h/f/x)' },
    type: { de: 'Vollzeit · CDI', fr: 'Temps plein · CDI' }, location: { de: 'Windhof / im Außendienst', fr: 'Windhof / sur le terrain' }, start: { de: 'ab sofort', fr: 'dès que possible' },
    summary: { de: 'Wartung, Fehlersuche und Reparatur – Sie sind das Gesicht von Cool-Tec beim Kunden.', fr: 'Entretien, dépannage et réparation – vous êtes le visage de Cool-Tec chez nos clients.' },
    html: jobHtml(
      [['Wartung und Dichtheitsprüfungen nach F-Gase-Verordnung', 'Störungsdiagnose und Reparatur aller Marken', 'Teilnahme am Bereitschaftsdienst (gut vergütet)', 'Digitale Einsatzberichte per Tablet'], ['Erfahrung im Service von Kälte- oder Klimaanlagen', 'Selbstständige, zuverlässige Arbeitsweise', 'Führerschein Klasse B', 'Freundliches Auftreten beim Kunden']],
      [['Entretien et contrôles d’étanchéité selon le règlement gaz fluorés', 'Diagnostic de pannes et réparation toutes marques', 'Participation au service d’astreinte (bien rémunéré)', 'Rapports d’intervention numériques sur tablette'], ['Expérience en service d’installations frigorifiques ou de climatisation', 'Travail autonome et fiable', 'Permis de conduire B', 'Bon contact avec la clientèle']],
    ),
  }),
  P('projektplaner-hlk', {
    title: { de: 'Projektplaner / Technischer Zeichner HLK (m/w/d)', fr: 'Chargé de projets / dessinateur HVAC (h/f/x)' },
    type: { de: 'Vollzeit oder Teilzeit', fr: 'Temps plein ou partiel' }, location: 'Windhof', start: { de: 'nach Vereinbarung', fr: 'à convenir' },
    summary: { de: 'Sie planen Anlagen am Bildschirm, erstellen Angebote und begleiten Projekte vom Entwurf bis zur Übergabe.', fr: 'Vous concevez les installations, établissez les offres et suivez les projets de l’esquisse à la réception.' },
    html: jobHtml(
      [['Auslegung und Planung von Klima- und Kälteanlagen', 'Erstellen von Plänen (CAD) und Angeboten', 'Abstimmung mit Architekten, Planern und Monteuren', 'Projektbegleitung bis zur Abnahme'], ['Technische Ausbildung oder Studium im Bereich Gebäudetechnik', 'Sicherer Umgang mit CAD-Software', 'Strukturierte, sorgfältige Arbeitsweise', 'Deutsch und Französisch']],
      [['Dimensionnement et conception d’installations de climatisation et de froid', 'Réalisation de plans (DAO) et d’offres', 'Coordination avec architectes, bureaux d’études et monteurs', 'Suivi de projet jusqu’à la réception'], ['Formation technique ou études en techniques du bâtiment', 'Bonne maîtrise des logiciels de DAO', 'Méthode de travail structurée et soignée', 'Allemand et français']],
    ),
  }),
  P('ausbildung-kaelteanlagenbauer', {
    title: { de: 'Ausbildung zum Kälteanlagenbauer – DAP (m/w/d)', fr: 'Apprentissage frigoriste – DAP (h/f/x)' },
    type: { de: 'Lehre (3 Jahre)', fr: 'Apprentissage (3 ans)' }, location: 'Windhof', start: { de: 'September 2027', fr: 'septembre 2027' },
    summary: { de: 'Starten Sie Ihre Karriere in einem Zukunftsberuf – mit erfahrenen Kollegen an Ihrer Seite.', fr: 'Lancez votre carrière dans un métier d’avenir – accompagné de collègues expérimentés.' },
    html: jobHtml(
      [['Lernen, wie Klima-, Kälte- und Wärmepumpenanlagen funktionieren', 'Mitarbeit auf Baustellen und im Service', 'Begleitung durch einen festen Ausbilder', 'Schulische Ausbildung nach dem luxemburgischen DAP-System'], ['Interesse an Technik und handwerklichem Arbeiten', 'Teamgeist und Zuverlässigkeit', 'Abschluss der 5e oder vergleichbar']],
      [['Apprendre le fonctionnement des installations de climatisation, de froid et des pompes à chaleur', 'Participation aux chantiers et au service', 'Accompagnement par un tuteur attitré', 'Formation scolaire selon le système luxembourgeois DAP'], ['Intérêt pour la technique et le travail manuel', 'Esprit d’équipe et fiabilité', 'Classe de 5e réussie ou équivalent']],
    ),
  }),
];

const projects = [
  P('office-park-kirchberg', { title: 'Klimatisierung Office Park', location: 'Luxemburg-Kirchberg', year: '2025', category: 'Gewerbe', customer: 'Bürogebäude, 4.200 m²', service: 'VRF-System mit 86 Deckenkassetten', image: '/img/buero.webp', imageAlt: 'Großraumbüro mit Deckenkassetten', summary: 'Komplette Klimatisierung eines Bürogebäudes über fünf Etagen – im laufenden Betrieb.', html: '<p>Für den Neubau des Office Parks haben wir ein VRF-System mit Wärmerückgewinnung geplant und installiert. Jede Bürozone lässt sich einzeln regeln; überschüssige Wärme aus sonnigen Räumen wird in kühlere Bereiche verschoben.</p><ul><li>86 Deckenkassetten, 6 Außengeräte</li><li>Anbindung an die Gebäudeleittechnik</li><li>Wartungsvertrag über 5 Jahre</li></ul>', featured: true }),
  P('rechenzentrum-bettembourg', { title: 'Präzisionsklima Rechenzentrum', location: 'Bettembourg', year: '2024', category: 'Industrie', customer: 'Rechenzentrum, 1.100 m² Serverfläche', service: 'Präzisionsklimageräte mit freier Kühlung', image: '/img/server.webp', imageAlt: 'Rechenzentrum mit Serverschränken und Klimageräten', summary: 'Redundante Kühlung für ein Rechenzentrum mit 24/7-Betrieb.', html: '<p>Ausfallsicherheit war hier oberstes Gebot: Wir haben acht Präzisionsklimageräte in N+1-Redundanz installiert. Im Winter kühlt die Anlage überwiegend mit Außenluft (freie Kühlung) und spart so bis zu 40 % Energie.</p>', featured: true }),
  P('waermepumpe-mersch', { title: 'Wärmepumpe Einfamilienhaus', location: 'Mersch', year: '2025', category: 'Privat', customer: 'Neubau Einfamilienhaus', service: 'Luft-Wasser-Wärmepumpe mit Kühlfunktion', image: '/img/waermepumpe.webp', imageAlt: 'Wärmepumpe neben einem modernen Einfamilienhaus', summary: 'Heizen im Winter, sanft kühlen im Sommer – mit nur einem Gerät.', html: '<p>Eine leise Luft-Wasser-Wärmepumpe versorgt das Haus mit Heizung und Warmwasser. Über die Fußbodenheizung wird im Sommer zusätzlich gekühlt. Bei den Förderanträgen (Klimabonus) haben wir die Familie begleitet.</p>', featured: true }),
  P('brasserie-esch', { title: 'Kühlzelle Brasserie', location: 'Esch-sur-Alzette', year: '2024', category: 'Gastronomie', customer: 'Restaurant mit 120 Plätzen', service: 'Begehbare Kühlzelle + Tiefkühlzelle', image: '/img/kuehlraum.webp', imageAlt: 'Begehbare Kühlzelle aus Edelstahl in einer Restaurantküche', summary: 'Neue Kühl- und Tiefkühlzellen für eine Großküche – eingebaut in nur drei Tagen.', html: '<p>Damit das Restaurant nur kurz schließen musste, haben wir die Zellen vorgefertigt und an einem verlängerten Wochenende montiert. Die Kälteanlage arbeitet mit dem natürlichen Kältemittel CO₂.</p>' }),
  P('logistikzentrum-contern', { title: 'Kaltwassersätze Logistikzentrum', location: 'Contern', year: '2023', category: 'Industrie', customer: 'Logistikzentrum, 12.000 m²', service: 'Dachzentrale mit 3 Kaltwassersätzen', image: '/img/dach.webp', imageAlt: 'Kaltwassersätze auf dem Dach eines Bürogebäudes', summary: 'Modernisierung der Kältezentrale auf dem Dach – mit 35 % weniger Stromverbrauch.', html: '<p>Die alten Kaltwassersätze wurden durch drei moderne, drehzahlgeregelte Geräte ersetzt. Die Umstellung erfolgte schrittweise, sodass die Kühlung der Lagerhallen nie unterbrochen wurde.</p>' }),
  P('wohnung-limpertsberg', { title: 'Split-Klimaanlage Altbauwohnung', location: 'Luxemburg-Limpertsberg', year: '2025', category: 'Privat', customer: 'Altbauwohnung, 3. Stock', service: 'Multi-Split mit 3 Innengeräten', image: '/img/split.webp', imageAlt: 'Techniker montiert ein Klima-Innengerät im Schlafzimmer', summary: 'Kühle Schlafzimmer im Altbau – sauber verlegt und kaum sichtbar.', html: '<p>Ein Außengerät im Innenhof versorgt drei Räume. Die Leitungen haben wir unauffällig in Kabelkanälen in Wandfarbe geführt; die Montage dauerte einen Tag.</p>' }),
  P('arztpraxis-strassen', { title: 'Klimatisierung Arztpraxis', location: 'Strassen', year: '2024', category: 'Gewerbe', customer: 'Gemeinschaftspraxis, 6 Räume', service: 'Wandgeräte mit Hygienefilter', image: '/img/hero.webp', imageAlt: 'Heller Raum mit Wand-Klimagerät', summary: 'Angenehme Temperaturen für Patienten und Team – mit besonders leisen Geräten.', html: '<p>Für die Praxis haben wir flüsterleise Wandgeräte mit Feinstaub- und Hygienefiltern gewählt. Jeder Behandlungsraum ist einzeln regelbar.</p>' }),
];

const partners = [
  P('nordklima', { name: 'NordKlima Systems', category: 'Hersteller', logo: '/img/partner/nordklima.svg', url: '', text: 'Hersteller von Split- und VRF-Klimasystemen. Cool-Tec ist zertifizierter Premium-Installationspartner.', since: '2011' }),
  P('thermolux', { name: 'ThermoLux Wärmepumpen', category: 'Hersteller', logo: '/img/partner/thermolux.svg', url: '', text: 'Effiziente Luft-Wasser-Wärmepumpen für Neubau und Sanierung.', since: '2016' }),
  P('aerofrost', { name: 'AeroFrost Technologies', category: 'Hersteller', logo: '/img/partner/aerofrost.svg', url: '', text: 'Präzisionsklima für Rechenzentren und technische Räume.', since: '2018' }),
  P('polar-components', { name: 'Polar Components', category: 'Großhandel', logo: '/img/partner/polar-components.svg', url: '', text: 'Großhändler für Kälte- und Klimakomponenten mit Lager in der Großregion.', since: '2009' }),
  P('moselkaelte', { name: 'Mosel Kältebau', category: 'Großhandel', logo: '/img/partner/moselkaelte.svg', url: '', text: 'Kühlzellen und Isolierpaneele nach Maß.', since: '2014' }),
  P('greenair', { name: 'GreenAir Lüftungstechnik', category: 'Planung', logo: '/img/partner/greenair.svg', url: '', text: 'Planungsbüro für Lüftung und Gebäudetechnik – gemeinsame Projekte im Gewerbebau.', since: '2019' }),
];

const legal = (t) => `<p><strong>Hinweis:</strong> Dies ist ein Platzhaltertext. Bitte im CMS unter „Seiten“ durch den echten ${t} ersetzen.</p>`;
const pages = [
  P('impressum', { title: 'Impressum', path: '/impressum', html: legal('Impressumstext') + '<h2>Angaben zum Unternehmen</h2><p>Cool-Tec S.à r.l.<br>7, rue de l’Innovation<br>L-8399 Windhof<br>Luxemburg</p><p>Telefon: +352 26 31 47 80<br>E-Mail: info@cool-tec.lu</p><p>Handelsregister (RCS): B 000000<br>Niederlassungsgenehmigung: 00000000/0<br>Mehrwertsteuer-Nr.: LU00000000</p><p>Geschäftsführung: Max Mustermann</p>' }),
  P('datenschutz', { title: 'Datenschutz', path: '/datenschutz', html: legal('Datenschutztext') + '<h2>Kontaktformular</h2><p>Wenn Sie uns über das Kontaktformular schreiben, speichern wir Ihre Angaben (Name, E-Mail, Telefon, Nachricht) ausschließlich, um Ihre Anfrage zu bearbeiten. Die Daten werden nicht an Dritte weitergegeben.</p><h2>Cookies & Schriften</h2><p>Diese Webseite setzt keine Tracking-Cookies und lädt keine Schriften oder Skripte von fremden Servern.</p>' }),
];

const rows = (col, list) => list.map((x, i) => ({ collection: col, id: x.id, sort: i + 1, published: true, data: Object.fromEntries(Object.entries(x).filter(([k]) => k !== 'id')) }));
const seed = [
  { collection: 'settings', id: 'site', sort: 1, published: true, data: site },
  { collection: 'home', id: 'home', sort: 1, published: true, data: home },
  { collection: 'projectsPage', id: 'projectsPage', sort: 1, published: true, data: projectsPage },
  { collection: 'partnersPage', id: 'partnersPage', sort: 1, published: true, data: partnersPage },
  { collection: 'jobsPage', id: 'jobsPage', sort: 1, published: true, data: jobsPage },
  ...rows('projects', projects),
  ...rows('partners', partners),
  ...rows('jobs', jobs),
  ...rows('pages', pages),
];
for (const r of seed) r.data = bilingual(r.data); // Deutsch + Französisch (tools/i18n/fr.mjs)
writeFileSync(new URL('../data/seed.json', import.meta.url), JSON.stringify(seed, null, 1) + '\n');
console.log('data/seed.json geschrieben:', seed.length, 'Einträge');
