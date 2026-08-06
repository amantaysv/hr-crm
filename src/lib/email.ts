import { Resend } from 'resend'

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

export async function sendAdminNewApplicationEmail(params: {
  vacancyTitle: string
  vacancyId: string
  candidateName: string
  candidateEmail: string
}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
  const resend = getResendClient()
  if (!resend || !adminEmail) return

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: adminEmail,
    subject: `Новый отклик: ${params.vacancyTitle}`,
    html: `
      <p>Новый отклик на вакансию «${params.vacancyTitle}».</p>
      <p>Кандидат: ${params.candidateName} (${params.candidateEmail})</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/vacancies/${params.vacancyId}/candidates">Посмотреть в админке</a></p>
    `,
  })
}

export async function sendCandidateConfirmationEmail(params: {
  candidateName: string
  candidateEmail: string
  vacancyTitle: string
}) {
  const resend = getResendClient()
  if (!resend) return

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: params.candidateEmail,
    subject: 'Мы получили ваш отклик',
    html: `
      <p>Здравствуйте, ${params.candidateName}!</p>
      <p>Мы получили ваш отклик на вакансию «${params.vacancyTitle}» и скоро свяжемся с вами.</p>
    `,
  })
}
