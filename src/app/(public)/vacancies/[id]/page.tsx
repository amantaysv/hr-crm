import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Vacancy } from '@/lib/types'
import { ApplicationForm } from '@/components/application-form'
import { BackLink } from '@/components/back-link'

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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <BackLink href="/">Все вакансии</BackLink>

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {vacancy.title}
          </h1>
          {vacancy.salary && (
            <span className="mt-2 flex items-center gap-1.5 text-base font-medium text-emerald-600 dark:text-emerald-400">
              <Wallet className="size-4" />
              {vacancy.salary}
            </span>
          )}
        </div>

        {vacancy.description && (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">Описание</h2>
            <p className="whitespace-pre-wrap text-foreground/80">
              {vacancy.description}
            </p>
          </section>
        )}

        <section className="flex flex-col gap-4 border-t pt-8">
          <h2 className="text-lg font-medium">Откликнуться</h2>
          <ApplicationForm vacancyId={vacancy.id} />
        </section>
      </div>
    </div>
  )
}
