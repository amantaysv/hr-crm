import { notFound } from 'next/navigation'
import { Inbox } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BackLink } from '@/components/back-link'
import { CandidateList } from '@/components/candidate-list'
import {
  CANDIDATE_STATUSES,
  CANDIDATE_STATUS_LABELS,
  type Candidate,
  type Vacancy,
} from '@/lib/types'

function resumeDownloadName(candidate: Candidate, vacancyTitle: string) {
  const extension = candidate.resume_path.split('.').pop()
  const base = `${candidate.name} - ${vacancyTitle}`
  return extension ? `${base}.${extension}` : base
}

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
  const resumeUrls: Record<string, string> = {}

  for (const candidate of candidates ?? []) {
    const { data } = await adminClient.storage
      .from('resumes')
      .createSignedUrl(candidate.resume_path, 60 * 60, {
        download: resumeDownloadName(candidate, vacancy.title),
      })
    if (data?.signedUrl) {
      resumeUrls[candidate.id] = data.signedUrl
    }
  }

  const statusOptions = CANDIDATE_STATUSES.map((status) => ({
    value: status,
    label: CANDIDATE_STATUS_LABELS[status],
  }))

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/vacancies">К вакансиям</BackLink>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Кандидаты: {vacancy.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {candidates?.length
            ? `${candidates.length} ${candidates.length === 1 ? 'отклик' : 'откликов'}`
            : 'Пока нет откликов'}
        </p>
      </div>

      {!candidates || candidates.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <Inbox className="size-8" />
          <p>По этой вакансии пока нет откликов.</p>
        </div>
      ) : (
        <CandidateList
          candidates={candidates}
          resumeUrls={resumeUrls}
          statusOptions={statusOptions}
        />
      )}
    </div>
  )
}
