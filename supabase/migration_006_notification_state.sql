-- Notification bookkeeping for /api/notify-application.
--
-- The endpoint is public (the browser calls it right after the applicant submits),
-- so without a marker anyone who knows a candidate id could replay it and bomb
-- both the admin and the applicant with mail. Claiming this column is the guard:
-- the update only succeeds once per candidate.

alter table candidates
  add column if not exists notified_at timestamptz;

comment on column candidates.notified_at is
  'Set once when the new-application notification was dispatched. Guards against replay.';

-- "public can submit application" is `with check (true)`, so without this an applicant
-- could pre-set notified_at in their own insert and suppress the admin's alert.
-- Only the service role (which bypasses RLS) has any business writing this column.
revoke insert (notified_at) on candidates from anon;
revoke update (notified_at) on candidates from anon;
