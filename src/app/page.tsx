import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Vacancy } from '@/lib/types'

export default async function Home() {
  const supabase = await createClient()
  const { data: vacancies } = await supabase
    .from('vacancies')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .returns<Vacancy[]>()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Открытые вакансии
      </h1>

      {!vacancies || vacancies.length === 0 ? (
        <p className="text-zinc-500">Сейчас нет открытых вакансий.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {vacancies.map((vacancy) => (
            <li key={vacancy.id}>
              <Link
                href={`/vacancies/${vacancy.id}`}
                className="block rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <h2 className="text-lg font-medium">{vacancy.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {[vacancy.location, vacancy.employment_type]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
