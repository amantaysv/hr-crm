-- Adds citizenship and education fields to candidates.
-- Run this in the Supabase SQL Editor on the already-provisioned project.

alter table candidates
  add column if not exists citizenship text not null default '';

alter table candidates
  add column if not exists education text not null default 'none'
    check (education in ('higher', 'vocational', 'course_certificate', 'none'));
