import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendAdminNewApplicationEmail,
  sendCandidateConfirmationEmail,
} from '@/lib/email'
import type { Candidate, Vacancy } from '@/lib/types'

export async function POST(request: Request) {
  const { candidateId } = await request.json()

  if (!candidateId) {
    return NextResponse.json(
      { error: 'candidateId is required' },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()

  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .maybeSingle<Candidate>()

  if (!candidate) {
    return NextResponse.json({ error: 'candidate not found' }, { status: 404 })
  }

  const { data: vacancy } = await supabase
    .from('vacancies')
    .select('*')
    .eq('id', candidate.vacancy_id)
    .maybeSingle<Vacancy>()

  if (!vacancy) {
    return NextResponse.json({ error: 'vacancy not found' }, { status: 404 })
  }

  await Promise.allSettled([
    sendAdminNewApplicationEmail({
      vacancyTitle: vacancy.title,
      vacancyId: vacancy.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
    }),
    sendCandidateConfirmationEmail({
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      vacancyTitle: vacancy.title,
    }),
  ])

  return NextResponse.json({ ok: true })
}
