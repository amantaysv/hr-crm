import { notFound } from 'next/navigation'
import { FileText, Inbox, Link2, Mail, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateCandidateStatus } from '@/lib/actions'
import { CandidateStatusForm } from '@/components/status-select'
import { BackLink } from '@/components/back-link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  CANDIDATE_STATUSES,
  CANDIDATE_STATUS_LABELS,
  EDUCATION_LABELS,
  START_DATE_OPTIONS,
  type Candidate,
  type Vacancy,
} from '@/lib/types'

function resumeDownloadName(candidate: Candidate, vacancyTitle: string) {
  const extension = candidate.resume_path.split('.').pop()
  const base = `${candidate.name} - ${vacancyTitle}`
  return extension ? `${base}.${extension}` : base
}

function startDateLabel(candidate: Candidate) {
  if (candidate.start_date_option === 'other') {
    return candidate.start_date_other || 'Другое'
  }
  return (
    START_DATE_OPTIONS.find(
      (option) => option.value === candidate.start_date_option,
    )?.label ?? candidate.start_date_option
  )
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
  const resumeUrls = new Map<string, string>()

  for (const candidate of candidates ?? []) {
    const { data } = await adminClient.storage
      .from('resumes')
      .createSignedUrl(candidate.resume_path, 60 * 60, {
        download: resumeDownloadName(candidate, vacancy.title),
      })
    if (data?.signedUrl) {
      resumeUrls.set(candidate.id, data.signedUrl)
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
        <div className="flex flex-col gap-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{candidate.name}</p>
                    <div className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-3.5" />
                        {candidate.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        {candidate.phone}
                      </span>
                    </div>
                  </div>
                  <CandidateStatusForm
                    action={updateCandidateStatus.bind(null, candidate.id)}
                    vacancyId={candidate.vacancy_id}
                    defaultValue={candidate.status}
                    options={statusOptions}
                  />
                </div>

                <p className="text-sm text-foreground/80">
                  {candidate.expected_salary != null && (
                    <>Ожидаемая ЗП (на руки): {candidate.expected_salary} · </>
                  )}
                  Дата выхода: {startDateLabel(candidate)} · Гражданство:{' '}
                  {candidate.citizenship} · Образование:{' '}
                  {EDUCATION_LABELS[candidate.education]}
                </p>

                <div className="flex gap-2">
                  {resumeUrls.has(candidate.id) && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      render={
                        <a
                          href={resumeUrls.get(candidate.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <FileText className="size-3.5" />
                      Резюме
                    </Button>
                  )}
                  {candidate.portfolio_url && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      render={
                        <a
                          href={candidate.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <Link2 className="size-3.5" />
                      Портфолио
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
