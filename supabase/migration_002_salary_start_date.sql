-- Replaces the free-text cover letter with expected salary + structured start date.
-- Run this in the Supabase SQL Editor on the already-provisioned project.

alter table candidates drop column if exists cover_letter;

alter table candidates add column if not exists expected_salary numeric;

alter table candidates
  add column if not exists start_date_option text not null default 'asap'
    check (start_date_option in ('asap', '1_week', '2_weeks', 'other'));

alter table candidates add column if not exists start_date_other text;
