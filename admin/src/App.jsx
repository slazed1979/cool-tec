import { useCallback, useEffect, useMemo, useState } from 'react';
import { amEditor, deleteRow, loadAll, saveRow, saveSorts, supabase } from './data';
import { Field } from './fields';
import { COLLECTIONS, slugify } from './schema';
import { Messages } from './Messages';

// ---------------- Anmeldung
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError('Anmeldung fehlgeschlagen: ' + error.message);
  };
  return (
    <div className="login">
      <form onSubmit={submit} className="card">
        <img src="/brand/logo.png" alt="Cool-Tec" style={{ height: 56, width: 'auto', justifySelf: 'center' }} />
        <h1>CMS · Webseite</h1>
        <p className="help">Hier ändern Sie alle Inhalte der Webseite. Passwort vergessen? Unten auf „Passwort vergessen“ klicken.</p>
        <label>E-Mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label>
        <label>Passwort<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={busy}>{busy ? '…' : 'Anmelden'}</button>
        <button type="button" className="ghost small" onClick={async () => {
          if (!email) { setError('Bitte zuerst die E-Mail-Adresse eintragen.'); return; }
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/admin/' });
          setError(error ? 'Fehler: ' + error.message : '📧 Falls die Adresse bekannt ist, kommt gleich eine E-Mail mit einem Link.');
        }}>Passwort vergessen</button>
      </form>
    </div>
  );
}

// ---------------- Passwort ändern (auch nach „Passwort vergessen“-Link)
function PasswordDialog({ onClose, forced }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 10) return setMsg('❌ Bitte mindestens 10 Zeichen.');
    if (pw !== pw2) return setMsg('❌ Die beiden Eingaben sind nicht gleich.');
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return setMsg('❌ ' + error.message);
    setMsg('✅ Neues Passwort gespeichert.');
    setTimeout(onClose, 1200);
  };
  return (
    <div className="login overlay">
      <form onSubmit={submit} className="card">
        <h2>🔑 {forced ? 'Neues Passwort festlegen' : 'Passwort ändern'}</h2>
        <label>Neues Passwort<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required /></label>
        <label>Noch einmal<input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" required /></label>
        {msg && <div className={msg.startsWith('✅') ? '' : 'error'}>{msg}</div>}
        <div className="row"><button type="submit">Speichern</button>{!forced && <button type="button" className="ghost" onClick={onClose}>Abbrechen</button>}</div>
      </form>
    </div>
  );
}

// ---------------- Editor eines Eintrags
function Editor({ def, row, rows, onSaved, onDeleted, isNew }) {
  const [draft, setDraft] = useState(row);
  const [json, setJson] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { setDraft(row); setJson(null); setMsg(''); }, [row]);
  const dirty = isNew || JSON.stringify(draft) !== JSON.stringify(row);

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = async () => {
    let next = draft;
    if (json !== null) {
      try { next = { ...draft, data: JSON.parse(json) }; } catch { setMsg('❌ Das JSON ist ungültig.'); return; }
    }
    if (isNew && def.newId) next = { ...next, id: next.id && next.id !== 'neu' ? next.id : def.newId(next.data) };
    if (!/^[\w.-]+$/.test(next.id)) { setMsg('❌ Die ID darf nur Buchstaben, Zahlen, - _ . enthalten.'); return; }
    if (isNew && rows.some((r) => r.collection === next.collection && r.id === next.id)) { setMsg('❌ Diese ID gibt es schon – bitte ändern.'); return; }
    if (def.key === 'pages' && !/^\/[\w/-]*$/.test(String(next.data.path || ''))) { setMsg('❌ Die Adresse muss mit / beginnen und darf nur Buchstaben, Zahlen, - und / enthalten.'); return; }
    setBusy(true);
    try {
      await saveRow(next, !isNew && row.id !== next.id ? row.id : undefined);
      setMsg('✅ Gespeichert – auf der Webseite in wenigen Sekunden sichtbar.');
      setJson(null);
      onSaved(next, isNew ? null : row.id);
    } catch (e) { setMsg('❌ ' + e.message); } finally { setBusy(false); }
  };

  const viewUrl = def.view ? def.view(draft.data, draft.id) : null;
  return (
    <div className="editor">
      <div className="editor-head">
        <h2>{def.title(draft.data) || '(ohne Titel)'}</h2>
        <div className="row">
          {viewUrl && !isNew && <a className="button secondary" href={viewUrl} target="_blank" rel="noreferrer">👁 Ansehen</a>}
          {!def.single && (
            <label className="switch"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} /> <span>{draft.published ? 'Veröffentlicht' : 'Entwurf (unsichtbar)'}</span></label>
          )}
        </div>
      </div>
      {!def.single && (
        <div className="field">
          <label className="field-label">ID (technischer Name)</label>
          <div className="help">{def.newId ? 'Leer lassen = wird automatisch aus dem Titel gebildet. ' : ''}Wird für Links benutzt; nachträglich ändern macht alte Links ungültig.</div>
          <input value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value.trim() })} />
        </div>
      )}
      {json === null ? (
        def.fields.map((f) => (
          <Field key={f.key} field={f} ctx={{ rows }} value={draft.data[f.key]} onChange={(v) => setDraft((d) => ({ ...d, data: { ...d.data, [f.key]: v } }))} />
        ))
      ) : (
        <div className="field">
          <label className="field-label">Experten-Ansicht (JSON)</label>
          <div className="help">Hier lässt sich wirklich alles bearbeiten – auch Felder, die es im Formular nicht gibt.</div>
          <textarea className="mono" rows={28} value={json} onChange={(e) => setJson(e.target.value)} />
        </div>
      )}
      <div className="editor-foot">
        <button onClick={save} disabled={busy || (!dirty && json === null)}>{busy ? 'Speichert …' : '💾 Speichern'}</button>
        <button className="secondary" onClick={() => setJson(json === null ? JSON.stringify(draft.data, null, 2) : null)}>{json === null ? '{ } JSON' : '← Formular'}</button>
        {!def.single && !isNew && (
          <button className="danger" onClick={async () => {
            if (!confirm(`„${def.title(draft.data)}“ wirklich löschen? Das kann nicht rückgängig gemacht werden.`)) return;
            try { await deleteRow(row.collection, row.id); onDeleted(row.id); } catch (e) { setMsg('❌ ' + e.message); }
          }}>🗑 Löschen</button>
        )}
        <span className="msg">{msg || (dirty && !isNew ? 'Ungespeicherte Änderungen' : '')}</span>
      </div>
    </div>
  );
}

// ---------------- Hauptansicht
export default function App() {
  const [session, setSession] = useState(undefined);
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [col, setCol] = useState(() => (/^#\w+(\/|$)/.test(location.hash) && !location.hash.includes('=') ? location.hash.slice(1).split('/')[0] : '') || 'home');
  const [sel, setSel] = useState(() => (location.hash.includes('=') ? '' : decodeURIComponent(location.hash.slice(1).split('/')[1] || '')));
  const [q, setQ] = useState('');
  const [newRow, setNewRow] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editor, setEditor] = useState(undefined);
  const [pwOpen, setPwOpen] = useState(() => /type=recovery/.test(location.hash) ? 'forced' : false);

  useEffect(() => {
    // Nur für lokale Tests (npm run dev mit VITE_DEMO=1): ohne Anmeldung ansehen, Speichern geht dann nicht
    if (import.meta.env.DEV && import.meta.env.VITE_DEMO) return setSession({ user: { email: 'demo (nur lesen)' } });
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((ev, s) => { setSession(s); if (ev === 'PASSWORD_RECOVERY') setPwOpen('forced'); });
    return () => data.subscription.unsubscribe();
  }, []);
  const reload = useCallback(() => loadAll().then(setRows).catch((e) => setErr(e.message)), []);
  useEffect(() => {
    if (!session) return;
    if (import.meta.env.DEV && import.meta.env.VITE_DEMO) { setEditor(true); reload(); return; }
    amEditor().then((ok) => { setEditor(ok); if (ok) reload(); }).catch((e) => setErr(e.message));
  }, [session, reload]);
  useEffect(() => { if (!pwOpen) history.replaceState(null, '', `#${col}${sel ? '/' + encodeURIComponent(sel) : ''}`); }, [col, sel, pwOpen]);

  const def = COLLECTIONS.find((c) => c.key === col);
  const items = useMemo(() => {
    if (!rows || !def) return [];
    let list = rows.filter((r) => r.collection === col);
    if (def.newestFirst) list = [...list].sort((a, b) => (b.data.date || '').localeCompare(a.data.date || ''));
    else list = [...list].sort((a, b) => a.sort - b.sort);
    if (q) {
      const n = q.toLowerCase();
      list = list.filter((r) => JSON.stringify(r.data).toLowerCase().includes(n) || r.id.includes(n));
    }
    return list;
  }, [rows, col, q, def]);

  if (session === undefined) return <div className="loading">Lädt …</div>;
  if (!session) return <Login />;
  if (pwOpen) return <PasswordDialog forced={pwOpen === 'forced'} onClose={() => setPwOpen(false)} />;
  if (editor === false) return (
    <div className="loading">
      <p>Sie sind als <b>{session.user.email}</b> angemeldet, aber (noch) nicht als Redakteur freigeschaltet.</p>
      <button onClick={() => supabase.auth.signOut()}>Abmelden</button>
    </div>
  );
  if (err) return <div className="loading error">Fehler: {err} <button onClick={() => { setErr(''); reload(); }}>Nochmal</button></div>;
  if (!rows) return <div className="loading">Inhalte werden geladen …</div>;

  const current = def?.single ? rows.find((r) => r.collection === col) || { collection: col, id: def.singleId, data: {}, sort: 1, published: true } : rows.find((r) => r.collection === col && r.id === sel);
  const groups = [...new Set(COLLECTIONS.map((c) => c.group))];
  const allLinks = ['/', '/projekte', '/partner', '/#kontakt', ...rows.filter((r) => r.collection === 'pages').map((r) => r.data.path), ...rows.filter((r) => r.collection === 'projects').map((r) => '/projekte/' + r.id)];

  const pick = (k) => { setCol(k); setSel(''); setNewRow(null); setQ(''); setMenuOpen(false); };
  if (!def && col !== 'messages') { setTimeout(() => pick('home')); return null; }
  const startNew = () => {
    const sort = Math.max(0, ...rows.filter((r) => r.collection === col).map((r) => r.sort)) + 1;
    setSel('');
    setNewRow({ collection: col, id: '', data: def.defaults ? def.defaults() : {}, sort, published: true });
  };
  const onSaved = (r, oldId) => {
    setRows((rs) => [...rs.filter((x) => !(x.collection === r.collection && (x.id === r.id || x.id === oldId))), r]);
    setNewRow(null);
    setSel(r.id);
  };
  const moveItem = async (i, d) => {
    const list = [...items];
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const updated = list.map((r, k) => ({ ...r, sort: k + 1 }));
    setRows((rs) => [...rs.filter((x) => x.collection !== col), ...updated]);
    try { await saveSorts(updated); } catch (e) { alert(e.message); }
  };

  return (
    <div className="app">
      <datalist id="all-links">{allLinks.map((l) => <option key={l} value={l} />)}</datalist>
      <header className="topbar">
        <button className="ghost burger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <img src="/brand/logo.png" alt="" style={{ height: 32, width: 'auto' }} />
        <strong>CMS</strong>
        <span className="spacer" />
        <a className="button secondary small" href="/" target="_blank" rel="noreferrer">🌐 Webseite</a>
        <span className="who">{session.user.email}</span>
        <button className="ghost small" onClick={() => setPwOpen(true)} title="Passwort ändern">🔑</button>
        <button className="ghost small" onClick={() => supabase.auth.signOut()}>Abmelden</button>
      </header>
      <div className="main">
        <nav className={'side' + (menuOpen ? ' open' : '')}>
          {groups.map((g) => (
            <div key={g}>
              <div className="group">{g}</div>
              {COLLECTIONS.filter((c) => c.group === g).map((c) => (
                <button key={c.key} className={'nav' + (c.key === col ? ' on' : '')} onClick={() => pick(c.key)}>
                  <span>{c.emoji}</span> {c.label} {!c.single && <em>{rows.filter((r) => r.collection === c.key).length}</em>}
                </button>
              ))}
            </div>
          ))}
          <div className="group">Eingang</div>
          <button className={'nav' + (col === 'messages' ? ' on' : '')} onClick={() => pick('messages')}><span>✉️</span> Kontakt-Nachrichten</button>
        </nav>
        {col === 'messages' ? (
          <section className="content"><Messages /></section>
        ) : def.single ? (
          <section className="content"><p className="desc">{def.description}</p><Editor def={def} row={current} rows={rows} onSaved={onSaved} onDeleted={() => {}} isNew={!rows.find((r) => r.collection === col)} /></section>
        ) : (
          <>
            <section className={'listpane' + (sel || newRow ? ' has-sel' : '')}>
              <div className="list-top">
                <h2>{def.emoji} {def.label}</h2>
                <p className="desc">{def.description}</p>
                <div className="row">
                  <input className="search" placeholder="Suchen …" value={q} onChange={(e) => setQ(e.target.value)} />
                  <button onClick={startNew}>+ Neu</button>
                </div>
              </div>
              <ul className="items">
                {items.map((r, i) => (
                  <li key={r.id} className={(r.id === sel ? 'on' : '') + (r.published ? '' : ' draft')}>
                    <button className="item" onClick={() => { setSel(r.id); setNewRow(null); }}>
                      <span className="it">{def.title(r.data) || r.id}</span>
                      {def.subtitle && <span className="is">{def.subtitle(r.data)}</span>}
                      {!r.published && <span className="badge">Entwurf</span>}
                    </button>
                    {def.sortable && !q && (
                      <span className="sorter"><button className="ghost small" onClick={() => moveItem(i, -1)}>↑</button><button className="ghost small" onClick={() => moveItem(i, 1)}>↓</button></span>
                    )}
                  </li>
                ))}
                {!items.length && <li className="empty">Nichts gefunden.</li>}
              </ul>
            </section>
            <section className="content">
              {(sel || newRow) && <button className="ghost back-btn" onClick={() => { setSel(''); setNewRow(null); }}>← Liste</button>}
              {newRow ? (
                <Editor def={def} row={newRow} rows={rows} isNew onSaved={onSaved} onDeleted={() => {}} />
              ) : current ? (
                <Editor def={def} row={current} rows={rows} onSaved={onSaved} onDeleted={(id) => { setRows((rs) => rs.filter((x) => !(x.collection === col && x.id === id))); setSel(''); }} />
              ) : (
                <div className="hint">← Links einen Eintrag wählen oder „+ Neu“ anlegen.</div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export { slugify };
