// Zeichnet für jede Feld-Art aus schema.js das passende Eingabefeld.
// Textfelder sind zweisprachig (DE/FR): gespeichert wird { de: '…', fr: '…' }.
// Ein alter einsprachiger Text (nur Zeichenkette) gilt für beide Sprachen, bis man eine Sprache ändert.
import { useEffect, useRef, useState } from 'react';
import { upload } from './data';
import { ICONS } from './schema';

export const LANGS = [
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'fr', label: 'FR', name: 'Französisch' },
];
const TR_TYPES = new Set(['text', 'textarea', 'richtext']);
export const isTr = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0 && Object.keys(v).every((k) => LANGS.some((l) => l.code === k));
const empty = (x) => x == null || String(x).replace(/<[^>]+>/g, '').trim() === '';
/** Anzeigetext (deutsch bevorzugt) */
export const label = (v) => (typeof v === 'string' ? v : isTr(v) ? v.de || v.fr || '' : '');

export function Field({ field, value, onChange, ctx }) {
  const multi = TR_TYPES.has(field.type) && !field.mono;
  return (
    <div className={'field f-' + field.type + (multi ? ' f-multi' : '')}>
      <label className="field-label">{field.label}{multi && <span className="multi-hint" title="Dieses Feld gibt es auf Deutsch und Französisch"> DE/FR</span>}</label>
      {field.help && <div className="help">{field.help}</div>}
      {multi ? <Translated field={field} value={value} onChange={onChange} ctx={ctx} /> : <Input field={field} value={value} onChange={onChange} ctx={ctx} />}
    </div>
  );
}

// gemeinsam gewählte Sprache für alle großen Textfelder (Reiter)
let tabLang = 'de';
const tabListeners = new Set();
function useTabLang() {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((n) => n + 1);
    tabListeners.add(f);
    return () => tabListeners.delete(f);
  }, []);
  return [tabLang, (l) => { tabLang = l; tabListeners.forEach((f) => f()); }];
}

/** Schreibt eine Sprache, ohne die andere zu verlieren */
export function setTr(value, lang, v) {
  const next = {};
  for (const l of LANGS) next[l.code] = isTr(value) ? value[l.code] : value;
  next[lang] = v;
  for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k];
  return next;
}

function Translated({ field, value, onChange, ctx }) {
  const get = (l) => (isTr(value) ? value[l] : value);
  const missing = (l) => (isTr(value) ? empty(value[l]) : empty(value));
  const [active, setActive] = useTabLang();
  if (field.type !== 'richtext') {
    return (
      <div className="i18n">
        {LANGS.map((l) => (
          <label key={l.code} className={missing(l.code) ? 'missing' : ''} title={missing(l.code) ? 'Noch nicht übersetzt' : l.name}>
            <span className="flag">{l.label}{missing(l.code) ? ' ⚠' : ''}</span>
            <Input field={field} value={get(l.code)} onChange={(v) => onChange(setTr(value, l.code, v))} ctx={ctx} />
          </label>
        ))}
      </div>
    );
  }
  return (
    <div className="tr-tabs">
      <div className="tr-bar" role="tablist">
        {LANGS.map((l) => (
          <button key={l.code} type="button" role="tab" aria-selected={active === l.code} className={(active === l.code ? 'on' : '') + (missing(l.code) ? ' missing' : '')} onClick={() => setActive(l.code)} title={missing(l.code) ? 'Noch nicht übersetzt' : l.name}>
            {active === l.code ? '● ' : ''}{l.label}{missing(l.code) ? ' ⚠' : ''}
          </button>
        ))}
        {!isTr(value) && !empty(value) && <span className="tr-note">gleicher Text in beiden Sprachen – noch nicht übersetzt</span>}
      </div>
      <Input key={active} field={field} value={get(active) ?? ''} onChange={(v) => onChange(setTr(value, active, v))} ctx={ctx} />
    </div>
  );
}

function Input({ field, value, onChange, ctx }) {
  switch (field.type) {
    case 'text':
      return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'textarea':
      return <textarea rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'code':
      return <textarea className="mono" rows={10} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'date':
      return <input type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'bool0':
      return (
        <label className="switch"><input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} /> <span>{value === true ? 'Ja' : 'Nein'}</span></label>
      );
    case 'category': {
      const cats = ctx.rows.find((r) => r.collection === 'projectsPage')?.data?.categories || [];
      const key = (c) => label(c);
      const cur = cats.findIndex((c) => key(c) === key(value));
      return (
        <select value={cur} onChange={(e) => onChange(cats[Number(e.target.value)] ?? '')}>
          <option value={-1}>{value && cur < 0 ? `${key(value)} (nicht mehr in der Liste)` : '– bitte wählen –'}</option>
          {cats.map((c, i) => <option key={i} value={i}>{key(c)}{isTr(c) && c.fr ? ` / ${c.fr}` : ''}</option>)}
        </select>
      );
    }
    case 'bool':
      return (
        <label className="switch"><input type="checkbox" checked={value !== false} onChange={(e) => onChange(e.target.checked)} /> <span>{value !== false ? 'Ja' : 'Nein'}</span></label>
      );
    case 'hide':
      return (
        <label className="switch"><input type="checkbox" checked={value === false} onChange={(e) => onChange(e.target.checked ? false : undefined)} /> <span>{value === false ? 'Ausgeblendet' : 'Sichtbar'}</span></label>
      );
    case 'select':
      return (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case 'link':
      return (
        <>
          <input list="all-links" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="/seite oder https://…" />
          {value && <a className="tiny" href={value} target="_blank" rel="noreferrer">↗ öffnen</a>}
        </>
      );
    case 'icon':
      return (
        <div className="icons">
          {ICONS.map((n) => (
            <button key={n} type="button" className={'icon-btn' + (value === n ? ' on' : '')} onClick={() => onChange(n)} title={n}>
              <img src={`/admin-icon/${n}.svg`} alt={n} onError={(e) => (e.currentTarget.style.display = 'none')} />
              <span>{n}</span>
            </button>
          ))}
        </div>
      );
    case 'image':
      return <ImageInput value={value} onChange={onChange} />;
    case 'images':
      return <ImagesInput value={value || []} onChange={onChange} />;
    case 'file':
      return <FileInput value={value} onChange={onChange} />;
    case 'richtext':
      return <RichText value={value} onChange={onChange} />;
    case 'strings':
      return <Strings value={value || []} onChange={onChange} />;
    case 'object':
      return (
        <div className="object">
          {field.fields.map((f) => (
            <Field key={f.key} field={f} ctx={ctx} value={(value || {})[f.key]} onChange={(v) => onChange({ ...(value || {}), [f.key]: v })} />
          ))}
        </div>
      );
    case 'list':
      return <List field={field} value={value || []} onChange={onChange} ctx={ctx} />;
    default:
      return <textarea className="mono" rows={4} value={JSON.stringify(value ?? null, null, 2)} readOnly />;
  }
}

// ---------- Liste einfacher Texte (jede Zeile auf DE + FR)
function Strings({ value, onChange }) {
  return (
    <div className="strings">
      {value.map((s, i) => (
        <div className="row str-row" key={i}>
          <div className="i18n">
            {LANGS.map((l) => (
              <label key={l.code}>
                <span className="flag">{l.label}</span>
                <input value={(isTr(s) ? s[l.code] : s) ?? ''} onChange={(e) => onChange(value.map((x, j) => (j === i ? setTr(x, l.code, e.target.value) : x)))} />
              </label>
            ))}
          </div>
          <button type="button" className="ghost small" onClick={() => onChange(value.filter((_, j) => j !== i))} title="Entfernen">✕</button>
        </div>
      ))}
      <button type="button" className="secondary small" onClick={() => onChange([...value, { de: '', fr: '' }])}>+ Zeile</button>
    </div>
  );
}

// ---------- Bilder & Dateien
function Uploader({ accept, onDone, label }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <>
      <input ref={ref} type="file" accept={accept} hidden onChange={async (e) => {
        const f = e.target.files?.[0];
        e.target.value = '';
        if (!f) return;
        setBusy(true); setErr('');
        try { onDone(await upload(f), f); } catch (x) { setErr(x.message); } finally { setBusy(false); }
      }} />
      <button type="button" className="secondary small" disabled={busy} onClick={() => ref.current.click()}>{busy ? 'Lädt hoch …' : label}</button>
      {err && <span className="error">{err}</span>}
    </>
  );
}

function ImageInput({ value, onChange }) {
  return (
    <div className="image-input">
      {value ? <img src={value} alt="" /> : <div className="ph">kein Bild</div>}
      <div className="col">
        <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="Bild-Adresse" />
        <div className="row">
          <Uploader accept="image/*" label="⬆ Bild hochladen" onDone={(url) => onChange(url)} />
          {value && <button type="button" className="ghost small" onClick={() => onChange('')}>entfernen</button>}
        </div>
      </div>
    </div>
  );
}

function ImagesInput({ value, onChange }) {
  return (
    <div className="images">
      {value.map((src, i) => (
        <div className="thumb" key={i}><img src={src} alt="" /><button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button></div>
      ))}
      <Uploader accept="image/*" label="+ Bild" onDone={(url) => onChange([...value, url])} />
    </div>
  );
}

function FileInput({ value, onChange }) {
  return (
    <div className="col">
      <div className="row">
        <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="/media/… oder https://…" />
        {value && <a className="tiny" href={value} target="_blank" rel="noreferrer">↗ öffnen</a>}
      </div>
      <div className="row"><Uploader accept=".pdf,image/*" label="⬆ Datei hochladen (PDF)" onDone={(url) => onChange(url)} /></div>
    </div>
  );
}

// ---------- Text-Editor mit einfacher Werkzeugleiste
function RichText({ value, onChange }) {
  const ref = useRef();
  const [source, setSource] = useState(false);
  const last = useRef(value);
  useEffect(() => {
    if (ref.current && value !== last.current) {
      ref.current.innerHTML = value || '';
      last.current = value;
    }
  }, [value, source]);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || '';
  }, [source]); // eslint-disable-line
  const emit = () => {
    last.current = ref.current.innerHTML;
    onChange(ref.current.innerHTML);
  };
  const cmd = (c, arg) => {
    document.execCommand(c, false, arg);
    ref.current.focus();
    emit();
  };
  return (
    <div className="rte">
      <div className="toolbar">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); cmd('bold'); }} title="Fett"><b>B</b></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); cmd('italic'); }} title="Kursiv"><i>I</i></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); cmd('underline'); }} title="Unterstrichen"><u>U</u></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); cmd('formatBlock', 'h2'); }}>H2</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); cmd('formatBlock', 'h3'); }}>H3</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); cmd('formatBlock', 'p'); }}>¶</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); cmd('insertUnorderedList'); }} title="Aufzählung">• Liste</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); cmd('insertOrderedList'); }} title="Nummeriert">1. Liste</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); const u = prompt('Link-Adresse (https://… oder /seite oder mailto:…)'); if (u) cmd('createLink', u); }}>🔗 Link</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); cmd('unlink'); }}>Link weg</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); cmd('removeFormat'); }} title="Formatierung entfernen">⌫ Format</button>
        <button type="button" className={source ? 'on' : ''} onClick={() => setSource(!source)}>{'</>'} HTML</button>
      </div>
      {source ? (
        <textarea className="mono" rows={12} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div ref={ref} className="rte-area rich" contentEditable suppressContentEditableWarning onInput={emit} onBlur={emit} />
      )}
    </div>
  );
}

// ---------- Listen (sortierbar)
const move = (arr, i, d) => {
  const a = [...arr];
  const j = i + d;
  if (j < 0 || j >= a.length) return a;
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

function List({ field, value, onChange, ctx }) {
  const [open, setOpen] = useState(() => (value.length <= 1 ? 0 : -1));
  return (
    <div className="list">
      {value.map((item, i) => (
        <div className={'list-item' + (open === i ? ' open' : '')} key={i}>
          <div className="list-head" onClick={() => setOpen(open === i ? -1 : i)}>
            <span className="caret">{open === i ? '▾' : '▸'}</span>
            <span className="lt">{label(item?.[field.itemTitle]) || `Eintrag ${i + 1}`}</span>
            <span className="actions" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="ghost small" onClick={() => onChange(move(value, i, -1))} title="Nach oben">↑</button>
              <button type="button" className="ghost small" onClick={() => onChange(move(value, i, 1))} title="Nach unten">↓</button>
              <button type="button" className="ghost small" onClick={() => { if (confirm('Eintrag entfernen?')) onChange(value.filter((_, j) => j !== i)); }} title="Entfernen">✕</button>
            </span>
          </div>
          {open === i && (
            <div className="list-body">
              {field.fields.map((f) => (
                <Field key={f.key} field={f} ctx={ctx} value={item?.[f.key]} onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, [f.key]: v } : x)))} />
              ))}
            </div>
          )}
        </div>
      ))}
      <button type="button" className="secondary small" onClick={() => { onChange([...value, {}]); setOpen(value.length); }}>+ Hinzufügen</button>
    </div>
  );
}

