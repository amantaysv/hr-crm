import Link from 'next/link'
import { Briefcase, Plus, Users, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { pluralize } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Vacancy } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Counts = { total: number; fresh: number }

export default async function AdminVacanciesPage() {
  const supabase = await createClient()

  const [{ data: vacancies }, { data: applications }] = await Promise.all([
    supabase
      .from('vacancies')
      .select('*')
      .order('created_at', { ascending: false })
      .returns<Vacancy[]>(),
    // One round trip for every vacancy's counts — at the documented scale
    // (tens to hundreds of applications) this beats a query per row.
    supabase
      .from('candidates')
      .select('vacancy_id, status')
      .returns<{ vacancy_id: string; status: string }[]>(),
  ])

  const counts = new Map<string, Counts>()
  for (const application of applications ?? []) {
    const current = counts.get(application.vacancy_id) ?? { total: 0, fresh: 0 }
    current.total += 1
    if (application.status === 'new') current.fresh += 1
    counts.set(application.vacancy_id, current)
  }

  // Open vacancies are the ones HR acts on; closed ones sink to the bottom.
  const ordered = [...(vacancies ?? [])].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'open' ? -1 : 1
    return 0
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Вакансии
        </h1>
        <Button render={<Link href="/admin/vacancies/new" />}>
          <Plus className="size-4" />
          Новая вакансия
        </Button>
      </div>

      {ordered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Briefcase className="size-8 text-muted-foreground" />
          <p className="font-medium">Вакансий пока нет</p>
          <p className="text-sm text-muted-foreground">
            Создайте первую — она сразу появится на публичной странице
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            render={<Link href="/admin/vacancies/new" />}
          >
            <Plus className="size-4" />
            Создать первую
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ordered.map((vacancy) => {
            const count = counts.get(vacancy.id) ?? { total: 0, fresh: 0 }
            const isOpen = vacancy.status === 'open'
            return (
              <Card key={vacancy.id} className={cn(!isOpen && 'opacity-70')}>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/vacancies/${vacancy.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {vacancy.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            isOpen ? 'bg-success' : 'bg-muted-foreground',
                          )}
                        />
                        {isOpen ? 'Открыта' : 'Закрыта'}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{vacancy.salary || 'Оклад не указан'}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="mr-1 flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {count.total}{' '}
                        {pluralize(
                          count.total,
                          'отклик',
                          'отклика',
                          'откликов',
                        )}
                      </span>
                      {count.fresh > 0 && (
                        <span className="rounded-full bg-status-new px-2 py-0.5 text-xs font-medium text-status-new-foreground">
                          {count.fresh}{' '}
                          {pluralize(count.fresh, 'новый', 'новых', 'новых')}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <Link
                          href={`/admin/vacancies/${vacancy.id}/candidates`}
                        />
                      }
                    >
                      <Users className="size-4" />
                      Кандидаты
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Редактировать вакансию"
                      render={<Link href={`/admin/vacancies/${vacancy.id}`} />}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
