export function SiteFooter() {
  const year = new Date().getFullYear()
  const contactEmail = process.env.ADMIN_NOTIFICATION_EMAIL

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-1 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {year} Кызмат · Вакансии</p>
        {contactEmail && (
          <a href={`mailto:${contactEmail}`} className="hover:text-foreground">
            Вопросы: {contactEmail}
          </a>
        )}
      </div>
    </footer>
  )
}
