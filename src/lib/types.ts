export type VacancyStatus = 'open' | 'closed'

export type StartDateOption = 'asap' | '1_week' | '2_weeks' | 'other'

export const START_DATE_OPTIONS: { value: StartDateOption; label: string }[] = [
  { value: 'asap', label: 'Сразу' },
  { value: '1_week', label: 'Через неделю' },
  { value: '2_weeks', label: 'Через 2 недели' },
  { value: 'other', label: 'Другое' },
]

export type CitizenshipOption = 'kyrgyzstan' | 'other'

export const CITIZENSHIP_OPTIONS: {
  value: CitizenshipOption
  label: string
}[] = [
  { value: 'kyrgyzstan', label: 'Кыргызстан' },
  { value: 'other', label: 'Другое' },
]

export type Education = 'higher' | 'vocational' | 'course_certificate' | 'none'

export const EDUCATION_OPTIONS: { value: Education; label: string }[] = [
  { value: 'higher', label: 'Высшее' },
  { value: 'vocational', label: 'Средне-специальное' },
  { value: 'course_certificate', label: 'Сертификат об окончании курсов' },
  { value: 'none', label: 'Нет' },
]

export const EDUCATION_LABELS: Record<Education, string> = {
  higher: 'Высшее',
  vocational: 'Средне-специальное',
  course_certificate: 'Сертификат об окончании курсов',
  none: 'Нет',
}

export type CandidateStatus =
  'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'

export const CANDIDATE_STATUSES: CandidateStatus[] = [
  'new',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
]

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  new: 'Новый',
  screening: 'На рассмотрении',
  interview: 'Собеседование',
  offer: 'Оффер',
  hired: 'Нанят',
  rejected: 'Отказ',
}

export type CandidateStatusVariant = `status-${CandidateStatus}`

/** Badge variant per funnel stage. Colours live in globals.css as --status-* tokens. */
export const CANDIDATE_STATUS_VARIANTS: Record<
  CandidateStatus,
  CandidateStatusVariant
> = {
  new: 'status-new',
  screening: 'status-screening',
  interview: 'status-interview',
  offer: 'status-offer',
  hired: 'status-hired',
  rejected: 'status-rejected',
}

/** Tailwind needs these spelled out — `bg-status-${s}-dot` is not statically extractable. */
export const CANDIDATE_STATUS_DOTS: Record<CandidateStatus, string> = {
  new: 'bg-status-new-dot',
  screening: 'bg-status-screening-dot',
  interview: 'bg-status-interview-dot',
  offer: 'bg-status-offer-dot',
  hired: 'bg-status-hired-dot',
  rejected: 'bg-status-rejected-dot',
}

export interface Vacancy {
  id: string
  title: string
  description: string
  salary: string
  status: VacancyStatus
  created_at: string
}

export interface Candidate {
  id: string
  vacancy_id: string
  name: string
  email: string
  phone: string
  expected_salary: number | null
  start_date_option: StartDateOption
  start_date_other: string | null
  citizenship: string
  education: Education
  portfolio_url: string | null
  resume_path: string
  status: CandidateStatus
  created_at: string
  /** Set once the new-application notification was dispatched. See migration_006. */
  notified_at: string | null
}
