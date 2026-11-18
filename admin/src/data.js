// Datenzugriff fürs CMS: liest/schreibt die Tabelle cooltec_content in Supabase (Projekt „Familienplaner“, eigene Tabellen).
import { createClient } from '@supabase/supabase-js';
import config from '../../data/supabase.json';

export const supabase = createClient(config.url, config.key);
const TABLE = config.table;
export const MESSAGES = config.messages;

export async function loadAll() {
  const { data, error } = await supabase.from(TABLE).select('collection,id,data,sort,published,updated_at').order('sort').limit(5000);
  if (error) throw new Error(error.message);
  return data;
}

/** Bin ich als Redakteur eingetragen? (Tabelle cooltec_editors) */
export async function amEditor() {
  const { data, error } = await supabase.rpc('cooltec_is_editor');
  if (error) throw new Error(error.message);
  return data === true;
}

/** Anzahl der Kontakt-Nachrichten mit Status „neu“ */
export async function countNew() {
  const { count, error } = await supabase.from(MESSAGES).select('id', { count: 'exact', head: true }).eq('status', 'neu');
  if (error) throw new Error(error.message);
  return count || 0;
}

/** Webseite sofort neu laden lassen (Zwischenspeicher leeren) */
export const refreshSite = () => fetch('/api/refresh', { method: 'POST' }).catch(() => {});

export async function saveRow(row, oldId) {
  if (oldId && oldId !== row.id) {
    const del = await supabase.from(TABLE).delete().match({ collection: row.collection, id: oldId });
    if (del.error) throw new Error(del.error.message);
  }
  const { collection, id, data, sort, published } = row;
  const { error } = await supabase.from(TABLE).upsert({ collection, id, data, sort, published });
  if (error) throw new Error(error.message);
  refreshSite();
}

export async function saveSorts(rows) {
  const { error } = await supabase.from(TABLE).upsert(rows.map(({ collection, id, data, sort, published }) => ({ collection, id, data, sort, published })));
  if (error) throw new Error(error.message);
  refreshSite();
}

export async function deleteRow(collection, id) {
  const { error } = await supabase.from(TABLE).delete().match({ collection, id });
  if (error) throw new Error(error.message);
  refreshSite();
}

// ---------- Dateien hochladen (Bucket "cooltec-media")
const slug = (name) =>
  name.toLowerCase().replace(/\.[a-z0-9]+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'datei';

async function shrink(file, max, quality = 0.82) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Bild konnte nicht umgewandelt werden'))), 'image/webp', quality));
}

/** Fotos werden automatisch auf max. 1920 px verkleinert (WebP). SVG/GIF/PDF bleiben unverändert (max. 10 MB). */
export async function upload(file) {
  let blob = file;
  let ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  let type = file.type || 'application/octet-stream';
  if (/^image\//.test(type) && !/gif|svg/.test(type)) {
    blob = await shrink(file, 1920);
    ext = 'webp';
    type = 'image/webp';
  }
  if (blob.size > 10 * 1024 * 1024) throw new Error('Datei zu groß (max. 10 MB).');
  const path = `${new Date().toISOString().slice(0, 7)}/${Date.now().toString(36)}-${slug(file.name)}.${ext}`;
  const { error } = await supabase.storage.from(config.bucket).upload(path, blob, { contentType: type, cacheControl: '31536000' });
  if (error) throw new Error(error.message);
  return supabase.storage.from(config.bucket).getPublicUrl(path).data.publicUrl;
}
