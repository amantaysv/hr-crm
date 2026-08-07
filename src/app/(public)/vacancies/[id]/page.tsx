import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CalendarDays, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Vacancy } from '@/lib/types'
import { formatRelativeDate, isRecent } from '@/lib/format'
import { ApplicationForm } from '@/components/application-form'
import { BackLink } from '@/components/back-link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/markdown'

const getVacancy = cache(async (id: string) => {
  const supabase = await createClient()
  const { data: vacancy } = await supabase
    .from('vacancies')
    .select('*')
    .eq('id', id)
    .eq('status', 'open')
    .maybeSingle<Vacancy>()
  return vacancy
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const vacancy = await getVacancy(id)
  return {
    title: vacancy
      ? `${vacancy.title} · Кызмат - Вакансии`
      : 'Вакансия · Кызмат - Вакансии',
  }
}

export default async function VacancyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const vacancy = await getVacancy(id)

  if (!vacancy) {
    notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pt-8 pb-16">
      <BackLink href="/">Все вакансии</BackLink>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                {vacancy.title}
              </h1>
              {isRecent(vacancy.created_at) && <Badge>Новая</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {vacancy.salary && (
                <span className="flex items-center gap-1.5 font-medium text-success">
                  <Wallet className="size-4" />
                  {vacancy.salary}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Опубликовано {formatRelativeDate(vacancy.created_at)}
              </span>
            </div>
          </div>

          {vacancy.description && <Markdown>{vacancy.description}</Markdown>}

          <section
            id="apply"
            className="flex scroll-mt-20 flex-col gap-4 border-t border-border pt-8"
          >
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-xl font-semibold">
                Откликнуться
              </h2>
              <p className="text-sm text-muted-foreground">
                Понадобится резюме в PDF, DOC или DOCX.
              </p>
            </div>
            <ApplicationForm vacancyId={vacancy.id} />
          </section>
        </div>

        <aside className="order-first lg:order-0">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 lg:sticky lg:top-20">
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Статус</dt>
                <dd className="flex items-center gap-1.5 font-medium">
                  <span className="size-1.5 rounded-full bg-success" />
                  Открыта
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Оклад</dt>
                <dd className="font-medium">{vacancy.salary || 'Не указан'}</dd>
              </div>
            </dl>
            <Button size="sm" className="w-full" render={<a href="#apply" />}>
              Заполнить форму
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
