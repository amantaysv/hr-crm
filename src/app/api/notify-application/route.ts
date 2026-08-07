import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendAdminNewApplicationEmail,
  sendCandidateConfirmationEmail,
} from '@/lib/email'
import type { Candidate, Vacancy } from '@/lib/types'

export async function POST(request: Request) {
  let candidateId: unknown
  try {
    ;({ candidateId } = await request.json())
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  if (typeof candidateId !== 'string' || !candidateId) {
    return NextResponse.json(
      { error: 'candidateId is required' },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()

  // This route is public — the applicant's browser calls it right after submitting,
  // so there is no session to authenticate against. Claiming `notified_at` is what
  // makes it safe: the first caller wins and every replay is a no-op, which stops
  // a known candidate id from being used to bomb the admin or the applicant.
  const { data: claimed } = await supabase
    .from('candidates')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', candidateId)
    .is('notified_at', null)
    .select('*')
    .maybeSingle<Candidate>()

  if (!claimed) {
    // Either the id is unknown or the notification already went out. Both are a
    // no-op, and the response deliberately does not distinguish them.
    return NextResponse.json({ ok: true, skipped: true })
  }

  const { data: vacancy } = await supabase
    .from('vacancies')
    .select('*')
    .eq('id', claimed.vacancy_id)
    .maybeSingle<Vacancy>()

  if (!vacancy) {
    return NextResponse.json({ error: 'vacancy not found' }, { status: 404 })
  }

  const [admin, candidate] = await Promise.all([
    sendAdminNewApplicationEmail({
      vacancyTitle: vacancy.title,
      vacancyId: vacancy.id,
      candidateName: claimed.name,
      candidateEmail: claimed.email,
    }),
    sendCandidateConfirmationEmail({
      candidateName: claimed.name,
      candidateEmail: claimed.email,
      vacancyTitle: vacancy.title,
    }),
  ])

  // A failed admin notification means a real application may go unnoticed, so
  // release the claim and let a retry through rather than swallowing it.
  if (!admin.ok && admin.reason === 'failed') {
    await supabase
      .from('candidates')
      .update({ notified_at: null })
      .eq('id', claimed.id)
  }

  return NextResponse.json({
    ok: true,
    admin: admin.ok,
    candidate: candidate.ok,
  })
}
