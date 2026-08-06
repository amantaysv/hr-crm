import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Vacancy } from '@/lib/types'
import { ApplicationForm } from '@/components/application-form'

export default async function VacancyPage({
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
    .eq('status', 'open')
    .maybeSingle<Vacancy>()

  if (!vacancy) {
    notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {vacancy.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {[vacancy.location, vacancy.employment_type]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      {vacancy.description && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Описание</h2>
          <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {vacancy.description}
          </p>
        </section>
      )}

      {vacancy.requirements && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Требования</h2>
          <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {vacancy.requirements}
          </p>
        </section>
      )}

      <section className="flex flex-col gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-lg font-medium">Откликнуться</h2>
        <ApplicationForm vacancyId={vacancy.id} />
      </section>
    </div>
  )
}
