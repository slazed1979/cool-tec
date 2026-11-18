-- ============================================================
-- Cool-Tec Webseite – Datenbank
-- Liegt im Supabase-Projekt "Familienplaner" (qkcfrqlaaeooflyzcryq), aber komplett getrennt:
-- alle Tabellen/Funktionen/Bucket beginnen mit "cooltec". Nichts davon berührt den Familienplaner.
-- ============================================================

-- Wer darf im CMS bearbeiten? (E-Mail-Adressen von Supabase-Auth-Benutzern)
create table if not exists public.cooltec_editors (
  email      text primary key,
  created_at timestamptz not null default now()
);
alter table public.cooltec_editors enable row level security;
revoke all on public.cooltec_editors from anon, authenticated;

create or replace function public.cooltec_is_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cooltec_editors e where lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.cooltec_is_editor() from public;
grant execute on function public.cooltec_is_editor() to anon, authenticated;

-- Alle Inhalte: eine Zeile = ein Eintrag (collection: settings, projects, partners, services, pages)
create table if not exists public.cooltec_content (
  collection  text        not null,
  id          text        not null,
  data        jsonb       not null default '{}'::jsonb,
  sort        integer     not null default 0,
  published   boolean     not null default true,
  updated_at  timestamptz not null default now(),
  primary key (collection, id)
);

drop trigger if exists cooltec_content_touch on public.cooltec_content;
create trigger cooltec_content_touch before update on public.cooltec_content
for each row execute function public.touch_updated_at();

alter table public.cooltec_content enable row level security;

drop policy if exists "cooltec: Web liest veröffentlichte Inhalte" on public.cooltec_content;
create policy "cooltec: Web liest veröffentlichte Inhalte" on public.cooltec_content
  for select to anon, authenticated using (published or public.cooltec_is_editor());

drop policy if exists "cooltec: Redakteure bearbeiten" on public.cooltec_content;
create policy "cooltec: Redakteure bearbeiten" on public.cooltec_content
  for all to authenticated using (public.cooltec_is_editor()) with check (public.cooltec_is_editor());

grant select on public.cooltec_content to anon, authenticated;
grant insert, update, delete on public.cooltec_content to authenticated;

-- Kontaktformular: jeder darf einfügen, nur Redakteure lesen
create table if not exists public.cooltec_messages (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 200),
  email       text not null check (char_length(email) between 3 and 200),
  phone       text check (char_length(phone) <= 60),
  subject     text check (char_length(subject) <= 200),
  message     text not null check (char_length(message) between 1 and 5000),
  status      text not null default 'neu' check (status in ('neu', 'in Arbeit', 'erledigt'))
);
alter table public.cooltec_messages enable row level security;

drop policy if exists "cooltec: jeder sendet Nachrichten" on public.cooltec_messages;
create policy "cooltec: jeder sendet Nachrichten" on public.cooltec_messages
  for insert to anon, authenticated with check (status = 'neu');

drop policy if exists "cooltec: Redakteure lesen Nachrichten" on public.cooltec_messages;
create policy "cooltec: Redakteure lesen Nachrichten" on public.cooltec_messages
  for all to authenticated using (public.cooltec_is_editor()) with check (public.cooltec_is_editor());

grant insert on public.cooltec_messages to anon, authenticated;
grant select, update, delete on public.cooltec_messages to authenticated;

-- Bilder aus dem CMS: öffentlicher Bucket "cooltec-media"
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cooltec-media', 'cooltec-media', true, 10485760, array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','application/pdf'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cooltec: Redakteure laden hoch" on storage.objects;
create policy "cooltec: Redakteure laden hoch" on storage.objects
  for insert to authenticated with check (bucket_id = 'cooltec-media' and public.cooltec_is_editor());

drop policy if exists "cooltec: Redakteure ändern Dateien" on storage.objects;
create policy "cooltec: Redakteure ändern Dateien" on storage.objects
  for update to authenticated using (bucket_id = 'cooltec-media' and public.cooltec_is_editor());

drop policy if exists "cooltec: Redakteure löschen Dateien" on storage.objects;
create policy "cooltec: Redakteure löschen Dateien" on storage.objects
  for delete to authenticated using (bucket_id = 'cooltec-media' and public.cooltec_is_editor());

-- ============================================================
-- Benutzerverwaltung (Migration „cooltec_user_management“, 18.11.2026)
-- Rollen: admin (darf Benutzer verwalten) / editor (nur Inhalte). Alles läuft über SECURITY-DEFINER-Funktionen,
-- die selbst prüfen, ob der Aufrufer Admin ist. Benutzernamen ohne E-Mail: name@team.cool-tec.lu (siehe admin/src/login.js).
-- ============================================================
alter table public.cooltec_editors add column if not exists name text;
alter table public.cooltec_editors add column if not exists role text not null default 'editor';
alter table public.cooltec_editors add column if not exists created_auth boolean not null default false; -- Konto wurde vom CMS angelegt
alter table public.cooltec_editors drop constraint if exists cooltec_editors_role_check;
alter table public.cooltec_editors add constraint cooltec_editors_role_check check (role in ('admin', 'editor'));
-- Funktionen: cooltec_is_admin(), cooltec_list_editors(), cooltec_create_editor(email, passwort, name, rolle),
--             cooltec_set_password(email, passwort), cooltec_set_role(email, rolle), cooltec_remove_editor(email)
-- Vollständiger Code: Supabase → Database → Migrations → cooltec_user_management
