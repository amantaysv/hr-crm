-- Adds a salary field to vacancies.
-- Run this in the Supabase SQL Editor on the already-provisioned project.

alter table vacancies add column if not exists salary text not null default '';
