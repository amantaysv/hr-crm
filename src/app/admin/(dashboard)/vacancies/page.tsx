import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Vacancy } from '@/lib/types'

export default async function AdminVacanciesPage() {
  const supabase = await createClient()
  const { data: vacancies } = await supabase
    .from('vacancies')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Vacancy[]>()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Вакансии</h1>
        <Link
          href="/admin/vacancies/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Новая вакансия
        </Link>
      </div>

      {!vacancies || vacancies.length === 0 ? (
        <p className="text-zinc-500">Вакансий пока нет.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {vacancies.map((vacancy) => (
            <li
              key={vacancy.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div>
                <p className="font-medium">{vacancy.title}</p>
                <p className="text-sm text-zinc-500">
                  {vacancy.status === 'open' ? 'Открыта' : 'Закрыта'}
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <Link
                  href={`/admin/vacancies/${vacancy.id}/candidates`}
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Кандидаты
                </Link>
                <Link
                  href={`/admin/vacancies/${vacancy.id}`}
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Редактировать
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
