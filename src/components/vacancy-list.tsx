'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Search, Wallet } from 'lucide-react'
import type { Vacancy } from '@/lib/types'
import { formatRelativeDate, isRecent } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

export function VacancyList({ vacancies }: { vacancies: Vacancy[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return vacancies
    return vacancies.filter((vacancy) =>
      vacancy.title.toLowerCase().includes(normalized),
    )
  }, [query, vacancies])

  if (vacancies.length === 0) {
    return (
      <p className="text-muted-foreground">Сейчас нет открытых вакансий.</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Поиск по названию вакансии"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">
          Ничего не найдено по запросу «{query}».
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((vacancy) => (
            <Link key={vacancy.id} href={`/vacancies/${vacancy.id}`}>
              <Card className="group/vacancy transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{vacancy.title}</CardTitle>
                      {isRecent(vacancy.created_at) && <Badge>Новая</Badge>}
                    </div>
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
