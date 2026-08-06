# Кызмат - Вакансии — статус проекта

## Сделано

- Каркас: Next.js (App Router, TypeScript) + Tailwind CSS
- Prettier + ESLint (`eslint-config-prettier`) настроены, `npm run lint` / `npm run format`
- Supabase: таблицы `vacancies`, `candidates`, RLS-политики, приватный bucket `resumes` (`supabase/migration.sql`)
- Публичная часть: список открытых вакансий (`/`), карточка вакансии + форма отклика с загрузкой резюме (`/vacancies/[id]`)
- Админка (защищена логином через `src/proxy.ts`):
  - вход по email/паролю (`/admin/login`)
  - CRUD вакансий (`/admin/vacancies`)
  - список кандидатов по вакансии со сменой статуса (мини-ATS) и ссылкой на резюме (`/admin/vacancies/[id]/candidates`)
- Email-уведомления через Resend: письмо админу о новом отклике + подтверждение кандидату (`src/lib/email.ts`, `/api/notify-application`)
  - код готов, но **выключен**, пока не заданы `RESEND_API_KEY` / `ADMIN_NOTIFICATION_EMAIL`
- Визуал: подключён shadcn/ui (Button, Input, Textarea, Label, Select, Card, Alert) на всех страницах, палитра neutral/zinc, тёмная тема — по системной настройке ОС, без переключателя

## Осталось сделать

- [ ] Завести аккаунт на resend.com, получить `RESEND_API_KEY`
- [ ] Указать `ADMIN_NOTIFICATION_EMAIL` в `.env.local`
- [ ] Решить вопрос с доменом для отправки: без верификации своего домена в Resend письма кандидатам не уйдут (только на email владельца аккаунта) — либо верифицировать домен, либо ограничиться уведомлением только админу
- [ ] Задеплоить проект (Vercel/другой хостинг) и обновить `NEXT_PUBLIC_SITE_URL`

## Идеи на будущее (не в скоупе ТЗ)

- Фильтры/поиск по вакансиям в админке
- Несколько админов с ролями
- Экспорт списка кандидатов (CSV)
