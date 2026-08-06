import Link from 'next/link'
import { ArrowRight, CalendarDays, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Vacancy } from '@/lib/types'
import { formatRelativeDate } from '@/lib/format'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Открытые вакансии
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Выберите вакансию, чтобы узнать подробности и оставить отклик.
        </p>
      </div>

      {!vacancies || vacancies.length === 0 ? (
        <p className="text-muted-foreground">Сейчас нет открытых вакансий.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {vacancies.map((vacancy) => (
            <Link key={vacancy.id} href={`/vacancies/${vacancy.id}`}>
              <Card className="group/vacancy transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-lg">{vacancy.title}</CardTitle>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/vacancy:translate-x-0.5 group-hover/vacancy:text-foreground" />
                  </div>
                  {vacancy.salary && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <Wallet className="size-3.5" />
                      {vacancy.salary}
                    </span>
                  )}
                </CardHeader>
                {vacancy.description && (
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {vacancy.description}
                    </p>
                  </CardContent>
                )}
                <CardFooter className="border-t-0 bg-transparent pt-0">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    Опубликовано {formatRelativeDate(vacancy.created_at)}
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
