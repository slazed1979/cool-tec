// Einfache Linien-Symbole (SVG, 24×24). Neue Symbole hier ergänzen und in admin/src/schema.js (ICONS) eintragen.
const P = {
  snow: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9 4l3 2 3-2M9 20l3-2 3 2M4.5 10.5l1-3.5-3.5-1M19.5 13.5l-1 3.5 3.5 1M4.5 13.5l1 3.5-3.5 1M19.5 10.5l-1-3.5 3.5-1"/>',
  box: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18M18 10v4"/><path d="M7 8l2 1.2M7 12h3M7 16l2-1.2"/>',
  heat: '<path d="M12 3a2.5 2.5 0 0 0-2.5 2.5v8.6a4 4 0 1 0 5 0V5.5A2.5 2.5 0 0 0 12 3z"/><path d="M12 9v7"/><path d="M18 5h3M18 9h3M18 13h3"/>',
  fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 4-7 2 0 3 2 2 4-1 1.5-3 2.5-6 3zM14 12c4 0 7 1 7 4 0 2-2 3-4 2-1.5-1-2.5-3-3-6zM12 14c0 4-1 7-4 7-2 0-3-2-2-4 1-1.5 3-2.5 6-3zM10 12c-4 0-7-1-7-4 0-2 2-3 4-2 1.5 1 2.5 3 3 6z"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8a2.8 2.8 0 0 1-4-4l8-8-1.7-1.3a4 4 0 0 0-5-5l2.7 2.7-.6 2.3-2.3.6z" transform="translate(-2 -1)"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  building: '<path d="M4 21V5l8-3v19M12 9h8v12M2 21h20"/><path d="M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  leaf: '<path d="M20 4C10 4 4 9 4 16c0 2 .5 3.5 1.5 4.5C7 15 10.5 11 15 9c-4.5 3-7 6.5-8 11.5 1 .5 2 .5 3 .5 7 0 10-7 10-17.5z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
};

export const ICON_NAMES = Object.keys(P);

export function icon(name, cls = '', size = 24) {
  const body = P[name] || P.snow;
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
