'use client'

import { useState } from 'react'
import type { Vacancy } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Markdown } from '@/components/markdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function VacancyForm({
  vacancy,
  action,
}: {
  vacancy?: Vacancy
  action: (formData: FormData) => void
}) {
  const [description, setDescription] = useState(vacancy?.description ?? '')
  const [preview, setPreview] = useState(false)

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Название</Label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={vacancy?.title}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Описание</Label>
          <div className="flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={
                !preview
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              Написать
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={
                preview
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              Предпросмотр
            </button>
          </div>
        </div>

        <input type="hidden" name="description" value={description} />

        {preview ? (
          <div className="min-h-32 rounded-md border px-3 py-2">
            {description ? (
              <Markdown>{description}</Markdown>
            ) : (
              <p className="text-sm text-muted-foreground">Нечего показать</p>
            )}
          </div>
        ) : (
          <Textarea
            id="description"
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        )}
        <p className="text-xs text-muted-foreground">
          Поддерживается Markdown: **жирный**, *курсив*, списки, ссылки.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="salary">Оклад</Label>
        <Input
          id="salary"
          name="salary"
          type="text"
          placeholder="150 000 - 200 000 сом"
          defaultValue={vacancy?.salary}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Статус</Label>
        <Select name="status" defaultValue={vacancy?.status ?? 'open'}>
          <SelectTrigger id="status" className="w-full">
            <SelectValue>
              {(value: string) => (value === 'open' ? 'Открыта' : 'Закрыта')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Открыта</SelectItem>
            <SelectItem value="closed">Закрыта</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="mt-2">
        Сохранить
      </Button>
    </form>
  )
}
