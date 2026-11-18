// Benutzernamen ohne E-Mail: „marc“ wird intern zu „marc@team.cool-tec.lu“ (Supabase braucht eine E-Mail-Form).
// An diese Adressen wird nie eine E-Mail geschickt – Passwörter setzt dann ein Admin neu.
export const USER_DOMAIN = 'team.cool-tec.lu';

/** Eingabe → Anmeldename für Supabase (oder '' wenn ungültig) */
export function toLogin(input) {
  const v = String(input || '').trim().toLowerCase();
  if (!v) return '';
  if (v.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : '';
  return /^[a-z0-9._-]{2,40}$/.test(v) ? `${v}@${USER_DOMAIN}` : '';
}

/** Anzeige: interne Adresse → nur Benutzername */
export const displayName = (email) => String(email || '').replace('@' + USER_DOMAIN, '');
