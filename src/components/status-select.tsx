'use client'

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
  return (
    <form>
      <Select
        name="status"
        defaultValue={defaultValue}
        onValueChange={(value: string | null) => {
          if (!value) return
          const formData = new FormData()
          formData.set('status', value)
          formData.set('vacancy_id', vacancyId)
          action(formData)
        }}
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
