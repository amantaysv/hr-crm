'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ApplicationForm({ vacancyId }: { vacancyId: string }) {
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'done' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)

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

    const { error: insertError } = await supabase.from('candidates').insert({
      vacancy_id: vacancyId,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      cover_letter: formData.get('cover_letter') || null,
      portfolio_url: formData.get('portfolio_url') || null,
      resume_path: resumePath,
    })

    if (insertError) {
      setError('Не удалось отправить отклик')
      setStatus('error')
      return
    }

    setStatus('done')
    form.reset()
  }

  if (status === 'done') {
    return (
      <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
        Спасибо! Ваш отклик отправлен.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Имя
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium">
          Телефон
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cover_letter" className="text-sm font-medium">
          Сопроводительное письмо
        </label>
        <textarea
          id="cover_letter"
          name="cover_letter"
          rows={4}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="portfolio_url" className="text-sm font-medium">
          Ссылка на портфолио / LinkedIn
        </label>
        <input
          id="portfolio_url"
          name="portfolio_url"
          type="url"
          placeholder="https://"
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="resume" className="text-sm font-medium">
          Резюме (PDF или DOCX)
        </label>
        <input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          required
          className="text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {status === 'submitting' ? 'Отправка...' : 'Отправить отклик'}
      </button>
    </form>
  )
}
