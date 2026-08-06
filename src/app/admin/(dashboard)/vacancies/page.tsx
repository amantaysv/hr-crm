import Link from 'next/link'
import { Briefcase, Plus, Users, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Vacancy } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
        <Button render={<Link href="/admin/vacancies/new" />}>
          <Plus className="size-4" />
          Новая вакансия
        </Button>
      </div>

      {!vacancies || vacancies.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <Briefcase className="size-8" />
          <p>Вакансий пока нет.</p>
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
          {vacancies.map((vacancy) => (
            <Card key={vacancy.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{vacancy.title}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span
                      className={
                        vacancy.status === 'open'
                          ? 'size-1.5 rounded-full bg-emerald-500'
                          : 'size-1.5 rounded-full bg-muted-foreground'
                      }
                    />
                    {vacancy.status === 'open' ? 'Открыта' : 'Закрыта'}
                  </span>
                </div>
                <div className="flex gap-2">
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
                    variant="outline"
                    size="sm"
                    render={<Link href={`/admin/vacancies/${vacancy.id}`} />}
                  >
                    <Pencil className="size-4" />
                    Редактировать
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
