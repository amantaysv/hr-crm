import { createVacancy } from '@/lib/actions'
import { VacancyForm } from '@/components/vacancy-form'
import { BackLink } from '@/components/back-link'

export default function NewVacancyPage() {
  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/vacancies">К вакансиям</BackLink>
      <h1 className="text-2xl font-semibold tracking-tight">Новая вакансия</h1>
      <VacancyForm action={createVacancy} />
    </div>
  )
}
