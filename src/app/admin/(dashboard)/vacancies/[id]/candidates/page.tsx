import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Inbox, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { pluralize } from '@/lib/format'
import { BackLink } from '@/components/back-link'
import { Button } from '@/components/ui/button'
import {
  CandidateTable,
  CandidateTableSkeleton,
} from '@/components/candidate-table'
import type { Candidate, Vacancy } from '@/lib/types'

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

  const list = candidates ?? []

  const adminClient = createAdminClient()
  const signed = await Promise.all(
    list.map(async (candidate) => {
      const { data } = await adminClient.storage
        .from('resumes')
        .createSignedUrl(candidate.resume_path, 60 * 60, {
          download: resumeDownloadName(candidate, vacancy.title),
        })
      return [candidate.id, data?.signedUrl] as const
    }),
  )

  const resumeUrls: Record<string, string> = {}
  for (const [candidateId, url] of signed) {
    if (url) resumeUrls[candidateId] = url
  }

  const fresh = list.filter((candidate) => candidate.status === 'new').length
  const hired = list.filter((candidate) => candidate.status === 'hired').length

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/vacancies">Все вакансии</BackLink>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            {vacancy.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <Stat value={list.length} label="откликов" />
            {fresh > 0 && (
              <Stat
                value={fresh}
                label={pluralize(fresh, 'новый', 'новых', 'новых')}
                tone="new"
              />
            )}
            {hired > 0 && (
              <Stat
                value={hired}
                label={pluralize(hired, 'нанят', 'наняты', 'нанято')}
                tone="hired"
              />
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/admin/vacancies/${vacancy.id}`} />}
        >
          <Pencil className="size-3.5" />
          Редактировать вакансию
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="font-medium">По этой вакансии пока нет откликов</p>
          <p className="text-sm text-muted-foreground">
            Отклики появятся здесь сразу после отправки формы
          </p>
        </div>
      ) : (
        // CandidateTable reads its filters from useSearchParams.
        <Suspense fallback={<CandidateTableSkeleton />}>
          <CandidateTable
            candidates={list}
            resumeUrls={resumeUrls}
            vacancyId={vacancy.id}
          />
        </Suspense>
      )}
    </div>
  )
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number
  label: string
  tone?: 'new' | 'hired'
}) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span
        className={
          tone === 'new'
            ? 'text-lg font-semibold text-status-new-foreground'
            : tone === 'hired'
              ? 'text-lg font-semibold text-status-hired-foreground'
              : 'text-lg font-semibold'
        }
      >
        {value}
      </span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  )
}
