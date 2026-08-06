import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateVacancy } from '@/lib/actions'
import { VacancyForm } from '@/components/vacancy-form'
import type { Vacancy } from '@/lib/types'

export default async function EditVacancyPage({
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

  const action = updateVacancy.bind(null, id)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Редактировать вакансию
      </h1>
      <VacancyForm vacancy={vacancy} action={action} />
    </div>
  )
}
