-- ============================================================
-- 1 Saatte 1 Kitap — Initial Schema
-- ============================================================

-- Enable the uuid extension (needed for gen_random_uuid)
create extension if not exists "pgcrypto";

-- ─── books ────────────────────────────────────────────────────────────────────

create table if not exists public.books (
  id                 text        primary key default gen_random_uuid()::text,
  title              text        not null,
  author             text        not null,
  cover_url          text        not null default '',
  summary            text        not null default '',
  category           text        not null default 'Genel',
  duration_minutes   integer     not null default 0,
  youtube_video_id   text        not null default '',
  audio_url          text        not null default '',
  is_premium         boolean     not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger books_set_updated_at
  before update on public.books
  for each row execute procedure public.set_updated_at();

-- ─── users ────────────────────────────────────────────────────────────────────

create table if not exists public.users (
  id                  uuid        primary key references auth.users(id) on delete cascade,
  email               text,
  is_premium          boolean     not null default false,
  purchase_expiry     timestamptz,
  subscription_tier   text        not null default 'free'
                                  check (subscription_tier in ('free','monthly','yearly')),
  created_at          timestamptz not null default now()
);

-- ─── user_progress ────────────────────────────────────────────────────────────

create table if not exists public.user_progress (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references public.users(id) on delete cascade,
  book_id          text        not null references public.books(id) on delete cascade,
  position_seconds numeric     not null default 0,
  completed        boolean     not null default false,
  last_played_at   timestamptz not null default now(),
  unique (user_id, book_id)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.books         enable row level security;
alter table public.users         enable row level security;
alter table public.user_progress enable row level security;

-- books: everyone (including anon) can read
create policy "books_public_read"
  on public.books for select
  using (true);

-- books: only service_role can insert/update/delete (admin operations)
create policy "books_service_insert"
  on public.books for insert
  with check (auth.role() = 'service_role');

create policy "books_service_update"
  on public.books for update
  using (auth.role() = 'service_role');

create policy "books_service_delete"
  on public.books for delete
  using (auth.role() = 'service_role');

-- users: read/update own row only
create policy "users_own_select"
  on public.users for select
  using (auth.uid() = id);

create policy "users_own_update"
  on public.users for update
  using (auth.uid() = id);

create policy "users_own_insert"
  on public.users for insert
  with check (auth.uid() = id);

-- user_progress: read/write own rows only
create policy "progress_own_select"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "progress_own_insert"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "progress_own_update"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- ─── Auto-create user row on first sign-in ────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
