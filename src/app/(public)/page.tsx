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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          Найдите работу мечты
        </h1>
        <p className="text-muted-foreground">
          Выберите вакансию, чтобы узнать подробности и оставить отклик.
        </p>
        <p className="text-sm font-medium text-muted-foreground">
          {count > 0
            ? `${count} ${pluralize(count, 'открытая вакансия', 'открытые вакансии', 'открытых вакансий')}`
            : 'Открытых вакансий пока нет'}
        </p>
      </div>

      <VacancyList vacancies={vacancies ?? []} />
    </div>
  )
}
