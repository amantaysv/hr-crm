'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
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

export function ApplicationForm({ vacancyId }: { vacancyId: string }) {
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'done' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)
  const [startDateOption, setStartDateOption] =
    useState<StartDateOption | null>(null)
  const [education, setEducation] = useState<Education | null>(null)
  const [citizenshipOption, setCitizenshipOption] =
    useState<CitizenshipOption | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const resumeFile = formData.get('resume') as File

    if (!resumeFile || resumeFile.size === 0) {
      setError('Прикрепите файл резюме')
      setStatus('error')
      return
    }

    if (!startDateOption) {
      setError('Выберите дату выхода')
      setStatus('error')
      return
    }

    if (!citizenshipOption) {
      setError('Выберите гражданство')
      setStatus('error')
      return
    }

    if (!education) {
      setError('Выберите образование')
      setStatus('error')
      return
    }

    const supabase = createClient()
    const resumePath = `${vacancyId}/${Date.now()}-${resumeFile.name}`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(resumePath, resumeFile)

    if (uploadError) {
      setError('Не удалось загрузить файл резюме')
      setStatus('error')
      return
    }

    const expectedSalaryRaw = formData.get('expected_salary')

    const { data: candidate, error: insertError } = await supabase
      .from('candidates')
      .insert({
        vacancy_id: vacancyId,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        expected_salary: expectedSalaryRaw ? Number(expectedSalaryRaw) : null,
        start_date_option: startDateOption,
        start_date_other:
          startDateOption === 'other'
            ? formData.get('start_date_other') || null
            : null,
        citizenship:
          citizenshipOption === 'other'
            ? formData.get('citizenship_other')
            : 'Кыргызстан',
        education,
        portfolio_url: formData.get('portfolio_url') || null,
        resume_path: resumePath,
      })
      .select('id')
      .single()

    if (insertError) {
      setError('Не удалось отправить отклик')
      setStatus('error')
      return
    }

    setStatus('done')
    form.reset()
    setStartDateOption(null)
    setEducation(null)
    setCitizenshipOption(null)

    // Fire-and-forget: notification emails should never block the "thank you" UI.
    fetch('/api/notify-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId: candidate.id }),
    }).catch(() => {})
  }

  if (status === 'done') {
    return (
      <Alert>
        <AlertDescription>Спасибо! Ваш отклик отправлен.</AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Имя Фамилия</Label>
        <Input id="name" name="name" type="text" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Телефон (WhatsApp)</Label>
        <Input id="phone" name="phone" type="tel" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expected_salary">Ожидаемая ЗП (на руки)</Label>
        <Input
          id="expected_salary"
          name="expected_salary"
          type="number"
          min={0}
          inputMode="numeric"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="start_date_option">Дата выхода</Label>
        <Select
          value={startDateOption}
          onValueChange={(value) =>
            setStartDateOption(value as StartDateOption)
          }
        >
          <SelectTrigger id="start_date_option" className="w-full">
            <SelectValue placeholder="Выберите">
              {(value: StartDateOption) =>
                START_DATE_OPTIONS.find((option) => option.value === value)
                  ?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {START_DATE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {startDateOption === 'other' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date_other">Уточните дату выхода</Label>
          <Input id="start_date_other" name="start_date_other" type="text" />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="citizenship">Гражданство</Label>
        <Select
          value={citizenshipOption}
          onValueChange={(value) =>
            setCitizenshipOption(value as CitizenshipOption)
          }
        >
          <SelectTrigger id="citizenship" className="w-full">
            <SelectValue placeholder="Выберите">
              {(value: CitizenshipOption) =>
                CITIZENSHIP_OPTIONS.find((option) => option.value === value)
                  ?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CITIZENSHIP_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {citizenshipOption === 'other' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="citizenship_other">Уточните гражданство</Label>
          <Input
            id="citizenship_other"
            name="citizenship_other"
            type="text"
            required
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="education">Образование</Label>
        <Select
          value={education}
          onValueChange={(value) => setEducation(value as Education)}
        >
          <SelectTrigger id="education" className="w-full">
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
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="portfolio_url">Ссылка на портфолио / LinkedIn</Label>
        <Input
          id="portfolio_url"
          name="portfolio_url"
          type="url"
          placeholder="https://"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="resume">Резюме (PDF или DOCX)</Label>
        <Input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          required
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={status === 'submitting'} className="mt-2">
        {status === 'submitting' ? 'Отправка...' : 'Отправить отклик'}
      </Button>
    </form>
  )
}
