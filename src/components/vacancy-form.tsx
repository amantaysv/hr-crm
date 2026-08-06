import type { Vacancy } from '@/lib/types'

export function VacancyForm({
  vacancy,
  action,
}: {
  vacancy?: Vacancy
  action: (formData: FormData) => void
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Название
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={vacancy?.title}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Описание
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={vacancy?.description}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="requirements" className="text-sm font-medium">
          Требования
        </label>
        <textarea
          id="requirements"
          name="requirements"
          rows={5}
          defaultValue={vacancy?.requirements}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="location" className="text-sm font-medium">
          Город / локация
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={vacancy?.location}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="employment_type" className="text-sm font-medium">
          Тип занятости
        </label>
        <input
          id="employment_type"
          name="employment_type"
          type="text"
          placeholder="Полная занятость, удалённо..."
          defaultValue={vacancy?.employment_type}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-sm font-medium">
          Статус
        </label>
        <select
          id="status"
          name="status"
          defaultValue={vacancy?.status ?? 'open'}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="open">Открыта</option>
          <option value="closed">Закрыта</option>
        </select>
      </div>

      <button
        type="submit"
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Сохранить
      </button>
    </form>
  )
}
