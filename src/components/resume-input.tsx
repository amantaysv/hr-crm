'use client'

import { useRef, useState } from 'react'
import { FileText, Paperclip, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RESUME_ACCEPT, formatFileSize, validateResume } from '@/lib/upload'

export function ResumeInput({
  file,
  onChange,
  error,
  disabled,
  describedBy,
}: {
  file: File | null
  onChange: (file: File | null, error: string | null) => void
  error?: string | null
  disabled?: boolean
  describedBy?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function accept(next: File | undefined) {
    if (!next) return
    const problem = validateResume(next)
    onChange(problem ? null : next, problem)
  }

  if (file) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3',
          error && 'border-destructive',
        )}
      >
        <FileText className="size-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)} · готово к отправке
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => {
            onChange(null, null)
            if (inputRef.current) inputRef.current.value = ''
          }}
        >
          <X className="size-3.5" />
          Заменить
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={RESUME_ACCEPT}
          className="hidden"
          onChange={(event) => accept(event.target.files?.[0])}
        />
      </div>
    )
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        if (!disabled) accept(event.dataTransfer.files?.[0])
      }}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border border-dashed border-input px-4 py-8 text-center transition-colors',
        dragging && 'border-primary bg-accent',
        error && 'border-destructive',
        disabled && 'opacity-50',
      )}
    >
      <Paperclip className="size-5 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">Перетащите файл или выберите</p>
        <p className="text-xs text-muted-foreground">
          PDF · DOC · DOCX · до 10 МБ
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        aria-describedby={describedBy}
        onClick={() => inputRef.current?.click()}
      >
        Выбрать файл
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={RESUME_ACCEPT}
        className="hidden"
        onChange={(event) => accept(event.target.files?.[0])}
      />
    </div>
  )
}
