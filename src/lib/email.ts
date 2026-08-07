import { Resend } from 'resend'

/** Resend's shared sandbox sender. It only delivers to the account owner's address. */
const SANDBOX_FROM = 'onboarding@resend.dev'

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || SANDBOX_FROM

export type SendResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'sandbox_recipient' | 'failed' }

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

/**
 * Applicant-supplied values (name, email, free-text citizenship) end up inside the
 * message body, so every interpolation goes through this. Without it a name like
 * `Иван <Петров>` silently mangles the mail, and worse payloads are possible.
 */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function siteUrl() {
  const base = process.env.NEXT_PUBLIC_SITE_URL
  // A relative href in an email client resolves against nothing — drop the link instead.
  return base && /^https?:\/\//.test(base) ? base.replace(/\/$/, '') : null
}

/** Resend resolves rather than throws on API errors, so `error` must be read explicitly. */
async function send(
  payload: Parameters<Resend['emails']['send']>[0],
  context: string,
): Promise<SendResult> {
  const resend = getResendClient()
  if (!resend) return { ok: false, reason: 'not_configured' }

  try {
    const { error } = await resend.emails.send(payload)
    if (error) {
      console.error(`[email] ${context} failed:`, error.name, error.message)
      return { ok: false, reason: 'failed' }
    }
    return { ok: true }
  } catch (cause) {
    console.error(`[email] ${context} threw:`, cause)
    return { ok: false, reason: 'failed' }
  }
}

export async function sendAdminNewApplicationEmail(params: {
  vacancyTitle: string
  vacancyId: string
  candidateName: string
  candidateEmail: string
}): Promise<SendResult> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
  if (!adminEmail) return { ok: false, reason: 'not_configured' }

  const title = escapeHtml(params.vacancyTitle)
  const name = escapeHtml(params.candidateName)
  const email = escapeHtml(params.candidateEmail)
  const base = siteUrl()
  const link = base
    ? `<p><a href="${base}/admin/vacancies/${params.vacancyId}/candidates">Посмотреть в админке</a></p>`
    : ''

  return send(
    {
      from: FROM_ADDRESS,
      to: adminEmail,
      // Lets the recruiter hit Reply and land in the applicant's inbox.
      replyTo: params.candidateEmail,
      subject: `Новый отклик: ${params.vacancyTitle}`,
      text: [
        `Новый отклик на вакансию «${params.vacancyTitle}».`,
        `Кандидат: ${params.candidateName} (${params.candidateEmail})`,
        base ? `${base}/admin/vacancies/${params.vacancyId}/candidates` : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
      html: `
        <p>Новый отклик на вакансию «${title}».</p>
        <p>Кандидат: ${name} (${email})</p>
        ${link}
      `,
    },
    'admin notification',
  )
}

export async function sendCandidateConfirmationEmail(params: {
  candidateName: string
  candidateEmail: string
  vacancyTitle: string
}): Promise<SendResult> {
  // On the sandbox sender Resend rejects every recipient except the account owner.
  // Skipping deliberately keeps the logs clean and the failure honest.
  if (FROM_ADDRESS === SANDBOX_FROM) {
    return { ok: false, reason: 'sandbox_recipient' }
  }

  const name = escapeHtml(params.candidateName)
  const title = escapeHtml(params.vacancyTitle)

  return send(
    {
      from: FROM_ADDRESS,
      to: params.candidateEmail,
      subject: 'Мы получили ваш отклик',
      text: `Здравствуйте, ${params.candidateName}!\n\nМы получили ваш отклик на вакансию «${params.vacancyTitle}». Если резюме подойдёт, HR свяжется с вами.`,
      html: `
        <p>Здравствуйте, ${name}!</p>
        <p>Мы получили ваш отклик на вакансию «${title}». Если резюме подойдёт, HR свяжется с вами.</p>
      `,
    },
    'candidate confirmation',
  )
}

/** True once mail can actually leave the building — used to gate UI copy. */
export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY)
}

export function canEmailCandidates() {
  return isEmailConfigured() && FROM_ADDRESS !== SANDBOX_FROM
}
