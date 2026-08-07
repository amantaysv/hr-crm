# Кызмат - Вакансии — статус проекта

## Сделано

- Каркас: Next.js (App Router, TypeScript) + Tailwind CSS
- Prettier + ESLint (`eslint-config-prettier`) настроены, `npm run lint` / `npm run format`
- Supabase: таблицы `vacancies`, `candidates`, RLS-политики, приватный bucket `resumes` (`supabase/migration.sql`)
- Публичная часть: список открытых вакансий (`/`), карточка вакансии + форма отклика (`/vacancies/[id]`)
- Админка (защищена логином через `src/proxy.ts`):
  - вход по email/паролю (`/admin/login`)
  - CRUD вакансий (`/admin/vacancies`) со счётчиком откликов и «новых» у каждой вакансии
  - кандидаты по вакансии: таблица + боковая панель, фильтры сохраняются в URL (`/admin/vacancies/[id]/candidates`)
- Email-уведомления через Resend (`src/lib/email.ts`, `/api/notify-application`)
  - код готов, но **выключен**, пока не задан `RESEND_API_KEY` — см. раздел ниже
- Редизайн по `DESIGN_BRIEF.md` перенесён: токены `oklch` для светлой и тёмной темы, цвета воронки статусов, компоненты shadcn/Base UI (Button, Input, Textarea, Label, Select, Card, Alert, Badge, Table, Sheet, Tabs, Progress, Skeleton)
  - `scripts/check-tokens.mjs` проверяет все цветовые токены на попадание в sRGB и контраст по WCAG — `node scripts/check-tokens.mjs`
- Форма отклика — три шага с валидацией по шагу, экран проверки, реальный прогресс загрузки резюме, состояние успеха
- Тёмная тема: переключатель + системная настройка, `dark:` привязан к `data-theme` через `@custom-variant`

## Осталось сделать

### Resend

- [ ] Завести аккаунт на resend.com, создать API-ключ, положить в `RESEND_API_KEY` в `.env.local`
- [ ] Указать `ADMIN_NOTIFICATION_EMAIL` — на этот адрес приходят уведомления о новых откликах
- [ ] Применить `supabase/migration_006_notification_state.sql` (колонка `notified_at` — защита от повторной отправки)
- [ ] Верифицировать домен организации в Resend и прописать `RESEND_FROM_EMAIL=hr@ваш-домен.kg`
  - до этого `RESEND_FROM_EMAIL` остаётся песочницей `onboarding@resend.dev`, с которой Resend доставляет **только на почту владельца аккаунта**
  - письмо кандидату в этом режиме сознательно не отправляется (`sendCandidateConfirmationEmail` возвращает `sandbox_recipient`), чтобы не копить ошибки доставки
  - после верификации домена вернуть на экран успеха формы формулировку про копию письма (`src/components/application-form.tsx`)

### Прочее

- [ ] Задеплоить проект (Vercel/другой хостинг) и обновить `NEXT_PUBLIC_SITE_URL`
      (без абсолютного URL ссылка «Посмотреть в админке» из письма не подставляется)
- [ ] Список вакансий в админке: показывать дату создания в карточке

## Идеи на будущее (не в скоупе ТЗ)

- Фильтры/поиск по вакансиям в админке
- Несколько админов с ролями
- Экспорт списка кандидатов (CSV)
- Автосохранение черновика в редакторе вакансии
