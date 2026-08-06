'use client'

import type { Vacancy } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={vacancy?.description}
        />
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
