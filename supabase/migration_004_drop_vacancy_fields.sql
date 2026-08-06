-- Removes unused vacancy fields (requirements, location, employment_type).
-- Run this in the Supabase SQL Editor on the already-provisioned project.

alter table vacancies drop column if exists requirements;
alter table vacancies drop column if exists location;
alter table vacancies drop column if exists employment_type;
