-- OpenWhen Clone — Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New Query)

-- ── Letters table ─────────────────────────────────────────────────────────────
create table if not exists letters (
  id                uuid primary key default gen_random_uuid(),
  title             text not null default '',
  message           text not null default '',
  signature         text default '',
  font              text default 'playfair',
  sticker           text default '',
  bg_color          text default 'parchment',
  guardian_question text not null default '',
  guardian_answer   text not null default '',
  question_type     text default 'text' check (question_type in ('text','multiple')),
  multiple_choices  jsonb default '[]',
  song_url          text default '',
  song_title        text default '',
  photo_url         text default '',
  gift_url          text default '',
  voice_url         text default '',
  typewriter_effect boolean default false,
  opened            boolean default false,
  created_at        timestamptz default now(),
  expires_at        timestamptz default now() + interval '30 days'
);

-- ── Jars table ────────────────────────────────────────────────────────────────
create table if not exists jars (
  id          uuid primary key default gen_random_uuid(),
  title       text default 'A Jar of Notes',
  notes       jsonb default '[]',
  unlock_mode text default 'daily' check (unlock_mode in ('daily','weekly','all')),
  created_at  timestamptz default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists letters_expires_at_idx on letters (expires_at);
create index if not exists letters_created_at_idx on letters (created_at);
create index if not exists jars_created_at_idx    on jars (created_at);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table letters enable row level security;
alter table jars    enable row level security;

-- Letters: anyone can read or insert (no account required)
create policy "letters_select_all" on letters
  for select using (true);

create policy "letters_insert_all" on letters
  for insert with check (true);

create policy "letters_update_all" on letters
  for update using (true);

-- Jars: anyone can read or insert
create policy "jars_select_all" on jars
  for select using (true);

create policy "jars_insert_all" on jars
  for insert with check (true);

-- ── Storage buckets ───────────────────────────────────────────────────────────
-- Run these after enabling Storage in Supabase Dashboard

insert into storage.buckets (id, name, public)
values ('letter-photos', 'letter-photos', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('voice-memos', 'voice-memos', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('gift-cards', 'gift-cards', true)
on conflict do nothing;

-- Storage policies (public read, anyone can upload)
create policy "letter_photos_public_read" on storage.objects
  for select using (bucket_id = 'letter-photos');

create policy "letter_photos_insert" on storage.objects
  for insert with check (bucket_id = 'letter-photos');

create policy "voice_memos_public_read" on storage.objects
  for select using (bucket_id = 'voice-memos');

create policy "voice_memos_insert" on storage.objects
  for insert with check (bucket_id = 'voice-memos');

create policy "gift_cards_public_read" on storage.objects
  for select using (bucket_id = 'gift-cards');

create policy "gift_cards_insert" on storage.objects
  for insert with check (bucket_id = 'gift-cards');

-- ── Cleanup function (optional — call via cron or pg_cron) ───────────────────
create or replace function delete_expired_letters()
returns void language sql as $$
  delete from letters where expires_at < now();
$$;
