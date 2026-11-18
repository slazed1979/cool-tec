// Benutzerverwaltung: Wer darf ins CMS? Nur Admins können anlegen, Passwörter setzen und entfernen.
// Die Rechte prüft die Datenbank selbst (Funktionen cooltec_* in supabase/schema.sql), nicht nur diese Oberfläche.
import { useEffect, useState } from 'react';
import { supabase } from './data';
import { USER_DOMAIN, toLogin, displayName } from './login';

const ROLES = { admin: 'Admin (darf auch Benutzer verwalten)', editor: 'Redakteur (bearbeitet Inhalte)' };

/** Sicheres Passwort, gut abzuschreiben (ohne 0/O/1/l/I) */
function makePassword() {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const a = new Uint32Array(14);
  crypto.getRandomValues(a);
  const s = [...a].map((n) => chars[n % chars.length]).join('');
  return `${s.slice(0, 5)}-${s.slice(5, 10)}-${s.slice(10)}`;
}

const accessText = (login, pw) =>
  `Zugang zum Cool-Tec-CMS\n\nAdresse: ${location.origin}/admin\nBenutzername: ${displayName(login)}\nPasswort: ${pw}\n\nBitte nach der ersten Anmeldung oben rechts über 🔑 ein eigenes Passwort festlegen.`;

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    prompt('Bitte kopieren:', text);
    return false;
  }
}

export function Users({ me, isAdmin }) {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', login: '', password: makePassword(), role: 'editor' });
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(null); // zuletzt angelegte Zugangsdaten
  const [busy, setBusy] = useState(false);

  const load = () => supabase.rpc('cooltec_list_editors').then(({ data, error }) => (error ? setErr(error.message) : setList(data)));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setMsg('');
    const login = toLogin(form.login);
    if (!login) return setMsg('❌ Bitte einen Benutzernamen (nur Buchstaben, Zahlen, . - _) oder eine E-Mail-Adresse eingeben.');
    if (form.password.length < 10) return setMsg('❌ Das Passwort muss mindestens 10 Zeichen haben.');
    setBusy(true);
    const { data, error } = await supabase.rpc('cooltec_create_editor', { p_email: login, p_password: form.password, p_name: form.name, p_role: form.role });
    setBusy(false);
    if (error) return setMsg('❌ ' + error.message);
    if (data === 'freigeschaltet') {
      setMsg('✅ Dieses Konto gab es schon – es ist jetzt freigeschaltet. Das Passwort bleibt das bisherige.');
      setDone(null);
    } else {
      setDone({ login, password: form.password });
      setMsg('✅ Zugang angelegt.');
    }
    setForm({ name: '', login: '', password: makePassword(), role: 'editor' });
    load();
  };

  const resetPw = async (u) => {
    const pw = makePassword();
    if (!confirm(`Neues Passwort für „${u.name || displayName(u.email)}“ setzen?\nDas alte Passwort funktioniert danach nicht mehr.`)) return;
    const { error } = await supabase.rpc('cooltec_set_password', { p_email: u.email, p_password: pw });
    if (error) return alert(error.message);
    setDone({ login: u.email, password: pw });
    setMsg('✅ Neues Passwort gesetzt.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setRole = async (u, role) => {
    const { error } = await supabase.rpc('cooltec_set_role', { p_email: u.email, p_role: role });
    if (error) return alert(error.message);
    load();
  };

  const remove = async (u) => {
    if (!confirm(`Zugang von „${u.name || displayName(u.email)}“ wirklich entfernen?\nDiese Person kann sich danach nicht mehr anmelden.`)) return;
    const { error } = await supabase.rpc('cooltec_remove_editor', { p_email: u.email });
    if (error) return alert(error.message);
    load();
  };

  if (err) return <p className="error">{err}</p>;
  if (!list) return <p>Lädt …</p>;
  const isMe = (u) => u.email.toLowerCase() === (me || '').toLowerCase();

  return (
    <div className="users">
      <h2>👥 Benutzer</h2>
      <p className="desc">Wer sich im CMS anmelden darf. {isAdmin ? 'Als Admin können Sie Zugänge anlegen, Passwörter neu setzen und Zugänge entfernen.' : 'Neue Zugänge kann nur ein Admin anlegen.'}</p>

      {done && (
        <div className="card access">
          <h3>🔑 Zugangsdaten – jetzt weitergeben</h3>
          <p className="help">Das Passwort wird aus Sicherheitsgründen nur jetzt angezeigt. Später kann man es nur neu setzen.</p>
          <pre>{accessText(done.login, done.password)}</pre>
          <div className="row">
            <button onClick={async () => { if (await copy(accessText(done.login, done.password))) setMsg('📋 Kopiert – jetzt z. B. per SMS oder E-Mail weiterschicken.'); }}>📋 Zugangsdaten kopieren</button>
            <button className="ghost" onClick={() => setDone(null)}>Schließen</button>
          </div>
        </div>
      )}
      {msg && <p className={msg.startsWith('❌') ? 'error' : 'ok-msg'} role="status">{msg}</p>}

      {isAdmin && (
        <form className="card user-form" onSubmit={create}>
          <h3>+ Neuen Zugang anlegen</h3>
          <div className="grid2">
            <label>Name (wer ist das?)<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z. B. Marc Weber" /></label>
            <label>Benutzername oder E-Mail<input value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} placeholder="z. B. marc oder marc@firma.lu" autoComplete="off" required /></label>
            <label>Passwort
              <span className="row">
                <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mono" autoComplete="new-password" required />
                <button type="button" className="secondary small" onClick={() => setForm({ ...form, password: makePassword() })} title="Neues zufälliges Passwort">🎲 Neu</button>
              </span>
            </label>
            <label>Rolle
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>
          <p className="help">Mit E-Mail-Adresse kann die Person ein vergessenes Passwort selbst zurücksetzen. Mit einfachem Benutzernamen setzt ein Admin es neu.</p>
          <button type="submit" disabled={busy}>{busy ? 'Legt an …' : '✓ Zugang anlegen'}</button>
        </form>
      )}

      <table className="user-table">
        <thead><tr><th>Name</th><th>Benutzername</th><th>Rolle</th><th>Zuletzt angemeldet</th>{isAdmin && <th></th>}</tr></thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.email}>
              <td data-l="Name"><strong>{u.name || '–'}</strong>{isMe(u) && <span className="you"> (Sie)</span>}</td>
              <td data-l="Benutzername">{displayName(u.email)}</td>
              <td data-l="Rolle">
                {isAdmin && !isMe(u) ? (
                  <select value={u.role} onChange={(e) => setRole(u, e.target.value)}>
                    <option value="editor">Redakteur</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (u.role === 'admin' ? '★ Admin' : 'Redakteur')}
              </td>
              <td data-l="Zuletzt angemeldet">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('de-LU', { dateStyle: 'short', timeStyle: 'short' }) : 'noch nie'}</td>
              {isAdmin && (
                <td className="actions">
                  <div>
                    {!isMe(u) && <button className="secondary small" onClick={() => resetPw(u)}>🔑 Neues Passwort</button>}
                    {!isMe(u) && <button className="danger small" onClick={() => remove(u)}>Entfernen</button>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="help">Benutzernamen ohne @ werden intern als <code>name@{USER_DOMAIN}</code> gespeichert – dorthin wird nie eine E-Mail geschickt.</p>
    </div>
  );
}
