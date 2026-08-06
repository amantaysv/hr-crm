import Link from 'next/link'
import { Briefcase, LogOut } from 'lucide-react'
import { signOut } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link
          href="/admin/vacancies"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <Briefcase className="size-4" />
          Кызмат - Вакансии · Админка
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="size-4" />
              Выйти
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
        {children}
      </main>
    </div>
  )
}
