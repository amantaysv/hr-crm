import Link from 'next/link'
import { CircleAlert } from 'lucide-react'
import { signIn } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <Link href="/" className="flex items-center justify-center gap-2.5">
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-lg bg-primary font-heading text-sm font-semibold text-primary-foreground"
        >
          К
        </span>
        <span className="font-heading font-semibold tracking-tight">
          Кызмат
          <span className="font-normal text-muted-foreground"> · Вакансии</span>
        </span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Вход в админку</CardTitle>
          <p className="text-sm text-muted-foreground">
            Управление вакансиями и откликами
          </p>
        </CardHeader>
        <CardContent>
          <form action={signIn} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>Неверный email или пароль</AlertDescription>
              </Alert>
            )}

            <Button type="submit" size="lg" className="mt-2">
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
