// E-Mail-Benachrichtigung bei neuen Kontakt-Nachrichten – über den Gratis-Dienst Brevo (300 Mails/Tag).
// Render-Gratis-Server dürfen keine Mails direkt (SMTP) verschicken, deshalb die Brevo-Schnittstelle (HTTPS).
//
// Einstellungen bei Render (Environment) – NIE in den Code schreiben:
//   BREVO_API_KEY  geheimer Schlüssel aus Brevo (Settings → SMTP & API → API Keys)
//   MAIL_FROM      Absender-Adresse, die in Brevo bestätigt wurde (Senders)
// Empfänger: im CMS unter „Firma & Kontakt“ → „Benachrichtigung an“ (mehrere mit Komma trennen).
// Fehlt etwas davon, wird einfach keine Mail verschickt – die Nachricht landet trotzdem im CMS.
import { esc } from './views.mjs';

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

/** „a@x.lu, b@y.lu; c@z.lu“ → ['a@x.lu', 'b@y.lu', 'c@z.lu'] (ungültige werden ignoriert, max. 10) */
export function parseRecipients(v) {
  return [...new Set(String(v || '').split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter((x) => EMAIL.test(x)))].slice(0, 10);
}

/** Inhalt der Benachrichtigung (für Brevo „smtp/email“) */
export function buildNotification(msg, site, from) {
  const to = parseRecipients(site.notifyEmails);
  if (!to.length || !from) return null;
  const subject = `Neue Nachricht über die Webseite: ${msg.subject || '(ohne Betreff)'}`.slice(0, 200);
  const rows = [
    ['Name', msg.name],
    ['E-Mail', msg.email],
    ['Telefon', msg.phone],
    ['Betreff', msg.subject],
  ].filter((r) => r[1]);
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1f2933;line-height:1.5">
<p><strong>Neue Nachricht über das Kontaktformular von ${esc(site.name || 'Cool-Tec')}</strong></p>
<table cellpadding="6" style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="color:#4d5b68">${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`).join('')}</table>
<p style="white-space:pre-wrap;background:#eef6fb;padding:12px 14px;border-radius:8px">${esc(msg.message)}</p>
<p style="color:#4d5b68;font-size:13px">„Antworten“ schreibt direkt an ${esc(msg.email)}. Die Nachricht steht außerdem im CMS unter „Nachrichten“.</p>
</div>`;
  const text = `Neue Nachricht über das Kontaktformular\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${msg.message}\n\n(„Antworten“ schreibt direkt an ${msg.email}. Die Nachricht steht außerdem im CMS.)`;
  return {
    sender: { name: `${site.name || 'Cool-Tec'} Webseite`, email: from },
    to: to.map((email) => ({ email })),
    replyTo: { email: msg.email, name: msg.name },
    subject,
    htmlContent: html,
    textContent: text,
  };
}

/** Verschickt die Benachrichtigung. Wirft nie – Fehler werden nur ins Protokoll geschrieben. */
export async function notifyNewMessage(msg, site) {
  try {
    const key = process.env.BREVO_API_KEY;
    const payload = buildNotification(msg, site, process.env.MAIL_FROM);
    if (!key || !payload) return 'aus';
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 200)}`);
    console.log('[mail] Benachrichtigung verschickt an', payload.to.length, 'Empfänger');
    return 'ok';
  } catch (e) {
    console.warn('[mail] Benachrichtigung fehlgeschlagen:', e.message);
    return 'fehler';
  }
}
