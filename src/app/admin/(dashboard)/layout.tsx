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
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-6 py-3 backdrop-blur-sm">
        <Link
          href="/admin/vacancies"
          className="flex items-center gap-2.5 font-heading font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <Briefcase className="size-3.5" />
          </span>
          <span>
            Кызмат
            <span className="font-normal text-muted-foreground">
              {' '}
              · Админка
            </span>
          </span>
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
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
        {children}
      </main>
    </div>
  )
}
