import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateCandidateStatus } from '@/lib/actions'
import { StatusSelect } from '@/components/status-select'
import {
  CANDIDATE_STATUSES,
  CANDIDATE_STATUS_LABELS,
  type Candidate,
  type Vacancy,
} from '@/lib/types'

export default async function VacancyCandidatesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: vacancy } = await supabase
    .from('vacancies')
    .select('*')
    .eq('id', id)
    .maybeSingle<Vacancy>()

  if (!vacancy) {
    notFound()
  }

  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .eq('vacancy_id', id)
    .order('created_at', { ascending: false })
    .returns<Candidate[]>()

  const adminClient = createAdminClient()
  const resumeUrls = new Map<string, string>()

  for (const candidate of candidates ?? []) {
    const { data } = await adminClient.storage
      .from('resumes')
      .createSignedUrl(candidate.resume_path, 60 * 60)
    if (data?.signedUrl) {
      resumeUrls.set(candidate.id, data.signedUrl)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Кандидаты: {vacancy.title}
        </h1>
      </div>

      {!candidates || candidates.length === 0 ? (
        <p className="text-zinc-500">По этой вакансии пока нет откликов.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {candidates.map((candidate) => (
            <li
              key={candidate.id}
              className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{candidate.name}</p>
                  <p className="text-sm text-zinc-500">
                    {candidate.email} · {candidate.phone}
                  </p>
                </div>
                <form action={updateCandidateStatus.bind(null, candidate.id)}>
                  <input
                    type="hidden"
                    name="vacancy_id"
                    value={candidate.vacancy_id}
                  />
                  <StatusSelect
                    name="status"
                    defaultValue={candidate.status}
                    options={CANDIDATE_STATUSES.map((status) => ({
                      value: status,
                      label: CANDIDATE_STATUS_LABELS[status],
                    }))}
                  />
                </form>
              </div>

              {candidate.cover_letter && (
                <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                  {candidate.cover_letter}
                </p>
              )}

              <div className="flex gap-4 text-sm">
                {resumeUrls.has(candidate.id) && (
                  <a
                    href={resumeUrls.get(candidate.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Резюме
                  </a>
                )}
                {candidate.portfolio_url && (
                  <a
                    href={candidate.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Портфолио
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
