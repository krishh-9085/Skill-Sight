-- 1) Create table (and migrate existing installs)
create table if not exists public.resumes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  company_name text,
  job_title text,
  job_description text,
  image_path text not null,
  resume_path text not null,
  feedback jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.resumes
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.resumes
  alter column user_id set default auth.uid();

create index if not exists resumes_user_created_idx
  on public.resumes (user_id, created_at desc);

-- 2) Enable RLS
alter table public.resumes enable row level security;

-- 3) Strict per-user RLS policies
drop policy if exists "resumes_select_own" on public.resumes;
create policy "resumes_select_own"
on public.resumes for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "resumes_insert_own" on public.resumes;
create policy "resumes_insert_own"
on public.resumes for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "resumes_update_own" on public.resumes;
create policy "resumes_update_own"
on public.resumes for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "resumes_delete_own" on public.resumes;
create policy "resumes_delete_own"
on public.resumes for delete
to authenticated
using (auth.uid() = user_id);

-- Remove legacy permissive policies if present
drop policy if exists "resumes_select_all" on public.resumes;
drop policy if exists "resumes_insert_all" on public.resumes;
drop policy if exists "resumes_update_all" on public.resumes;
drop policy if exists "resumes_delete_all" on public.resumes;

-- 4) Create storage bucket (private)
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- 5) Strict per-user storage policies
-- Required path format: <auth.uid()>/<random>/<filename>
drop policy if exists "storage_resumes_select_own" on storage.objects;
create policy "storage_resumes_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'resumes'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "storage_resumes_insert_own" on storage.objects;
create policy "storage_resumes_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "storage_resumes_update_own" on storage.objects;
create policy "storage_resumes_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'resumes'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'resumes'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "storage_resumes_delete_own" on storage.objects;
create policy "storage_resumes_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'resumes'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Remove legacy permissive storage policies if present
drop policy if exists "storage_resumes_select_all" on storage.objects;
drop policy if exists "storage_resumes_insert_all" on storage.objects;
drop policy if exists "storage_resumes_update_all" on storage.objects;
drop policy if exists "storage_resumes_delete_all" on storage.objects;
