import Link from 'next/link'
import { Briefcase } from 'lucide-react'
import { signIn } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <Link
        href="/"
        className="flex items-center justify-center gap-2 text-sm font-semibold tracking-tight"
      >
        <Briefcase className="size-4" />
        Кызмат - Вакансии
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Вход в админку</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signIn} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>Неверный email или пароль</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="mt-2">
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
