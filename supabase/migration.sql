-- HR CRM: vacancies + candidates schema, RLS policies, storage bucket
-- Run this in the Supabase SQL Editor (or via `supabase db push`) on a fresh project.

create extension if not exists "pgcrypto";

-- ─── Tables ────────────────────────────────────────────────────────────────

create table if not exists vacancies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  salary text not null default '',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references vacancies (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null default '',
  expected_salary numeric,
  start_date_option text not null default 'asap'
    check (start_date_option in ('asap', '1_week', '2_weeks', 'other')),
  start_date_other text,
  citizenship text not null default '',
  education text not null default 'none'
    check (education in ('higher', 'vocational', 'course_certificate', 'none')),
  portfolio_url text,
  resume_path text not null,
  status text not null default 'new'
    check (status in ('new', 'screening', 'interview', 'offer', 'hired', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists candidates_vacancy_id_idx on candidates (vacancy_id);

-- ─── RLS ───────────────────────────────────────────────────────────────────

alter table vacancies enable row level security;
alter table candidates enable row level security;

-- Anyone can read open vacancies.
create policy "public can read open vacancies"
  on vacancies for select
  to anon, authenticated
  using (status = 'open');

-- Only an authenticated (admin) user can manage vacancies.
create policy "admin can manage vacancies"
  on vacancies for all
  to authenticated
  using (true)
  with check (true);

-- Anyone can submit an application (insert only).
create policy "public can submit application"
  on candidates for insert
  to anon, authenticated
  with check (true);

-- Only an authenticated (admin) user can read/update candidates.
create policy "admin can read candidates"
  on candidates for select
  to authenticated
  using (true);

create policy "admin can update candidates"
  on candidates for update
  to authenticated
  using (true)
  with check (true);

-- ─── Storage ───────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Anyone can upload a resume (candidates submitting the public form).
create policy "public can upload resumes"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'resumes');

-- Only an authenticated (admin) user can read resumes directly
-- (the admin app otherwise reads via signed URLs generated with the service role key).
create policy "admin can read resumes"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'resumes');
