// Zeichnet für jede Feld-Art aus schema.js das passende Eingabefeld.
import { useEffect, useRef, useState } from 'react';
import { upload } from './data';
import { ICONS } from './schema';

export function Field({ field, value, onChange, ctx }) {
  return (
    <div className={'field f-' + field.type}>
      <label className="field-label">{field.label}</label>
      {field.help && <div className="help">{field.help}</div>}
      <Input field={field} value={value} onChange={onChange} ctx={ctx} />
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
      return (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">– bitte wählen –</option>
          {[...new Set([...cats, ...(value && !cats.includes(value) ? [value] : [])])].map((c) => <option key={c} value={c}>{c}</option>)}
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

// ---------- Liste einfacher Texte
function Strings({ value, onChange }) {
  return (
    <div className="strings">
      {value.map((s, i) => (
        <div className="row" key={i}>
          <input value={s ?? ''} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          <button type="button" className="ghost small" onClick={() => onChange(value.filter((_, j) => j !== i))} title="Entfernen">✕</button>
        </div>
      ))}
      <button type="button" className="secondary small" onClick={() => onChange([...value, ''])}>+ Zeile</button>
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
const label = (v) => (typeof v === 'string' ? v : '');

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

