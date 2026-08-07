'use client'

import { useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Bold, Heading2, Italic, List, Link2 } from 'lucide-react'
import type { Vacancy } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Markdown } from '@/components/markdown'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Wrap = { before: string; after?: string; block?: boolean }

const TOOLS: { icon: typeof Bold; label: string; wrap: Wrap }[] = [
  { icon: Bold, label: 'Жирный', wrap: { before: '**', after: '**' } },
  { icon: Italic, label: 'Курсив', wrap: { before: '*', after: '*' } },
  { icon: Heading2, label: 'Заголовок', wrap: { before: '## ', block: true } },
  { icon: List, label: 'Список', wrap: { before: '- ', block: true } },
  { icon: Link2, label: 'Ссылка', wrap: { before: '[', after: '](https://)' } },
]

export function VacancyForm({
  vacancy,
  action,
}: {
  vacancy?: Vacancy
  action: (formData: FormData) => void
}) {
  const [description, setDescription] = useState(vacancy?.description ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function applyWrap({ before, after = '', block }: Wrap) {
    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd } = textarea
    const selected = description.slice(selectionStart, selectionEnd)

    // Block tools prefix the whole line; inline tools wrap the selection.
    const lineStart = block
      ? description.lastIndexOf('\n', selectionStart - 1) + 1
      : selectionStart
    const head = description.slice(0, block ? lineStart : selectionStart)
    const body = block
      ? description.slice(lineStart, selectionEnd)
      : `${before}${selected}${after}`
    const next = block
      ? `${head}${before}${body}${description.slice(selectionEnd)}`
      : `${head}${body}${description.slice(selectionEnd)}`

    setDescription(next)
    const caret = block
      ? selectionEnd + before.length
      : selectionStart + before.length + selected.length
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(caret, caret)
    })
  }

  return (
    <form action={action} className="flex flex-col gap-5">
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

      <input type="hidden" name="description" value={description} />

      <Tabs defaultValue="write" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Описание</Label>
          <TabsList>
            <TabsTrigger value="write">Написать</TabsTrigger>
            <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1">
            {TOOLS.map((tool) => (
              <Button
                key={tool.label}
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={tool.label}
                title={tool.label}
                onClick={() => applyWrap(tool.wrap)}
              >
                <tool.icon className="size-3.5" />
              </Button>
            ))}
            <span className="ml-1 font-mono text-xs text-muted-foreground">
              Markdown
            </span>
          </div>
          <Textarea
            id="description"
            ref={textareaRef}
            rows={12}
            className="font-mono text-sm"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </TabsContent>

        <TabsContent value="preview">
          <div className="min-h-64 rounded-lg border border-border bg-card px-4 py-3">
            {description ? (
              <Markdown>{description}</Markdown>
            ) : (
              <p className="text-sm text-muted-foreground">Нечего показать</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-5 sm:grid-cols-2">
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
      </div>

      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-2 border-t border-border bg-background/90 px-6 py-3 backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          render={<Link href="/admin/vacancies" />}
        >
          Отмена
        </Button>
        <SaveButton />
      </div>
    </form>
  )
}

/** Guards against the double-click duplicate: the action stays pending until the redirect. */
function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Сохраняем…' : 'Сохранить'}
    </Button>
  )
}
