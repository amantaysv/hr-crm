'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, CircleAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadWithProgress } from '@/lib/upload'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ResumeInput } from '@/components/resume-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CITIZENSHIP_OPTIONS,
  EDUCATION_OPTIONS,
  START_DATE_OPTIONS,
  type CitizenshipOption,
  type Education,
  type StartDateOption,
} from '@/lib/types'

type Step = 1 | 2 | 3
type Errors = Partial<Record<string, string>>

const STEP_TITLES: Record<Step, string> = {
  1: 'Как с вами связаться',
  2: 'Условия выхода',
  3: 'Резюме и ссылки',
}

const BACK_LABELS: Record<Step, string> = {
  1: 'К вакансии',
  2: 'Назад к контактам',
  3: 'Назад к условиям',
}

/** Digits only, ignoring the country code, so +996 700 12-34-56 counts as 9. */
function phoneDigits(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.startsWith('996') ? digits.slice(3) : digits.replace(/^0/, '')
}

export function ApplicationForm({ vacancyId }: { vacancyId: string }) {
  const [step, setStep] = useState<Step>(1)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'saving' | 'done' | 'error'
  >('idle')
  const [progress, setProgress] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [startDateOption, setStartDateOption] =
    useState<StartDateOption | null>(null)
  const [startDateOther, setStartDateOther] = useState('')
  const [citizenshipOption, setCitizenshipOption] =
    useState<CitizenshipOption | null>(null)
  const [citizenshipOther, setCitizenshipOther] = useState('')
  const [education, setEducation] = useState<Education | null>(null)
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [resume, setResume] = useState<File | null>(null)

  const busy = status === 'uploading' || status === 'saving'

  function validate(target: Step): Errors {
    const next: Errors = {}
    if (target === 1) {
      if (!name.trim()) next.name = 'Укажите имя и фамилию'
      if (!email.trim()) next.email = 'Укажите email'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        next.email = 'Похоже, в адресе опечатка'
      if (!phone.trim()) next.phone = 'Укажите телефон'
      else if (phoneDigits(phone).length < 9)
        next.phone = 'Номер неполный — 9 цифр после кода страны'
    }
    if (target === 2) {
      if (expectedSalary.trim() && Number(expectedSalary) <= 0)
        next.expected_salary = 'Укажите сумму числом'
      if (!startDateOption) next.start_date = 'Выберите, когда готовы выйти'
      else if (startDateOption === 'other' && !startDateOther.trim())
        next.start_date_other = 'Уточните дату выхода'
      if (!citizenshipOption) next.citizenship = 'Выберите гражданство'
      else if (citizenshipOption === 'other' && !citizenshipOther.trim())
        next.citizenship_other = 'Уточните гражданство'
      if (!education) next.education = 'Выберите образование'
    }
    if (target === 3) {
      if (!resume) next.resume = 'Прикрепите резюме'
    }
    return next
  }

  function goNext() {
    const found = validate(step)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setStep((current) => (current === 1 ? 2 : 3))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    const found = validate(3)
    setErrors(found)
    if (Object.keys(found).length > 0 || !resume) return

    setFormError(null)
    setProgress(0)
    setStatus('uploading')

    const resumePath = `${vacancyId}/${Date.now()}-${resume.name}`
    const uploaded = await uploadWithProgress({
      bucket: 'resumes',
      path: resumePath,
      file: resume,
      onProgress: setProgress,
    })

    if (!uploaded.ok) {
      setFormError('Не удалось загрузить файл резюме. Попробуйте ещё раз.')
      setStatus('error')
      return
    }

    setStatus('saving')
    const supabase = createClient()
    const { data: candidate, error: insertError } = await supabase
      .from('candidates')
      .insert({
        vacancy_id: vacancyId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        expected_salary: expectedSalary.trim() ? Number(expectedSalary) : null,
        start_date_option: startDateOption,
        start_date_other:
          startDateOption === 'other' ? startDateOther.trim() : null,
        citizenship:
          citizenshipOption === 'other'
            ? citizenshipOther.trim()
            : 'Кыргызстан',
        education,
        portfolio_url: portfolioUrl.trim() || null,
        resume_path: resumePath,
      })
      .select('id')
      .single()

    if (insertError) {
      setFormError('Не удалось отправить отклик. Попробуйте ещё раз.')
      setStatus('error')
      return
    }

    setStatus('done')

    // Fire-and-forget: notification email must never block the thank-you screen.
    fetch('/api/notify-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId: candidate.id }),
    }).catch(() => {})
  }

  if (status === 'done') {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6">
        <span className="flex size-10 items-center justify-center rounded-full bg-status-hired text-status-hired-foreground">
          <Check className="size-5" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-xl font-semibold">
            Отклик отправлен
          </h2>
          <p className="text-sm text-muted-foreground">
            Мы получили ваше резюме. Если оно подойдёт, HR свяжется с вами по
            WhatsApp — обычно в течение недели.
          </p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/" />}>
          Смотреть другие вакансии
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        {step === 1 ? (
          <span className="text-sm text-muted-foreground">
            Заполнение займёт 2–3 минуты
          </span>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            className="-ml-2"
            onClick={() => {
              setErrors({})
              setStep((current) => (current === 3 ? 2 : 1))
            }}
          >
            <ArrowLeft className="size-3.5" />
            {BACK_LABELS[step]}
          </Button>
        )}
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {step}/3
        </span>
      </div>

      <div className="flex gap-1.5" aria-hidden>
        {([1, 2, 3] as const).map((index) => (
          <span
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              index <= step ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>

      <h2 className="font-heading text-lg font-semibold">
        {STEP_TITLES[step]}
      </h2>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Field id="name" label="Имя и фамилия" error={errors.name}>
            <Input
              id="name"
              value={name}
              autoComplete="name"
              aria-invalid={!!errors.name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              aria-invalid={!!errors.email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field
            id="phone"
            label="Телефон"
            hint="Свяжемся в WhatsApp по этому номеру"
            error={errors.phone}
          >
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="+996 700 12-34-56"
              value={phone}
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <Field
            id="expected_salary"
            label="Ожидаемая ЗП на руки"
            optional
            error={errors.expected_salary}
          >
            <Input
              id="expected_salary"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="120 000"
              value={expectedSalary}
              aria-invalid={!!errors.expected_salary}
              onChange={(event) => setExpectedSalary(event.target.value)}
            />
          </Field>

          <Choice
            label="Когда готовы выйти"
            error={errors.start_date}
            options={START_DATE_OPTIONS}
            value={startDateOption}
            onChange={(value) => setStartDateOption(value)}
          />
          {startDateOption === 'other' && (
            <Field
              id="start_date_other"
              label="Уточните дату выхода"
              error={errors.start_date_other}
            >
              <Input
                id="start_date_other"
                value={startDateOther}
                aria-invalid={!!errors.start_date_other}
                onChange={(event) => setStartDateOther(event.target.value)}
              />
            </Field>
          )}

          <Choice
            label="Гражданство"
            error={errors.citizenship}
            options={CITIZENSHIP_OPTIONS}
            value={citizenshipOption}
            onChange={(value) => setCitizenshipOption(value)}
          />
          {citizenshipOption === 'other' && (
            <Field
              id="citizenship_other"
              label="Уточните гражданство"
              error={errors.citizenship_other}
            >
              <Input
                id="citizenship_other"
                value={citizenshipOther}
                aria-invalid={!!errors.citizenship_other}
                onChange={(event) => setCitizenshipOther(event.target.value)}
              />
            </Field>
          )}

          <Field id="education" label="Образование" error={errors.education}>
            <Select
              value={education}
              onValueChange={(value) => setEducation(value as Education)}
            >
              <SelectTrigger
                id="education"
                className="w-full"
                aria-invalid={!!errors.education}
              >
                <SelectValue placeholder="Выберите">
                  {(value: Education) =>
                    EDUCATION_OPTIONS.find((option) => option.value === value)
                      ?.label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <Field
            id="portfolio_url"
            label="Портфолио или LinkedIn"
            optional
            error={errors.portfolio_url}
          >
            <Input
              id="portfolio_url"
              type="url"
              placeholder="https://"
              value={portfolioUrl}
              onChange={(event) => setPortfolioUrl(event.target.value)}
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <Label>Резюме</Label>
            <ResumeInput
              file={resume}
              disabled={busy}
              error={errors.resume}
              describedBy={errors.resume ? 'resume-error' : undefined}
              onChange={(file, problem) => {
                setResume(file)
                setErrors((current) => ({
                  ...current,
                  resume: problem ?? undefined,
                }))
              }}
            />
            {errors.resume && (
              <FieldError id="resume-error" text={errors.resume} />
            )}
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg bg-muted/60 p-4 text-sm">
            <dt className="col-span-2 mb-1 font-medium">
              Проверьте перед отправкой
            </dt>
            <dt className="text-muted-foreground">Имя</dt>
            <dd className="truncate">{name}</dd>
            <dt className="text-muted-foreground">Телефон</dt>
            <dd className="truncate">{phone}</dd>
            <dt className="text-muted-foreground">Выход</dt>
            <dd className="truncate">
              {startDateOption === 'other'
                ? startDateOther
                : START_DATE_OPTIONS.find(
                    (option) => option.value === startDateOption,
                  )?.label}
              {expectedSalary.trim() && ` · ${expectedSalary} сом`}
            </dd>
          </dl>
        </div>
      )}

      {status === 'uploading' && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-muted-foreground">
            Загружаем резюме — {progress}%
          </p>
          <Progress value={progress} />
        </div>
      )}

      {formError && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {step < 3 ? (
        <Button type="button" size="lg" onClick={goNext}>
          Далее
        </Button>
      ) : (
        <Button type="submit" size="lg" disabled={busy}>
          {status === 'uploading'
            ? 'Загружаем резюме…'
            : status === 'saving'
              ? 'Отправляем…'
              : 'Отправить отклик'}
        </Button>
      )}
    </form>
  )
}

function Field({
  id,
  label,
  hint,
  optional,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  optional?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {optional && (
          <span className="text-xs text-muted-foreground">необязательно</span>
        )}
      </div>
      {children}
      {error ? (
        <FieldError id={`${id}-error`} text={error} />
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

function FieldError({ id, text }: { id: string; text: string }) {
  return (
    <p id={id} role="alert" className="text-xs font-medium text-destructive">
      {text}
    </p>
  )
}

function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T | null
  onChange: (value: T) => void
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                'min-h-11 rounded-lg border px-3.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {error && <FieldError id={`${label}-error`} text={error} />}
    </div>
  )
}
