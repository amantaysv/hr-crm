'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Search,
  Wallet,
} from 'lucide-react'
import type { Vacancy } from '@/lib/types'
import { formatRelativeDate, isRecent, pluralize } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <Briefcase className="size-8 text-muted-foreground" />
        <p className="font-medium">Открытых вакансий пока нет</p>
        <p className="text-sm text-muted-foreground">
          Загляните позже — новые появляются здесь сразу после публикации
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Поиск по названию"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center">
          <p className="font-medium text-balance">
            Ничего не найдено по запросу «{query.trim()}»
          </p>
          <p className="text-sm text-muted-foreground">
            Сбросьте поиск, чтобы увидеть все {vacancies.length}{' '}
            {pluralize(vacancies.length, 'вакансию', 'вакансии', 'вакансий')}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setQuery('')}
          >
            Сбросить поиск
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((vacancy) => (
            <Link
              key={vacancy.id}
              href={`/vacancies/${vacancy.id}`}
              className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Card className="group/vacancy transition-colors hover:bg-accent/60">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base sm:text-lg">
                        {vacancy.title}
                      </CardTitle>
                      {isRecent(vacancy.created_at) && <Badge>Новая</Badge>}
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover/vacancy:translate-x-0.5 group-hover/vacancy:text-primary" />
                  </div>
                </CardHeader>

                {vacancy.description && (
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {vacancy.description}
                    </p>
                  </CardContent>
                )}

                <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  {vacancy.salary && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                      <Wallet className="size-3.5" />
                      {vacancy.salary}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    Опубликовано {formatRelativeDate(vacancy.created_at)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
