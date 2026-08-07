import { createClient } from '@/lib/supabase/server'
import type { Vacancy } from '@/lib/types'
import { pluralize } from '@/lib/format'
import { VacancyList } from '@/components/vacancy-list'

export default async function Home() {
  const supabase = await createClient()
  const { data: vacancies } = await supabase
    .from('vacancies')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .returns<Vacancy[]>()

  const count = vacancies?.length ?? 0

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 pt-12 pb-16">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Открытые вакансии
        </h1>
        <p className="max-w-xl text-muted-foreground text-pretty">
          Условия, описание и форма отклика — на одной странице. Заполнение
          занимает 2–3 минуты, дальше HR свяжется с вами по WhatsApp.
        </p>
        {count > 0 && (
          <p className="text-sm font-medium text-primary">
            {count}{' '}
            {pluralize(
              count,
              'открытая вакансия',
              'открытые вакансии',
              'открытых вакансий',
            )}
          </p>
        )}
      </div>

      <VacancyList vacancies={vacancies ?? []} />
    </div>
  )
}
