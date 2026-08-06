'use client'

import { useRef } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CandidateStatusForm({
  action,
  vacancyId,
  defaultValue,
  options,
}: {
  action: (formData: FormData) => void
  vacancyId: string
  defaultValue: string
  options: { value: string; label: string }[]
}) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="vacancy_id" value={vacancyId} />
      <Select
        name="status"
        defaultValue={defaultValue}
        onValueChange={() => formRef.current?.requestSubmit()}
      >
        <SelectTrigger size="sm">
          <SelectValue>
            {(value: string) =>
              options.find((option) => option.value === value)?.label
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  )
}
