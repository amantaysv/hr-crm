'use client'

import { useMemo, useState } from 'react'
import {
  CalendarDays,
  FileText,
  Inbox,
  Link2,
  Mail,
  Phone,
  Search,
} from 'lucide-react'
import { updateCandidateStatus } from '@/lib/actions'
import { CandidateStatusForm } from '@/components/status-select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { formatRelativeDate } from '@/lib/format'
import {
  EDUCATION_LABELS,
  EDUCATION_OPTIONS,
  START_DATE_OPTIONS,
  type Candidate,
  type CandidateStatus,
  type Education,
  type StartDateOption,
} from '@/lib/types'

function startDateLabel(candidate: Candidate) {
  if (candidate.start_date_option === 'other') {
    return candidate.start_date_other || 'Другое'
  }
  return (
    START_DATE_OPTIONS.find(
      (option) => option.value === candidate.start_date_option,
    )?.label ?? candidate.start_date_option
  )
}

export function CandidateList({
  candidates,
  resumeUrls,
  statusOptions,
}: {
  candidates: Candidate[]
  resumeUrls: Record<string, string>
  statusOptions: { value: CandidateStatus; label: string }[]
}) {
  const [query, setQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<
    Set<CandidateStatus>
  >(new Set())
  const [selectedStartDates, setSelectedStartDates] = useState<
    Set<StartDateOption>
  >(new Set())
  const [kyrgyzstanOnly, setKyrgyzstanOnly] = useState(false)
  const [selectedEducations, setSelectedEducations] = useState<
    Set<Education>
  >(new Set())
  const [salaryFrom, setSalaryFrom] = useState('')
  const [salaryTo, setSalaryTo] = useState('')

  function toggleStatus(status: CandidateStatus) {
    setSelectedStatuses((current) => {
      const next = new Set(current)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  function toggleStartDate(option: StartDateOption) {
    setSelectedStartDates((current) => {
      const next = new Set(current)
      if (next.has(option)) {
        next.delete(option)
      } else {
        next.add(option)
      }
      return next
    })
  }

  function toggleEducation(education: Education) {
    setSelectedEducations((current) => {
      const next = new Set(current)
      if (next.has(education)) {
        next.delete(education)
      } else {
        next.add(education)
      }
      return next
    })
  }

  function resetFilters() {
    setQuery('')
    setSelectedStatuses(new Set())
    setSelectedStartDates(new Set())
    setSelectedEducations(new Set())
    setKyrgyzstanOnly(false)
    setSalaryFrom('')
    setSalaryTo('')
  }

  const salaryFromValue = salaryFrom.trim() ? Number(salaryFrom) : null
  const salaryToValue = salaryTo.trim() ? Number(salaryTo) : null

  const hasActiveFilters =
    query.trim() !== '' ||
    selectedStatuses.size > 0 ||
    selectedStartDates.size > 0 ||
    selectedEducations.size > 0 ||
    kyrgyzstanOnly ||
    salaryFromValue !== null ||
    salaryToValue !== null

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const matched = candidates.filter((candidate) => {
      const matchesQuery = normalized
        ? [candidate.name, candidate.phone, candidate.email].some((field) =>
            field?.toLowerCase().includes(normalized),
          )
        : true
      const matchesStatus =
        selectedStatuses.size === 0 || selectedStatuses.has(candidate.status)
      const matchesStartDate =
        selectedStartDates.size === 0 ||
        selectedStartDates.has(candidate.start_date_option)
      const matchesEducation =
        selectedEducations.size === 0 ||
        selectedEducations.has(candidate.education)
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

    return [...matched].sort((a, b) => {
      const aRejected = a.status === 'rejected'
      const bRejected = b.status === 'rejected'
      if (aRejected === bRejected) return 0
      return aRejected ? 1 : -1
    })
  }, [
    query,
    selectedStatuses,
    selectedStartDates,
    selectedEducations,
    kyrgyzstanOnly,
    salaryFromValue,
    salaryToValue,
    candidates,
  ])

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="flex flex-col gap-5 lg:w-64 lg:shrink-0">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по имени, телефону или email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetFilters}
          >
            Сбросить фильтры
          </Button>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Статус</p>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((option) => {
              const isSelected = selectedStatuses.has(option.value)
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer select-none"
                  onClick={() => toggleStatus(option.value)}
                  render={<button type="button" />}
                >
                  {option.label}
                </Badge>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Дата выхода
          </p>
          <div className="flex flex-wrap gap-1.5">
            {START_DATE_OPTIONS.map((option) => {
              const isSelected = selectedStartDates.has(option.value)
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer select-none"
                  onClick={() => toggleStartDate(option.value)}
                  render={<button type="button" />}
                >
                  {option.label}
                </Badge>
              )
            })}
          </div>
        </div>

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
              value={salaryFrom}
              onChange={(event) => setSalaryFrom(event.target.value)}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="До"
              value={salaryTo}
              onChange={(event) => setSalaryTo(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Образование
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EDUCATION_OPTIONS.map((option) => {
              const isSelected = selectedEducations.has(option.value)
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer select-none"
                  onClick={() => toggleEducation(option.value)}
                  render={<button type="button" />}
                >
                  {option.label}
                </Badge>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Гражданство
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant={kyrgyzstanOnly ? 'default' : 'outline'}
              className="cursor-pointer select-none"
              onClick={() => setKyrgyzstanOnly((current) => !current)}
              render={<button type="button" />}
            >
              Кыргызстан
            </Badge>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
            <Inbox className="size-8" />
            <p>
              {hasActiveFilters
                ? 'Ничего не найдено по заданным условиям.'
                : 'По этой вакансии пока нет откликов.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((candidate) => (
              <Card key={candidate.id}>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <div className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3.5" />
                          {candidate.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3.5" />
                          {candidate.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" />
                          Откликнулся {formatRelativeDate(candidate.created_at)}
                        </span>
                      </div>
                    </div>
                    <CandidateStatusForm
                      action={updateCandidateStatus.bind(null, candidate.id)}
                      vacancyId={candidate.vacancy_id}
                      defaultValue={candidate.status}
                      options={statusOptions}
                    />
                  </div>

                  <p className="text-sm text-foreground/80">
                    {candidate.expected_salary != null && (
                      <>
                        Ожидаемая ЗП (на руки): {candidate.expected_salary} ·{' '}
                      </>
                    )}
                    Дата выхода: {startDateLabel(candidate)} · Гражданство:{' '}
                    {candidate.citizenship} · Образование:{' '}
                    {EDUCATION_LABELS[candidate.education]}
                  </p>

                  <div className="flex gap-2">
                    {resumeUrls[candidate.id] && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        render={
                          <a
                            href={resumeUrls[candidate.id]}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <FileText className="size-3.5" />
                        Резюме
                      </Button>
                    )}
                    {candidate.portfolio_url && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        render={
                          <a
                            href={candidate.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <Link2 className="size-3.5" />
                        Портфолио
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
