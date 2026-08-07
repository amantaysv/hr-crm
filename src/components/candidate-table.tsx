'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  FileText,
  Inbox,
  Link2,
  Mail,
  Phone,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { updateCandidateStatus } from '@/lib/actions'
import { formatRelativeDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/status-badge'
import { CandidateStatusForm } from '@/components/status-select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CANDIDATE_STATUSES,
  CANDIDATE_STATUS_LABELS,
  EDUCATION_LABELS,
  EDUCATION_OPTIONS,
  START_DATE_OPTIONS,
  type Candidate,
  type Education,
  type StartDateOption,
} from '@/lib/types'

const EDUCATION_SHORT: Record<Education, string> = {
  higher: 'Высшее',
  vocational: 'Средне-спец.',
  course_certificate: 'Курсы',
  none: 'Нет',
}

function startDateLabel(candidate: Candidate) {
  if (candidate.start_date_option === 'other') {
    return candidate.start_date_other || 'Другое'
  }
  return (
    START_DATE_OPTIONS.find((o) => o.value === candidate.start_date_option)
      ?.label ?? candidate.start_date_option
  )
}

/** Filters live in the URL so a filtered view can be linked and survives reload. */
function parseList(value: string | null) {
  return new Set((value ?? '').split(',').filter(Boolean))
}

export function CandidateTable({
  candidates,
  resumeUrls,
  vacancyId,
}: {
  candidates: Candidate[]
  resumeUrls: Record<string, string>
  vacancyId: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [openId, setOpenId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = searchParams.get('q') ?? ''
  const statuses = parseList(searchParams.get('status'))
  const startDates = parseList(searchParams.get('start'))
  const educations = parseList(searchParams.get('edu'))
  const kyrgyzstanOnly = searchParams.get('kg') === '1'
  const salaryFrom = searchParams.get('from') ?? ''
  const salaryTo = searchParams.get('to') ?? ''

  function apply(changes: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (!value) next.delete(key)
      else next.set(key, value)
    }
    const search = next.toString()
    router.replace(search ? `${pathname}?${search}` : pathname, {
      scroll: false,
    })
  }

  function toggleIn(key: string, current: Set<string>, value: string) {
    const next = new Set(current)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    apply({ [key]: [...next].join(',') || null })
  }

  const salaryFromValue = salaryFrom.trim() ? Number(salaryFrom) : null
  const salaryToValue = salaryTo.trim() ? Number(salaryTo) : null

  const activeCount =
    (query.trim() ? 1 : 0) +
    statuses.size +
    startDates.size +
    educations.size +
    (kyrgyzstanOnly ? 1 : 0) +
    (salaryFromValue !== null ? 1 : 0) +
    (salaryToValue !== null ? 1 : 0)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const matched = candidates.filter((candidate) => {
      const matchesQuery = normalized
        ? [candidate.name, candidate.phone, candidate.email].some((field) =>
            field?.toLowerCase().includes(normalized),
          )
        : true
      const matchesStatus =
        statuses.size === 0 || statuses.has(candidate.status)
      const matchesStartDate =
        startDates.size === 0 || startDates.has(candidate.start_date_option)
      const matchesEducation =
        educations.size === 0 || educations.has(candidate.education)
      const matchesCitizenship =
        !kyrgyzstanOnly || candidate.citizenship === 'Кыргызстан'
      const matchesSalary =
        (salaryFromValue === null ||
          (candidate.expected_salary != null &&
            candidate.expected_salary >= salaryFromValue)) &&
        (salaryToValue === null ||
          (candidate.expected_salary != null &&
            candidate.expected_salary <= salaryToValue))
      return (
        matchesQuery &&
        matchesStatus &&
        matchesStartDate &&
        matchesEducation &&
        matchesCitizenship &&
        matchesSalary
      )
    })

    // Rejected candidates stay visible but sink to the bottom.
    return [...matched].sort((a, b) => {
      const aRejected = a.status === 'rejected'
      const bRejected = b.status === 'rejected'
      if (aRejected === bRejected) return 0
      return aRejected ? 1 : -1
    })
  }, [
    candidates,
    query,
    statuses,
    startDates,
    educations,
    kyrgyzstanOnly,
    salaryFromValue,
    salaryToValue,
  ])

  const selected = candidates.find((candidate) => candidate.id === openId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Имя, телефон, email"
            defaultValue={query}
            className="pl-9"
            onChange={(event) => apply({ q: event.target.value || null })}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setFiltersOpen(true)}
          aria-label="Открыть фильтры"
        >
          <SlidersHorizontal className="size-4" />
          Фильтры
          {activeCount > 0 && (
            <span className="ml-0.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* The six funnel stages stay inline: they are the filter HR reaches for most. */}
      <div className="flex flex-wrap gap-1.5">
        {CANDIDATE_STATUSES.map((status) => {
          const isSelected = statuses.has(status)
          return (
            <button
              key={status}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleIn('status', statuses, status)}
              className="rounded-4xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <StatusBadge
                status={status}
                className={cn(
                  'cursor-pointer transition-opacity',
                  !isSelected && statuses.size > 0 && 'opacity-45',
                  isSelected &&
                    'ring-2 ring-ring ring-offset-1 ring-offset-background',
                )}
              />
            </button>
          )
        })}
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {filtered.length} из {candidates.length}
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() =>
              apply({
                q: null,
                status: null,
                start: null,
                edu: null,
                kg: null,
                from: null,
                to: null,
              })
            }
          >
            <X className="size-3" />
            Сбросить
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="font-medium">
            {activeCount > 0
              ? 'Ничего не найдено по заданным условиям'
              : 'По этой вакансии пока нет откликов'}
          </p>
          {activeCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Попробуйте снять часть фильтров
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Кандидат</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">ЗП</TableHead>
                <TableHead>Выход</TableHead>
                <TableHead>Образование</TableHead>
                <TableHead>Файлы</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Открыть карточку: ${candidate.name}`}
                  onClick={() => setOpenId(candidate.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setOpenId(candidate.id)
                    }
                  }}
                  className={cn(
                    'cursor-pointer',
                    candidate.status === 'rejected' && 'opacity-55',
                  )}
                >
                  <TableCell>
                    <span className="font-medium">{candidate.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatRelativeDate(candidate.created_at)} ·{' '}
                      {candidate.phone}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={candidate.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {candidate.expected_salary?.toLocaleString('ru-RU') ?? '—'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {startDateLabel(candidate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {EDUCATION_SHORT[candidate.education]}
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {resumeUrls[candidate.id] && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Скачать резюме"
                          render={
                            <a
                              href={resumeUrls[candidate.id]}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                        >
                          <FileText className="size-3.5" />
                        </Button>
                      )}
                      {candidate.portfolio_url && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Открыть портфолио"
                          render={
                            <a
                              href={candidate.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                        >
                          <Link2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Фильтры</SheetTitle>
            <SheetDescription>
              Условия сохраняются в адресе страницы — ссылку можно переслать
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-4 pb-6">
            <FilterGroup label="Дата выхода">
              {START_DATE_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={startDates.has(option.value)}
                  onClick={() =>
                    toggleIn(
                      'start',
                      startDates,
                      option.value satisfies StartDateOption,
                    )
                  }
                >
                  {option.label}
                </Chip>
              ))}
            </FilterGroup>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Ожидаемая ЗП
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="От"
                  defaultValue={salaryFrom}
                  onChange={(event) =>
                    apply({ from: event.target.value || null })
                  }
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="До"
                  defaultValue={salaryTo}
                  onChange={(event) =>
                    apply({ to: event.target.value || null })
                  }
                />
              </div>
            </div>

            <FilterGroup label="Образование">
              {EDUCATION_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={educations.has(option.value)}
                  onClick={() => toggleIn('edu', educations, option.value)}
                >
                  {EDUCATION_SHORT[option.value]}
                </Chip>
              ))}
            </FilterGroup>

            <FilterGroup label="Гражданство">
              <Chip
                selected={kyrgyzstanOnly}
                onClick={() => apply({ kg: kyrgyzstanOnly ? null : '1' })}
              >
                Кыргызстан
              </Chip>
            </FilterGroup>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={selected != null}
        onOpenChange={(open) => !open && setOpenId(null)}
      >
        <SheetContent side="right" className="overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  Откликнулся {formatRelativeDate(selected.created_at)}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-5 px-4 pb-6">
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Статус
                  </p>
                  <CandidateStatusForm
                    action={updateCandidateStatus.bind(null, selected.id)}
                    vacancyId={vacancyId}
                    defaultValue={selected.status}
                    options={CANDIDATE_STATUSES.map((status) => ({
                      value: status,
                      label: CANDIDATE_STATUS_LABELS[status],
                    }))}
                  />
                </div>

                <div className="flex flex-col gap-2 text-sm">
                  <a
                    className="flex items-center gap-2 hover:text-primary"
                    href={`mailto:${selected.email}`}
                  >
                    <Mail className="size-3.5 text-muted-foreground" />
                    {selected.email}
                  </a>
                  <a
                    className="flex items-center gap-2 hover:text-primary"
                    href={`tel:${selected.phone.replace(/\s/g, '')}`}
                  >
                    <Phone className="size-3.5 text-muted-foreground" />
                    {selected.phone}
                  </a>
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <Detail label="Ожидаемая ЗП">
                    {selected.expected_salary?.toLocaleString('ru-RU') ??
                      'Не указана'}
                  </Detail>
                  <Detail label="Дата выхода">
                    {startDateLabel(selected)}
                  </Detail>
                  <Detail label="Гражданство">{selected.citizenship}</Detail>
                  <Detail label="Образование">
                    {EDUCATION_LABELS[selected.education]}
                  </Detail>
                </dl>

                <div className="flex flex-wrap gap-2">
                  {resumeUrls[selected.id] && (
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <a
                          href={resumeUrls[selected.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <FileText className="size-3.5" />
                      Скачать резюме
                    </Button>
                  )}
                  {selected.portfolio_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <a
                          href={selected.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <Link2 className="size-3.5" />
                      Открыть портфолио
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function FilterGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Badge
      variant={selected ? 'default' : 'outline'}
      className="h-7 cursor-pointer px-3 select-none"
      aria-pressed={selected}
      onClick={onClick}
      render={<button type="button" />}
    >
      {children}
    </Badge>
  )
}

function Detail({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </>
  )
}

export function CandidateTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
      <div className="flex gap-1.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-6 w-24 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>
      <div className="flex flex-col gap-px rounded-xl border border-border p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded bg-muted/60" />
        ))}
      </div>
    </div>
  )
}
