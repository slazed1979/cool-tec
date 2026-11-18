// Eingang: Nachrichten aus dem Kontaktformular der Webseite (Tabelle cooltec_messages)
import { useEffect, useState } from 'react';
import { MESSAGES, supabase } from './data';

const STATUS = ['neu', 'in Arbeit', 'erledigt'];

export function Messages({ onChange = () => {} }) {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const load = () => supabase.from(MESSAGES).select('*').order('created_at', { ascending: false }).limit(300).then(({ data, error }) => (error ? setErr(error.message) : setList(data)));
  useEffect(() => { load(); onChange(); }, []); // eslint-disable-line
  const setStatus = async (m, status) => {
    const { error } = await supabase.from(MESSAGES).update({ status }).eq('id', m.id);
    if (error) return alert(error.message);
    setList((l) => l.map((x) => (x.id === m.id ? { ...x, status } : x)));
    onChange();
  };
  const remove = async (m) => {
    if (!confirm('Nachricht endgültig löschen?')) return;
    const { error } = await supabase.from(MESSAGES).delete().eq('id', m.id);
    if (error) return alert(error.message);
    setList((l) => l.filter((x) => x.id !== m.id));
    onChange();
  };
  if (err) return <p className="error">{err}</p>;
  if (!list) return <p>Lädt …</p>;
  return (
    <div className="messages">
      <h2>✉️ Kontakt-Nachrichten</h2>
      <p className="desc">Anfragen aus dem Kontaktformular der Webseite. Antworten über den Knopf „↩ Antworten“ (öffnet Ihr E-Mail-Programm).</p>
      {!list.length && <p className="hint">Noch keine Nachrichten.</p>}
      {list.map((m) => (
        <article key={m.id} className={'msg-card s-' + m.status.replace(' ', '-')}>
          <header>
            <strong>{m.status === 'neu' ? '🆕 ' : m.status === 'erledigt' ? '✔ ' : '⏳ '}{m.subject || '(ohne Betreff)'}</strong>
            <span className="muted">{new Date(m.created_at).toLocaleString('de-LU')}</span>
          </header>
          <p className="from">{m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || ''))}`}>{m.email}</a>{m.phone ? ' · ' + m.phone : ''}</p>
          <p className="body">{m.message}</p>
          <footer className="row">
            {STATUS.map((s) => <button key={s} className={m.status === s ? 'small' : 'secondary small'} aria-pressed={m.status === s} onClick={() => setStatus(m, s)}>{m.status === s ? '● ' : ''}{s}</button>)}
            <a className="button secondary small" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || ''))}`}>↩ Antworten</a>
            <button className="danger small" onClick={() => remove(m)}>Löschen</button>
          </footer>
        </article>
      ))}
    </div>
  );
}
